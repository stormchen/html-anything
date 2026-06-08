

import { InvokeEvent } from "./invoke";

/**
 * 動態偵測遠端相容 OpenAI /v1 介面的伺服器當前加載的 active model。
 * 支援 MLX-VLM 的 /health 端點與標準 OpenAI 的 /v1/models 端點。
 */
async function getActiveV1Model(baseUrl: string): Promise<string | null> {
  try {
    // 1. 嘗試從 /health 端點取得當前載入的模型 (MLX-VLM 特有)
    const healthRes = await fetch(`${baseUrl}/health`, { signal: AbortSignal.timeout(1500) });
    if (healthRes.ok) {
      const data = await healthRes.json();
      if (data && data.loaded_model) {
        return data.loaded_model;
      }
    }
  } catch (e) {
    // 忽略錯誤，嘗試下一個端點
  }

  try {
    // 2. 嘗試從 /v1/models 取得模型列表並使用第一個 (標準 OpenAI 端點)
    const modelsRes = await fetch(`${baseUrl}/v1/models`, { signal: AbortSignal.timeout(1500) });
    if (modelsRes.ok) {
      const data = await modelsRes.json();
      if (data && data.data && Array.isArray(data.data) && data.data.length > 0) {
        return data.data[0].id;
      }
    }
  } catch (e) {
    // 忽略錯誤
  }

  return null;
}


/**
 * Directly invokes Ollama via its local HTTP API.
 * This skips the need for any CLI binary or path configuration.
 */
export function invokeOllamaNative(opts: {
  model?: string;
  prompt: string;
  signal?: AbortSignal;
  host?: string;
}): ReadableStream<InvokeEvent> {
  const model = opts.model || "qwen2.5-coder:7b";
  const baseUrl = (opts.host?.trim() || "http://localhost:11434").replace(/\/$/, "");
  
  // Use a local abort controller that responds to the passed signal
  const controller = new AbortController();
  if (opts.signal) {
    if (opts.signal.aborted) controller.abort();
    else opts.signal.addEventListener("abort", () => controller.abort());
  }


  return new ReadableStream<InvokeEvent>({
    async start(enqueueController) {
      const safeEnqueue = (ev: InvokeEvent) => {
        try {
          enqueueController.enqueue(ev);
        } catch {
          // controller already closed
        }
      };

      try {
        const isV1 = baseUrl.includes(":8080") || baseUrl.includes("/v1");
        
        // 如果是 OpenAI/MLX-VLM 端點，且使用者未指定特定模型 (使用 default 或未傳)，我們動態偵測當前載入的模型
        let activeModel = model;
        if (isV1 && (!opts.model || opts.model === "default" || opts.model === "qwen2.5-coder:7b")) {
          const detectedModel = await getActiveV1Model(baseUrl);
          if (detectedModel) {
            activeModel = detectedModel;
          }
        }

        console.log(`[Local AI] Connecting to ${baseUrl} with model ${activeModel}`);
        const endpoint = isV1 ? `${baseUrl}/v1/chat/completions` : `${baseUrl}/api/generate`;
        
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(isV1 ? {
            model: activeModel,
            messages: [{ role: "user", content: opts.prompt }],
            stream: true,
            max_tokens: 8192,
            temperature: 0.3,
          } : {
            model: activeModel,
            prompt: opts.prompt,
            stream: true,
            options: { num_predict: 8192 },
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`AI API error: ${response.statusText}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("Response body is empty");

        const decoder = new TextDecoder();
        let buffer = "";
        let streamDone = false;

        while (!streamDone) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            
            let delta = "";
            
            // Handle OpenAI stream format: "data: {...}"
            const v1Match = trimmed.match(/^data:\s*(.*)$/);
            if (isV1 && v1Match) {
              const dataStr = v1Match[1].trim();
              if (dataStr === "[DONE]") {
                // 收到串流結束信號，立刻離開迴圈
                streamDone = true;
                break;
              }
              try {
                const json = JSON.parse(dataStr);
                delta = json.choices?.[0]?.delta?.content || "";
                // finish_reason = stop 也代表結束
                if (json.choices?.[0]?.finish_reason === "stop") {
                  streamDone = true;
                }
              } catch (e) {}
            } else {
              // Handle Ollama format
              try {
                const json = JSON.parse(trimmed);
                delta = json.response || "";
                if (json.done) {
                  streamDone = true;
                }
              } catch (e) {}
            }

            if (delta) {
              // Clean up markdown fences if AI adds them
              if (delta.includes("```")) {
                delta = delta.replace(/```(html|)/g, "").replace(/```/g, "");
              }
              safeEnqueue({ type: "delta", text: delta });
            }

            if (streamDone) break;
          }
        }

        // 取消讀取（若 MLX-VLM 沒有主動關閉連線）
        try { reader.cancel(); } catch {}

        // Flush any remaining buffered line that didn't end with \n
        if (buffer.trim()) {
          const trimmed = buffer.trim();
          let delta = "";
          const v1Match = trimmed.match(/^data:\s*(.*)$/);
          if (isV1 && v1Match) {
            const dataStr = v1Match[1].trim();
            if (dataStr !== "[DONE]") {
              try {
                const json = JSON.parse(dataStr);
                delta = json.choices?.[0]?.delta?.content || "";
              } catch (e) {}
            }
          } else {
            try {
              const json = JSON.parse(trimmed);
              delta = json.response || "";
            } catch (e) {}
          }
          if (delta) {
            if (delta.includes("```")) delta = delta.replace(/```(html)?/g, "");
            safeEnqueue({ type: "delta", text: delta });
          }
        }

        // 統一在這裡送出 done，不在迴圈內送
        safeEnqueue({ type: "done", code: 0 });
      } catch (err: any) {
        if (err.name === "AbortError") return;
        safeEnqueue({
          type: "error",
          message: err.message || "Failed to connect to Ollama. Make sure Ollama is running at http://localhost:11434",
        });
      } finally {
        try {
          enqueueController.close();
        } catch {}
      }
    },
  });
}

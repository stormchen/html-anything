

import { InvokeEvent } from "./invoke";

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
        console.log(`[Local AI] Connecting to ${baseUrl} with model ${model}`);
        
        // Check if we should use OpenAI chat completions format (MLX-VLM / v1)
        // We'll peek at the models endpoint or just assume based on common local AI ports
        const isV1 = baseUrl.includes(":8080") || baseUrl.includes("/v1");
        const endpoint = isV1 ? `${baseUrl}/v1/chat/completions` : `${baseUrl}/api/generate`;
        
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(isV1 ? {
            model: model,
            messages: [{ role: "user", content: opts.prompt }],
            stream: true,
            max_tokens: 8192,
            temperature: 0.3,
          } : {
            model: model,
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
            if (isV1 && trimmed.startsWith("data: ")) {
              const dataStr = trimmed.slice(6);
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
          if (isV1 && trimmed.startsWith("data: ")) {
            const dataStr = trimmed.slice(6);
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

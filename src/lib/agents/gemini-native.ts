import { InvokeEvent } from "./invoke";

/**
 * Directly invokes Google Gemini API via HTTPS stream.
 * This allows using Gemini without any CLI binary installation.
 */
export function invokeGeminiNative(opts: {
  model?: string;
  prompt: string;
  signal?: AbortSignal;
  apiKey: string;
}): ReadableStream<InvokeEvent> {
  // Map friendly/display model IDs to the exact API model names
  let model = opts.model || "gemini-2.5-pro";
  if (model === "default") {
    model = "gemini-2.5-pro";
  }

  const apiKey = opts.apiKey.trim();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${apiKey}`;

  // Set up abort control
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
          // stream already closed
        }
      };

      try {
        
        const generationConfig: any = {};

        // Configure based on model generation
        if (model.includes("3.6") || model.includes("3.5") || model.includes("3.0")) {
          // Gemini 3.6+ supports 64K output token limit (65,536) and deprecates temperature/top_p
          generationConfig.maxOutputTokens = 65536;
          generationConfig.thinkingConfig = {
            thinkingLevel: "MEDIUM" // Default to MEDIUM reasoning depth
          };
        } else {
          // Older 1.5 / 2.5 models
          generationConfig.maxOutputTokens = 8192;
          generationConfig.temperature = 0.3;

          if (model.includes("2.5")) {
            generationConfig.thinkingConfig = {
              thinkingBudget: 0 // Disable thinking for 2.5 models to free up code budget
            };
          }
        }

        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: opts.prompt,
                  },
                ],
              },
            ],
            generationConfig,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const errMsg = await response.text().catch(() => response.statusText);
          throw new Error(`Gemini API error ${response.status}: ${errMsg}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("Response body is empty");

        const decoder = new TextDecoder();
        let buffer = "";
        
        // Scan states tracked across chunks
        let scanIdx = 0;
        let braceCount = 0;
        let startIdx = -1;
        let inString = false;
        let escapeNext = false;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          
          while (scanIdx < buffer.length) {
            const char = buffer[scanIdx];
            
            if (escapeNext) {
              escapeNext = false;
            } else if (char === "\\") {
              if (inString) {
                escapeNext = true;
              }
            } else if (char === '"') {
              inString = !inString;
            } else if (!inString) {
              if (char === "{") {
                if (braceCount === 0) {
                  startIdx = scanIdx;
                }
                braceCount++;
              } else if (char === "}") {
                braceCount--;
                if (braceCount === 0 && startIdx !== -1) {
                  const jsonStr = buffer.slice(startIdx, scanIdx + 1);
                  try {
                    const json = JSON.parse(jsonStr);
                    const candidate = json.candidates?.[0];
                    let text = candidate?.content?.parts?.[0]?.text || "";
                    if (text) {
                      // Clean up markdown fences if AI adds them
                      if (text.includes("```")) {
                        text = text.replace(/```(html|)/g, "").replace(/```/g, "");
                      }
                      safeEnqueue({ type: "delta", text });
                    }
                  } catch (e) {
                    console.error("[Gemini Parser Error] failed to parse slice:", e);
                  }
                  
                  // Keep only the remaining part of the buffer
                  buffer = buffer.slice(scanIdx + 1);
                  scanIdx = -1; // reset scan index to start of new buffer
                  startIdx = -1;
                  inString = false;
                  escapeNext = false;
                }
              }
            }
            scanIdx++;
          }
        }

        // Close reader cleanly
        try { reader.cancel(); } catch {}

        safeEnqueue({ type: "done", code: 0 });
      } catch (err: any) {
        if (err.name === "AbortError") {
          return;
        }
        console.error(`[Gemini API] Error during generation:`, err);
        safeEnqueue({
          type: "error",
          message: err.message || "Failed to call Gemini API. Please check your network and API key.",
        });
      } finally {
        try {
          enqueueController.close();
        } catch {}
      }
    },
  });
}

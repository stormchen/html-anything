import { NextRequest } from "next/server";
import { invokeAgent } from "@/lib/agents/invoke";
import { loadSkill } from "@/lib/templates/loader";
import { assemblePrompt } from "@/lib/templates/shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = {
  agent: string;
  templateId: string;
  content: string;
  format?: string;
  model?: string;
  cwd?: string;
  /**
   * Optional absolute path to the agent binary. The Settings UI lets the
   * user override auto-detection when their CLI lives somewhere our PATH
   * scan doesn't cover (Scoop on Windows, custom installs, etc.).
   */
  binOverride?: string;
  /** When the task already has a generated HTML, the client sends both the
   *  prior HTML and the prior content. The agent is then asked for a
   *  minimal-diff edit (preserve design, only change what the content diff
   *  implies). Saves output tokens AND prevents creative drift between runs. */
  editFromHtml?: string;
  editFromContent?: string;
};

function buildEditPrompt(args: {
  templateName: string;
  templateAspect: string;
  newContent: string;
  oldContent: string;
  oldHtml: string;
  format: string;
}): string {
  return `你正在执行一次**最小化差异编辑** (diff-edit), 不是从 0 重新生成。

模板风格: ${args.templateName} (${args.templateAspect})
输入格式: ${args.format}

【硬性规则】
1. 仅输出完整的、修改后的 HTML。第一个字符必须是 \`<\`, 最后必须是 \`</html>\`。
2. **不要**用 markdown 围栏包裹, 不要任何解释性文字。
3. **禁止使用 Write / Edit / MultiEdit / Bash 等文件工具** — HTML 必须直接在助手回复正文里流式输出, 不要存到 \`.html\` 文件再回复"已输出至 …"。
4. 保留原 HTML 的 \`<head>\` (CDN / 字体 / 样式 / meta), 保留所有不需要变化的 DOM 结构 — 字体、配色、布局、栅格、组件结构、动画都不许改。
5. 仅根据 "旧内容 vs 新内容" 的差异, 替换或调整对应的文字 / 数据节点。
6. 如果新内容增加了条目, 沿用原有的卡片 / 行 / slide / 章节结构添加; 如果删除了条目, 移除对应的元素。
7. 如果新旧内容只差几个字, 也只改那几个字 — 不要顺手 "优化" 或 "重排"。
8. 不要捏造数据。新内容里没有的就不要写。

【旧内容】
${args.oldContent}

【新内容】
${args.newContent}

【已有 HTML — 请基于此修改, 输出完整的修改后版本】
${args.oldHtml}
`;
}

function cleanHtmlFences(html: string): string {
  let cleaned = html.trim();
  cleaned = cleaned.replace(/^```html\s*/i, "");
  cleaned = cleaned.replace(/^```\s*/, "");
  cleaned = cleaned.replace(/```$/, "");
  return cleaned.trim();
}

function countSlides(html: string): number {
  if (!html) return 0;
  const matches = html.match(/<section\b[^>]*\bclass\s*=\s*["'][^"']*\bslide\b[^"']*/gi);
  return matches ? matches.length : 0;
}

function getLastFewSlides(html: string, count: number): string {
  if (!html) return "";
  const matches = html.match(/<section\b[^>]*\bclass\s*=\s*["'][^"']*\bslide\b[^"']*["'][^>]*>[\s\S]*?<\/section>/gi);
  if (!matches || matches.length === 0) return "";
  return matches.slice(-count).join("\n\n");
}

function appendSlides(baseHtml: string, newSlides: string): string {
  const cleanedSlides = cleanHtmlFences(newSlides);
  const idx = baseHtml.toLowerCase().lastIndexOf("</section>");
  if (idx !== -1) {
    const insertPos = idx + "</section>".length;
    return baseHtml.slice(0, insertPos) + "\n" + cleanedSlides + "\n" + baseHtml.slice(insertPos);
  }
  const bodyIdx = baseHtml.toLowerCase().lastIndexOf("</body>");
  if (bodyIdx === -1) {
    return baseHtml + "\n" + cleanedSlides;
  }
  return baseHtml.slice(0, bodyIdx) + "\n" + cleanedSlides + "\n" + baseHtml.slice(bodyIdx);
}

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return new Response("invalid JSON body", { status: 400 });
  }
  const {
    agent,
    templateId,
    content,
    format = "text",
    model,
    cwd,
    binOverride,
    editFromHtml,
    editFromContent,
  } = body;
  console.log("[DEBUG] API /api/convert received:", { agent, templateId, format, binOverride });
  if (!agent || !templateId || !content) {
    return new Response("missing required fields: agent, templateId, content", {
      status: 400,
    });
  }
  const skill = loadSkill(templateId);
  if (!skill) {
    return new Response(`unknown template: ${templateId}`, { status: 400 });
  }

  const isSlideDeck = skill.category === "slides";

  let prompt: string;
  if (editFromHtml && editFromContent) {
    prompt = buildEditPrompt({
      templateName: skill.zhName,
      templateAspect: skill.aspectHint,
      newContent: content,
      oldContent: editFromContent,
      oldHtml: editFromHtml,
      format,
    });
  } else {
    prompt = assemblePrompt({ body: skill.body, content, format });
  }
  const abortCtl = new AbortController();
  req.signal?.addEventListener("abort", () => abortCtl.abort(), { once: true });

  const sse = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      let outClosed = false;
      const send = (event: string, data: unknown) => {
        if (outClosed) return;
        try {
          controller.enqueue(
            enc.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
          );
        } catch {
          outClosed = true;
        }
      };

      const safeClose = () => {
        if (outClosed) return;
        outClosed = true;
        try {
          controller.close();
        } catch {}
      };

      if (isSlideDeck) {
        let currentHtml = "";
        let currentSlideCount = 0;
        let baseHtml = "";

        // Loop up to 4 iterations (supporting up to 16 slides total)
        for (let step = 1; step <= 4; step++) {
          if (outClosed || abortCtl.signal.aborted) break;

          let stepPrompt = "";
          if (step === 1) {
            const rawPrompt = assemblePrompt({ body: skill.body, content, format });
            stepPrompt = `${rawPrompt}\n\n【分段生成指令】目前是第 1 階段。請僅生成簡報的第 1 頁至第 4 頁（Slide 1 至 Slide 4）。請輸出包含完整樣式的 HTML，但 <body> 內只保留這 4 頁的 <section class="slide"> 結構。請勿在此階段生成第 5 頁及之後的內容。`;
          } else {
            if (currentSlideCount === 0) break;
            const start = (step - 1) * 4 + 1;
            const end = step * 4;
            const rawPrompt = assemblePrompt({ body: skill.body, content, format });
            const referenceSlides = getLastFewSlides(baseHtml, 2);

            stepPrompt = `${rawPrompt}

---

你正在執行簡報分段生成任務。目前是第 ${step} 階段。
請基於上述大綱和設計規範，僅為簡報生成第 ${start} 頁至第 ${end} 頁（Slide ${start} 至 Slide ${end}）的新投影片。

【先前已生成的投影片參考】
以下是先前階段已生成的投影片 HTML（用於確保新投影片的 CSS Class、色彩方案、標記結構和佈局與之一致，請參考其 class 命名和元素結構）：
${referenceSlides}

【分段生成硬性規則】
1. **僅**輸出新投影片的 HTML 節點。每頁投影片必須是完整的 \`<section class="slide" data-slide-id="...">...</section>\` 結構，包含與上述參考投影片相同的設計風格與 CSS Class。
2. **絕對不要**輸出 \`<!DOCTYPE html>\`、\`<html>\`、\`<head>\`、\`<body>\` 等包裝標籤。
3. **絕對不要**重複輸出先前已生成的第 1 頁至第 ${start - 1} 頁簡報。
4. 第一個字元必須是 \`<\`（通常是 \`<section class="slide ...">\`），最後一個字元必須是 \`</section>\`。
5. 不要包含任何 markdown 圍欄，不要有任何解釋性文字。
6. 確保新生成的投影片使用與先前投影片完全一致的樣式（例如套用樣式中對應的 \`paper\`、\`ikb\` 等設計主題類別，維持一致背景和文字顏色）。
`;
          }

          console.log(`[DEBUG] Segmented Slide Generation - Step ${step} starting...`);
          send("stderr", { text: `\n[系統] 開始自動分段生成 - 第 ${step} 階段...\n` });

          const agentStream = invokeAgent({
            agent,
            prompt: stepPrompt,
            model,
            cwd,
            binOverride,
            signal: abortCtl.signal,
          });

          const reader = agentStream.getReader();
          let accumulatedStdout = "";
          let lastThrottleTime = Date.now();

          try {
            while (true) {
              const { value, done } = await reader.read();
              if (done) break;
              if (!value) continue;

              if (value.type === "delta" && typeof value.text === "string") {
                accumulatedStdout += value.text;

                if (step === 1) {
                  send("delta", value);
                } else {
                  const now = Date.now();
                  if (now - lastThrottleTime > 150) {
                    lastThrottleTime = now;
                    const mergedHtml = appendSlides(baseHtml, accumulatedStdout);
                    send("html", { text: mergedHtml, quiet: true });
                  }
                }
              } else if (value.type === "html" && typeof value.text === "string") {
                accumulatedStdout = value.text;
              } else {
                // Pass metadata, stderr etc through
                if (value.type === "start" && step > 1) continue;
                if (value.type === "done") continue; // Done will be sent manually at the end
                send(value.type, value);
              }
            }

            // Finalize step
            if (step === 1) {
              baseHtml = accumulatedStdout;
            } else {
              baseHtml = appendSlides(baseHtml, accumulatedStdout);
              send("html", { text: baseHtml });
            }

            const newSlideCount = countSlides(baseHtml);
            console.log(`[DEBUG] Step ${step} completed. Slides count: ${newSlideCount}`);

            if (newSlideCount <= currentSlideCount) {
              console.log(`[DEBUG] No new slides added (${newSlideCount} <= ${currentSlideCount}). Ending loop.`);
              send("stderr", { text: `\n[系統] 分段生成結束，共完成 ${newSlideCount} 頁簡報。\n` });
              break;
            }

            currentSlideCount = newSlideCount;
          } catch (err) {
            console.error(`[CRITICAL] Step ${step} error:`, err);
            send("error", { message: err instanceof Error ? err.message : String(err) });
            break;
          }
        }

        send("done", { code: 0 });
        safeClose();
      } else {
        const stream = invokeAgent({
          agent,
          prompt,
          model,
          cwd,
          binOverride,
          signal: abortCtl.signal,
        });

        const reader = stream.getReader();
        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            if (!value) continue;
            send(value.type, value);
          }
        } catch (err) {
          console.error("[CRITICAL] Stream execution failed:", err);
          send("error", {
            message: err instanceof Error ? err.message : String(err),
          });
        } finally {
          safeClose();
        }
      }
    },
    cancel() {
      abortCtl.abort();
    },
  });

  return new Response(sse, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

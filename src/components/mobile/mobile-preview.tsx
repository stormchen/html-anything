"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useStore, selectActiveTask } from "@/lib/store";
import { useTemplates } from "@/lib/templates";
import { useT } from "@/lib/i18n";
import { extractHtml, previewHtml } from "@/lib/extract-html";
import { parseDeck } from "@/lib/deck";
import { useConvertAction } from "@/lib/use-convert-action";

function resolveVirtualWidth(aspectHint?: string, category?: string): number {
  if (category === "slides") return 1920;
  const h = (aspectHint ?? "").toLowerCase();
  if (h.includes("16:9") || h.includes("1920")) return 1920;
  if (h.includes("9:16") || h.includes("3:4") || h.includes("4:5") || h.includes("1:1")) {
    return 860;
  }
  return 1120;
}

export function MobilePreview({
  iframeRef,
  onOpenShare,
}: {
  iframeRef: React.MutableRefObject<HTMLIFrameElement | null>;
  onOpenShare: () => void;
}) {
  const html = useStore((s) => selectActiveTask(s)?.html ?? "");
  const status = useStore((s) => selectActiveTask(s)?.status ?? "idle");
  const templateId = useStore((s) => selectActiveTask(s)?.templateId);
  const templates = useTemplates();
  const tpl = templates?.find((x) => x.id === templateId);
  const t = useT();
  const { canConvert, isRunning, trigger } = useConvertAction();

  const [templateExample, setTemplateExample] = useState("");
  useEffect(() => {
    if (html || status === "running") {
      setTemplateExample("");
      return;
    }
    if (!templateId) return;
    let cancelled = false;
    fetch(`/api/templates/${encodeURIComponent(templateId)}/example`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled) setTemplateExample((data?.html ?? "") as string);
      })
      .catch(() => {
        if (!cancelled) setTemplateExample("");
      });
    return () => {
      cancelled = true;
    };
  }, [templateId, html, status]);

  const effectiveHtml = html || templateExample;
  const isPreviewingTemplate = !html && !!templateExample;

  const [debouncedHtml, setDebouncedHtml] = useState(effectiveHtml);
  useEffect(() => {
    if (status !== "running") {
      setDebouncedHtml(effectiveHtml);
      return;
    }
    const id = setTimeout(() => setDebouncedHtml(effectiveHtml), 320);
    return () => clearTimeout(id);
  }, [effectiveHtml, status]);

  const cleaned = useMemo(() => extractHtml(debouncedHtml), [debouncedHtml]);
  const deck = useMemo(() => parseDeck(cleaned), [cleaned]);
  const display = useMemo(() => previewHtml(debouncedHtml), [debouncedHtml]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const localIframeRef = useRef<HTMLIFrameElement | null>(null);
  const [boxSize, setBoxSize] = useState({ width: 393, height: 640 });
  const [docHeight, setDocHeight] = useState(1400);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setBoxSize({ width: rect.width, height: rect.height });
      }
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    iframeRef.current = localIframeRef.current;
  });

  // Slide deck state & touch swipe
  const [slideIdx, setSlideIdx] = useState(0);
  useEffect(() => {
    if (slideIdx >= deck.slides.length) {
      setSlideIdx(Math.max(0, deck.slides.length - 1));
    }
  }, [deck.slides.length, slideIdx]);

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const virtualWidth = resolveVirtualWidth(tpl?.aspectHint, tpl?.category);
  const scale = Math.min(1, boxSize.width / virtualWidth);

  const measureIframeHeight = () => {
    const ifr = localIframeRef.current;
    const doc = ifr?.contentDocument;
    if (!doc) return;
    const h = Math.max(
      doc.body?.scrollHeight ?? 0,
      doc.documentElement?.scrollHeight ?? 0,
      Math.ceil(boxSize.height / scale),
    );
    if (h > 0) setDocHeight(h);
  };

  useEffect(() => {
    const id = setTimeout(measureIframeHeight, 220);
    return () => clearTimeout(id);
  }, [display, scale, boxSize.height]);

  return (
    <div
      className="flex h-full flex-col"
      style={{ background: "var(--paper)" }}
    >
      <div
        ref={containerRef}
        className="relative flex-1 min-h-0 overflow-y-auto overflow-x-hidden"
      >
        {!effectiveHtml ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
            <div className={`text-5xl ${isRunning ? "shimmer" : ""}`}>
              {isRunning ? "✨" : "🪄"}
            </div>
            <div className="text-[17px] font-semibold text-[var(--ink)]">
              {isRunning
                ? t("preview.status.running")
                : t("preview.placeholder.idleTitle.part1")}
            </div>
            <p className="max-w-xs text-[13px] text-[var(--ink-mute)]">
              {t("preview.placeholder.idleDescr")}
            </p>
          </div>
        ) : deck.isDeck && deck.slides.length > 0 ? (
          <div
            className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden p-2"
            onTouchStart={(e) => {
              touchStartX.current = e.touches[0]?.clientX ?? null;
              touchStartY.current = e.touches[0]?.clientY ?? null;
            }}
            onTouchEnd={(e) => {
              if (touchStartX.current === null || touchStartY.current === null) return;
              const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
              const dy = (e.changedTouches[0]?.clientY ?? 0) - touchStartY.current;
              touchStartX.current = null;
              touchStartY.current = null;
              if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
                if (dx < 0) {
                  setSlideIdx((i) => Math.min(deck.slides.length - 1, i + 1));
                } else {
                  setSlideIdx((i) => Math.max(0, i - 1));
                }
              }
            }}
          >
            {(() => {
              const current = deck.slides[slideIdx] ?? deck.slides[0];
              const availW = Math.max(200, boxSize.width - 16);
              const availH = Math.max(150, boxSize.height - 72);
              const slideScale = Math.min(availW / 1920, availH / 1080);
              const scaledW = Math.round(1920 * slideScale);
              const scaledH = Math.round(1080 * slideScale);

              return (
                <>
                  <div
                    className="relative overflow-hidden rounded-xl shadow-md"
                    style={{
                      width: scaledW,
                      height: scaledH,
                      background: current.bg ?? "#fff",
                      border: "1px solid var(--line-soft)",
                    }}
                  >
                    <iframe
                      key={current.id}
                      ref={(el) => {
                        localIframeRef.current = el;
                        iframeRef.current = el;
                      }}
                      title={`slide-${current.id}`}
                      srcDoc={current.html}
                      sandbox="allow-scripts allow-same-origin"
                      style={{
                        width: 1920,
                        height: 1080,
                        border: 0,
                        transform: `scale(${slideScale})`,
                        transformOrigin: "top left",
                      }}
                    />
                  </div>

                  {deck.slides.length > 1 && (
                    <div className="mt-3 flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => setSlideIdx((i) => Math.max(0, i - 1))}
                        disabled={slideIdx === 0}
                        aria-label={t("deck.prev")}
                        className="grid h-11 w-11 place-items-center rounded-full border text-[18px] disabled:opacity-30"
                        style={{
                          background: "var(--surface)",
                          color: "var(--ink)",
                          borderColor: "var(--line)",
                        }}
                      >
                        ‹
                      </button>
                      <span className="font-mono text-[13px] tabular-nums text-[var(--ink-soft)]">
                        {slideIdx + 1} / {deck.slides.length}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setSlideIdx((i) => Math.min(deck.slides.length - 1, i + 1))
                        }
                        disabled={slideIdx === deck.slides.length - 1}
                        aria-label={t("deck.next")}
                        className="grid h-11 w-11 place-items-center rounded-full border text-[18px] disabled:opacity-30"
                        style={{
                          background: "var(--surface)",
                          color: "var(--ink)",
                          borderColor: "var(--line)",
                        }}
                      >
                        ›
                      </button>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        ) : (
          <div
            style={{
              width: boxSize.width,
              height: Math.max(boxSize.height, Math.ceil(docHeight * scale)),
              overflow: "hidden",
              position: "relative",
            }}
          >
            <iframe
              ref={(el) => {
                localIframeRef.current = el;
                iframeRef.current = el;
              }}
              onLoad={measureIframeHeight}
              title="preview"
              srcDoc={display}
              sandbox="allow-scripts allow-same-origin"
              style={{
                width: virtualWidth,
                height: Math.max(docHeight, Math.ceil(boxSize.height / scale)),
                border: 0,
                background: "#fff",
                transform: `scale(${scale})`,
                transformOrigin: "top left",
              }}
            />
          </div>
        )}

        {isPreviewingTemplate && (
          <div
            className="pointer-events-none absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-medium"
            style={{
              background: "rgba(15, 14, 12, 0.78)",
              color: "#f3efe6",
              backdropFilter: "blur(6px)",
            }}
          >
            模板預覽 · TEMPLATE
          </div>
        )}
      </div>

      <div
        className="flex shrink-0 items-center gap-2.5 px-3 pt-2.5 pb-2.5"
        style={{
          background: "var(--surface)",
          borderTop: "1px solid var(--line-faint)",
          paddingBottom: "calc(10px + env(safe-area-inset-bottom, 0px))",
        }}
      >
        <button
          type="button"
          onClick={onOpenShare}
          disabled={!html || isRunning}
          className="flex min-h-[48px] flex-1 items-center justify-center gap-1.5 rounded-2xl border text-[14px] font-medium transition-opacity disabled:opacity-40"
          style={{
            background: "var(--paper)",
            color: "var(--ink)",
            borderColor: "var(--line)",
          }}
        >
          <span>{useStore.getState().locale === "en" ? "Share" : "分享"}</span>
        </button>

        <button
          type="button"
          onClick={trigger}
          disabled={!isRunning && !canConvert}
          className="flex min-h-[48px] flex-1 items-center justify-center gap-1.5 rounded-2xl text-[14px] font-semibold text-white transition-opacity disabled:opacity-40"
          style={{
            background: isRunning ? "var(--coral-hover)" : "var(--coral)",
          }}
        >
          {isRunning ? (
            <>
              <span className="pulse-dot" style={{ background: "#fff" }} />
              <span>{t("toolbar.stop")}</span>
            </>
          ) : (
            <>
              <span aria-hidden>⚡</span>
              <span>{t("convertChip.label")}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

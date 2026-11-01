"use client";

import { useEffect, useState } from "react";
import { useStore, selectActiveTask, usePersistHydrated } from "@/lib/store";
import { useTemplates } from "@/lib/templates";
import { detectFormat } from "@/lib/parsers/auto";
import { useAutosave } from "@/lib/use-autosave";
import { useT } from "@/lib/i18n";
import { useConvertAction } from "@/lib/use-convert-action";
import { AiPromptBar } from "@/components/ai-prompt-bar";

export function MobileEditor({
  onOpenTemplates,
  onConvertedStart,
}: {
  onOpenTemplates: () => void;
  onConvertedStart: () => void;
}) {
  const hydrated = usePersistHydrated();
  const content = useStore((s) => selectActiveTask(s)?.content ?? "");
  const setContent = useStore((s) => s.setContent);
  const format = useStore((s) => selectActiveTask(s)?.format ?? "text");
  const setFormat = useStore((s) => s.setFormat);
  const setFilename = useStore((s) => s.setFilename);
  const selectedTemplateId = useStore(
    (s) => selectActiveTask(s)?.templateId ?? "article-magazine",
  );
  const locale = useStore((s) => s.locale);
  const templates = useTemplates();
  const t = useT();
  useAutosave();

  const { agent, canConvert, isRunning, tip, trigger } = useConvertAction();

  const tpl =
    templates?.find((x) => x.id === selectedTemplateId) ?? templates?.[0];
  const tplName = tpl ? (locale === "en" ? tpl.enName : tpl.zhName) : "…";

  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) return;
    const vv = window.visualViewport;
    const onResize = () => {
      const offset = window.innerHeight - vv.height;
      setKeyboardOpen(offset > 110);
    };
    vv.addEventListener("resize", onResize);
    return () => vv.removeEventListener("resize", onResize);
  }, []);

  const handleConvertClick = () => {
    if (isRunning) {
      trigger();
      return;
    }
    if (!canConvert) return;
    trigger();
    onConvertedStart();
  };

  return (
    <div
      className="flex h-full flex-col"
      style={{ background: "var(--surface)" }}
    >
      <button
        type="button"
        onClick={onOpenTemplates}
        className="flex min-h-[48px] w-full items-center justify-between gap-2 px-4 py-2 text-left active:bg-[var(--paper)]"
        style={{
          borderBottom: "1px solid var(--line-faint)",
          background: "var(--paper)",
        }}
      >
        <div className="flex min-w-0 items-center gap-2">
          <span className="text-[18px] shrink-0">{tpl?.emoji ?? "📄"}</span>
          <span className="truncate text-[14px] font-medium text-[var(--ink)]">
            {tplName}
          </span>
          {tpl?.aspectHint && (
            <span className="shrink-0 font-mono text-[11px] uppercase text-[var(--ink-faint)]">
              · {tpl.aspectHint}
            </span>
          )}
        </div>
        <span className="shrink-0 text-[13px] text-[var(--ink-faint)]">▾</span>
      </button>

      <div className="relative flex-1 min-h-0 overflow-hidden">
        {!hydrated && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
            <div className="text-[12px] text-[var(--ink-faint)]">
              {t("editor.restoring")}
            </div>
          </div>
        )}
        <textarea
          value={hydrated ? content : ""}
          onChange={(e) => {
            if (!hydrated) return;
            setContent(e.target.value);
            setFilename(undefined);
            const fmt = detectFormat(e.target.value);
            if (fmt !== format) setFormat(fmt);
          }}
          placeholder={t("editor.placeholder")}
          className="m-editor-textarea block h-full w-full resize-none border-0 bg-transparent p-4 font-[family-name:var(--font-mono)] text-[16px] leading-relaxed text-[var(--ink)] outline-none placeholder:text-[var(--ink-faint)]"
          spellCheck={false}
          disabled={!hydrated}
        />
      </div>

      <div
        className="shrink-0"
        style={{
          background: "var(--paper)",
          paddingBottom: keyboardOpen
            ? "0px"
            : "env(safe-area-inset-bottom, 0px)",
        }}
      >
        <AiPromptBar />
        {!keyboardOpen && (
          <div className="px-3 pb-2.5 pt-1">
            <button
              type="button"
              onClick={handleConvertClick}
              disabled={!isRunning && !canConvert}
              title={tip}
              className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl text-[15px] font-semibold text-white transition-opacity active:opacity-90 disabled:opacity-40"
              style={{
                background: isRunning ? "var(--coral-hover)" : "var(--coral)",
                boxShadow: "0 8px 20px -10px rgba(201, 100, 66, 0.7)",
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
            {!agent && (
              <div className="mt-1 text-center text-[11px] text-[var(--ink-faint)]">
                {t("toolbar.firstSelectAgent")}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

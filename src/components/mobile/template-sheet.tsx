"use client";

import { useMemo, useState } from "react";
import { useTemplates, type TemplateDef } from "@/lib/templates";
import { useStore, selectActiveTask } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { BottomSheet } from "./bottom-sheet";

function matchesQuery(tpl: TemplateDef, q: string): boolean {
  if (!q) return true;
  const hay = [
    tpl.zhName,
    tpl.enName,
    tpl.description,
    tpl.aspectHint,
    tpl.category,
    tpl.scenario,
    ...(tpl.tags ?? []),
  ]
    .join(" ")
    .toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((tok) => hay.includes(tok));
}

function rankRecommended(t: TemplateDef): number {
  if (typeof t.recommended === "number") return t.recommended;
  if (typeof t.featured === "number") return 100 + t.featured;
  return 9999;
}

export function TemplateSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const templates = useTemplates();
  const selectedId = useStore(
    (s) => selectActiveTask(s)?.templateId ?? "article-magazine",
  );
  const setSelected = useStore((s) => s.setSelectedTemplate);
  const locale = useStore((s) => s.locale);
  const t = useT();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const list = templates ?? [];
    return list
      .filter((tpl) => matchesQuery(tpl, query.trim()))
      .sort(
        (a, b) =>
          rankRecommended(a) - rankRecommended(b) ||
          a.zhName.localeCompare(b.zhName, "zh"),
      );
  }, [templates, query]);

  return (
    <BottomSheet open={open} title={t("template.heading")} onClose={onClose}>
      <div className="sticky top-0 z-10 px-3 pt-2.5 pb-2" style={{ background: "var(--surface)" }}>
        <div
          className="flex min-h-[44px] items-center gap-2 rounded-full px-3.5"
          style={{
            background: "var(--paper)",
            border: "1px solid var(--line)",
          }}
        >
          <span className="text-[14px] text-[var(--ink-faint)]" aria-hidden>
            ⌕
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("template.search.placeholder")}
            className="flex-1 bg-transparent text-[16px] text-[var(--ink)] outline-none placeholder:text-[var(--ink-faint)]"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="清除搜尋"
              className="grid h-8 w-8 place-items-center rounded-full text-[var(--ink-faint)]"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1 px-3 pb-4">
        {filtered.map((tpl) => {
          const active = tpl.id === selectedId;
          const name = locale === "en" ? tpl.enName : tpl.zhName;
          return (
            <button
              key={tpl.id}
              type="button"
              onClick={() => {
                setSelected(tpl.id);
                onClose();
              }}
              className="flex min-h-[48px] w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left transition-colors active:bg-[var(--paper)]"
              style={{
                background: active ? "var(--coral-soft)" : "transparent",
                border: active
                  ? "1px solid var(--coral)"
                  : "1px solid transparent",
              }}
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="text-[20px] shrink-0">{tpl.emoji}</span>
                <div className="min-w-0">
                  <div className="truncate text-[14px] font-medium text-[var(--ink)]">
                    {name}
                  </div>
                  {tpl.description && (
                    <div className="truncate text-[12px] text-[var(--ink-mute)]">
                      {tpl.description}
                    </div>
                  )}
                </div>
              </div>
              {tpl.aspectHint && (
                <span
                  className="shrink-0 rounded-full px-2 py-0.5 font-mono text-[11px] uppercase"
                  style={{
                    background: "var(--paper)",
                    color: "var(--ink-mute)",
                    border: "1px solid var(--line-faint)",
                  }}
                >
                  {tpl.aspectHint}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </BottomSheet>
  );
}

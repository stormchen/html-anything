"use client";

import { useEffect, useRef, useState } from "react";
import { useStore, selectActiveTask, type ConvertStatus } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { useWakeLock } from "@/lib/use-wake-lock";
import { MobileEditor } from "./mobile-editor";
import { MobilePreview } from "./mobile-preview";
import { TaskSheet } from "./task-sheet";
import { TemplateSheet } from "./template-sheet";
import { ShareSheet } from "./share-sheet";

const STATUS_DOT: Record<ConvertStatus, { color: string; live: boolean }> = {
  idle: { color: "var(--ink-faint)", live: false },
  running: { color: "var(--coral)", live: true },
  done: { color: "var(--green)", live: false },
  error: { color: "var(--red)", live: false },
};

export function MobileShell({
  iframeRef,
}: {
  iframeRef: React.MutableRefObject<HTMLIFrameElement | null>;
}) {
  const [view, setView] = useState<"editor" | "preview">("editor");
  const [taskSheetOpen, setTaskSheetOpen] = useState(false);
  const [templateSheetOpen, setTemplateSheetOpen] = useState(false);
  const [shareSheetOpen, setShareSheetOpen] = useState(false);
  const [interruptedBanner, setInterruptedBanner] = useState(false);

  const activeTask = useStore(selectActiveTask);
  const selectedAgent = useStore((s) => s.selectedAgent);
  const agents = useStore((s) => s.agents);
  const setSelectedAgent = useStore((s) => s.setSelectedAgent);
  const t = useT();

  const status = activeTask?.status ?? "idle";
  useWakeLock(status === "running");

  // Auto-select first available agent on mobile if none is selected
  useEffect(() => {
    if (selectedAgent || agents.length === 0) return;
    const candidate =
      agents.find((a) => a.available && !a.unsupported) ??
      agents.find((a) => !a.unsupported);
    if (candidate) {
      setSelectedAgent(candidate.id);
    }
  }, [selectedAgent, agents, setSelectedAgent]);

  // Detect if conversion was interrupted while app was backgrounded
  const wasRunningWhenHidden = useRef(false);
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "hidden") {
        const cur = selectActiveTask(useStore.getState())?.status;
        wasRunningWhenHidden.current = cur === "running";
      } else if (document.visibilityState === "visible") {
        if (wasRunningWhenHidden.current) {
          const cur = selectActiveTask(useStore.getState())?.status;
          if (cur === "error" || cur === "idle") {
            setInterruptedBanner(true);
          }
          wasRunningWhenHidden.current = false;
        }
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  useEffect(() => {
    if (status === "running") {
      setInterruptedBanner(false);
    }
  }, [status]);

  const dot = STATUS_DOT[status];

  return (
    <main className="m-shell relative flex flex-col overflow-hidden">
      <header
        className="flex shrink-0 items-center justify-between gap-2 px-3 pb-2"
        style={{
          paddingTop: "calc(8px + env(safe-area-inset-top, 0px))",
          paddingLeft: "calc(12px + env(safe-area-inset-left, 0px))",
          paddingRight: "calc(12px + env(safe-area-inset-right, 0px))",
          background: "rgba(250, 249, 247, 0.94)",
          borderBottom: "1px solid var(--line-faint)",
          backdropFilter: "blur(10px)",
        }}
      >
        <button
          type="button"
          onClick={() => setTaskSheetOpen(true)}
          className="flex min-h-[44px] min-w-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-left active:bg-[var(--paper)]"
          style={{
            background: "var(--surface)",
            borderColor: "var(--line)",
          }}
        >
          <span
            className={`h-2 w-2 shrink-0 rounded-full ${
              dot.live ? "pulse-dot !h-2 !w-2" : ""
            }`}
            style={{ background: dot.color }}
          />
          <span className="max-w-[160px] truncate text-[13.5px] font-semibold text-[var(--ink)]">
            {activeTask?.name ?? t("tasks.heading")}
          </span>
          <span className="shrink-0 text-[12px] text-[var(--ink-faint)]">▾</span>
        </button>

        <div
          className="flex shrink-0 items-center rounded-full p-1"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--line)",
          }}
          role="tablist"
        >
          <button
            type="button"
            role="tab"
            aria-selected={view === "editor"}
            onClick={() => setView("editor")}
            className="min-h-[36px] rounded-full px-3.5 text-[13px] font-medium transition-colors"
            style={{
              background: view === "editor" ? "var(--ink)" : "transparent",
              color: view === "editor" ? "var(--paper)" : "var(--ink-mute)",
            }}
          >
            { useStore.getState().locale === "en" ? "Input" : "輸入" }
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === "preview"}
            onClick={() => setView("preview")}
            className="flex min-h-[36px] items-center gap-1.5 rounded-full px-3.5 text-[13px] font-medium transition-colors"
            style={{
              background: view === "preview" ? "var(--ink)" : "transparent",
              color: view === "preview" ? "var(--paper)" : "var(--ink-mute)",
            }}
          >
            {status === "running" && (
              <span
                className="pulse-dot !h-2 !w-2"
                style={{
                  background: view === "preview" ? "#fff" : "var(--coral)",
                }}
              />
            )}
            <span>{ useStore.getState().locale === "en" ? "Preview" : "預覽" }</span>
          </button>
        </div>
      </header>

      {interruptedBanner && (
        <div
          className="flex shrink-0 items-center justify-between gap-2 px-4 py-2 text-[12.5px]"
          style={{
            background: "rgba(156, 42, 37, 0.12)",
            color: "var(--red)",
            borderBottom: "1px solid var(--line-faint)",
          }}
        >
          <span>轉換因切換至背景而中斷，請重新點擊轉換。</span>
          <button
            type="button"
            onClick={() => setInterruptedBanner(false)}
            className="px-2 py-1 font-semibold"
          >
            ✕
          </button>
        </div>
      )}

      <div className="relative flex-1 min-h-0 overflow-hidden">
        {view === "editor" ? (
          <MobileEditor
            onOpenTemplates={() => setTemplateSheetOpen(true)}
            onConvertedStart={() => setView("preview")}
          />
        ) : (
          <MobilePreview
            iframeRef={iframeRef}
            onOpenShare={() => setShareSheetOpen(true)}
          />
        )}
      </div>

      <TaskSheet open={taskSheetOpen} onClose={() => setTaskSheetOpen(false)} />
      <TemplateSheet
        open={templateSheetOpen}
        onClose={() => setTemplateSheetOpen(false)}
      />
      <ShareSheet
        open={shareSheetOpen}
        onClose={() => setShareSheetOpen(false)}
        iframeRef={iframeRef}
      />
    </main>
  );
}

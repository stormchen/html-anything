"use client";

import { useStore, type ConvertStatus } from "@/lib/store";
import { useTemplates } from "@/lib/templates";
import { useT } from "@/lib/i18n";
import { BottomSheet } from "./bottom-sheet";

const STATUS_COLOR: Record<ConvertStatus, { color: string; live: boolean }> = {
  idle: { color: "var(--ink-faint)", live: false },
  running: { color: "var(--coral)", live: true },
  done: { color: "var(--green)", live: false },
  error: { color: "var(--red)", live: false },
};

export function TaskSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const tasks = useStore((s) => s.tasks);
  const activeTaskId = useStore((s) => s.activeTaskId);
  const newTask = useStore((s) => s.newTask);
  const deleteTask = useStore((s) => s.deleteTask);
  const setActive = useStore((s) => s.setActiveTask);
  const locale = useStore((s) => s.locale);
  const templates = useTemplates();
  const t = useT();

  const canDelete = tasks.length > 1;

  return (
    <BottomSheet open={open} title={t("tasks.heading")} onClose={onClose}>
      <div className="p-3">
        <button
          type="button"
          onClick={() => {
            newTask();
            onClose();
          }}
          className="mb-3 flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-[14px] font-medium text-white active:opacity-90"
          style={{
            background: "var(--coral)",
            boxShadow: "0 10px 22px -16px rgba(201, 100, 66, 0.85)",
          }}
        >
          {t("tasks.newTask")}
        </button>

        <div className="flex flex-col gap-1.5">
          {tasks.map((task) => {
            const active = task.id === activeTaskId;
            const tpl = templates?.find((x) => x.id === task.templateId);
            const dot = STATUS_COLOR[task.status];
            const preview = task.content.replace(/\s+/g, " ").trim().slice(0, 48);

            return (
              <div
                key={task.id}
                className="flex items-center gap-2 rounded-xl px-3 py-2"
                style={{
                  background: active ? "var(--paper)" : "transparent",
                  border: active ? "1px solid var(--line)" : "1px solid var(--line-faint)",
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setActive(task.id);
                    onClose();
                  }}
                  className="flex min-h-[44px] min-w-0 flex-1 items-center gap-2.5 text-left"
                >
                  <span
                    className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                      dot.live ? "pulse-dot !h-2.5 !w-2.5" : ""
                    }`}
                    style={{ background: dot.color }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[14px] font-semibold text-[var(--ink)]">
                      {task.name}
                    </div>
                    <div className="mt-0.5 flex items-center gap-1.5 truncate text-[12px] text-[var(--ink-mute)]">
                      {tpl && (
                        <>
                          <span>{tpl.emoji}</span>
                          <span>{locale === "en" ? tpl.enName : tpl.zhName}</span>
                        </>
                      )}
                      {preview && (
                        <>
                          <span className="text-[var(--ink-faint)]">·</span>
                          <span className="truncate text-[var(--ink-faint)]">{preview}</span>
                        </>
                      )}
                    </div>
                  </div>
                </button>

                {canDelete && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(t("tasks.deleteConfirm", { name: task.name }))) {
                        deleteTask(task.id);
                      }
                    }}
                    aria-label={t("tasks.delete")}
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-[var(--ink-faint)] active:bg-[var(--line-faint)] active:text-[var(--red)]"
                  >
                    ✕
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </BottomSheet>
  );
}

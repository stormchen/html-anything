"use client";

import { useEffect } from "react";

export function BottomSheet({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end od-backdrop"
      style={{
        background: "rgba(21, 20, 15, 0.45)",
        backdropFilter: "blur(6px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="flex max-h-[82dvh] w-full flex-col overflow-hidden rounded-t-3xl od-fade-in"
        style={{
          background: "var(--surface)",
          borderTop: "1px solid var(--line-soft)",
          boxShadow: "0 -20px 50px -15px rgba(21, 20, 15, 0.28)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        <div className="flex flex-col items-center pt-2.5 pb-1">
          <div
            className="h-1 w-10 rounded-full"
            style={{ background: "var(--line)" }}
          />
        </div>
        <div
          className="flex items-center justify-between px-4 pb-2.5 pt-1"
          style={{ borderBottom: "1px solid var(--line-faint)" }}
        >
          <span className="text-[14px] font-semibold text-[var(--ink)]">
            {title}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="關閉"
            className="grid h-11 w-11 -mr-2 place-items-center rounded-full text-[var(--ink-mute)] active:bg-[var(--line-faint)]"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

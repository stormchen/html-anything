"use client";

import { useState } from "react";
import { useStore, selectActiveTask } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { extractHtml } from "@/lib/extract-html";
import { iframeToBlob, downloadBlob } from "@/lib/export/image";
import { downloadHtml } from "@/lib/export/download";
import { BottomSheet } from "./bottom-sheet";

async function shareOrDownloadFile(file: File, fallback: () => void) {
  if (
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function"
  ) {
    try {
      const canShareFiles =
        typeof navigator.canShare === "function"
          ? navigator.canShare({ files: [file] })
          : true;
      if (canShareFiles) {
        await navigator.share({ files: [file], title: file.name });
        return;
      }
    } catch (err) {
      if ((err as Error)?.name === "AbortError") return;
    }
  }
  fallback();
}

export function ShareSheet({
  open,
  onClose,
  iframeRef,
}: {
  open: boolean;
  onClose: () => void;
  iframeRef: React.MutableRefObject<HTMLIFrameElement | null>;
}) {
  const html = useStore((s) => selectActiveTask(s)?.html ?? "");
  const taskName = useStore((s) => selectActiveTask(s)?.name ?? "html-anything");
  const t = useT();
  const [busy, setBusy] = useState<"png" | "html" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const safeBase =
    taskName
      .trim()
      .replace(/[\\/:*?"<>|\s]+/g, "-")
      .slice(0, 40) || "html-anything";

  const onSharePng = async () => {
    if (!iframeRef.current) {
      setError(t("export.error.previewNotReady"));
      return;
    }
    setBusy("png");
    setError(null);
    try {
      const blob = await iframeToBlob(iframeRef.current);
      const filename = `${safeBase}-${Date.now()}.png`;
      const file = new File([blob], filename, { type: "image/png" });
      await shareOrDownloadFile(file, () => downloadBlob(blob, filename));
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("export.error.generic"));
    } finally {
      setBusy(null);
    }
  };

  const onShareHtml = async () => {
    const cleaned = extractHtml(html);
    if (!cleaned) return;
    setBusy("html");
    setError(null);
    try {
      const filename = `${safeBase}-${Date.now()}.html`;
      const blob = new Blob([cleaned], { type: "text/html;charset=utf-8" });
      const file = new File([blob], filename, { type: "text/html" });
      await shareOrDownloadFile(file, () => downloadHtml(cleaned, safeBase));
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("export.error.generic"));
    } finally {
      setBusy(null);
    }
  };

  return (
    <BottomSheet open={open} title={t("export.button")} onClose={onClose}>
      <div className="flex flex-col gap-2 p-4">
        <button
          type="button"
          disabled={!!busy || !html}
          onClick={onSharePng}
          className="flex min-h-[52px] w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-[15px] font-medium transition-colors disabled:opacity-40"
          style={{
            background: "var(--paper)",
            color: "var(--ink)",
            border: "1px solid var(--line-soft)",
          }}
        >
          <span className="text-[20px]" aria-hidden>
            🖼️
          </span>
          <span className="flex-1">{t("export.action.downloadPng")}</span>
          {busy === "png" && (
            <span className="text-[12px] text-[var(--coral)]">處理中…</span>
          )}
        </button>

        <button
          type="button"
          disabled={!!busy || !html}
          onClick={onShareHtml}
          className="flex min-h-[52px] w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-[15px] font-medium transition-colors disabled:opacity-40"
          style={{
            background: "var(--paper)",
            color: "var(--ink)",
            border: "1px solid var(--line-soft)",
          }}
        >
          <span className="text-[20px]" aria-hidden>
            💾
          </span>
          <span className="flex-1">{t("export.action.downloadHtml")}</span>
          {busy === "html" && (
            <span className="text-[12px] text-[var(--coral)]">處理中…</span>
          )}
        </button>

        {error && (
          <div className="mt-1 px-1 text-[13px]" style={{ color: "var(--red)" }}>
            {error}
          </div>
        )}
      </div>
    </BottomSheet>
  );
}

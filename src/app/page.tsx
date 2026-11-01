"use client";

import { useEffect, useRef, useState } from "react";
import { Toolbar } from "@/components/toolbar";
import { EditorPane } from "@/components/editor-pane";
import { PreviewPane } from "@/components/preview-pane";
import { TasksSidebar } from "@/components/tasks-sidebar";
import { WelcomeModal } from "@/components/welcome-modal";
import { SettingsModal } from "@/components/settings-modal";
import { ConvertChip } from "@/components/convert-chip";
import { MobileShell } from "@/components/mobile/mobile-shell";
import { useStore, type AgentInfo } from "@/lib/store";
import { setupClientAuthSync } from "@/lib/auth/client-sync";
import { useIsMobile } from "@/lib/use-is-mobile";

export default function Home() {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const welcomeAck = useStore((s) => s.welcomeAck);
  const selectedAgent = useStore((s) => s.selectedAgent);
  const setAgents = useStore((s) => s.setAgents);
  const setAgentModel = useStore((s) => s.setAgentModel);
  const setAgentBinOverride = useStore((s) => s.setAgentBinOverride);
  const setSelectedAgent = useStore((s) => s.setSelectedAgent);
  const locale = useStore((s) => s.locale);
  const layoutMode = useStore((s) => s.layoutMode);
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    setupClientAuthSync();
    setHydrated(true);
  }, []);

  // Detect agents on mount so the toolbar's agent chip can resolve the
  // persisted `selectedAgent` to a label without waiting for the user to
  // open Settings or Welcome. Without this, after a hard reload the chip
  // briefly (or permanently) shows "Select agent" even though selection
  // is intact in localStorage.
  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;
    (async () => {
      // ── 1. 同步 .env.local → store（確保模型選擇在重整後仍正確標示）──
      try {
        const cfg = await fetch("/api/config");
        if (cfg.ok && !cancelled) {
          const env = await cfg.json();
          if (env.NEXT_PUBLIC_OLLAMA_MODEL) {
            setAgentModel("ollama", env.NEXT_PUBLIC_OLLAMA_MODEL);
          }
          if (env.NEXT_PUBLIC_OLLAMA_URL) {
            setAgentBinOverride("ollama", env.NEXT_PUBLIC_OLLAMA_URL);
          }
          if (env.GEMINI_API_KEY && !useStore.getState().agentBinOverrides["gemini"]) {
            setAgentBinOverride("gemini", env.GEMINI_API_KEY);
          }
          if (env.NEXT_PUBLIC_DEFAULT_AGENT && !useStore.getState().selectedAgent) {
            setSelectedAgent(env.NEXT_PUBLIC_DEFAULT_AGENT);
          }
        }
        // Auto-rehydrate local deploy settings to server in case of server container restart
        const ghSaved = useStore.getState().deployConfigs?.["github-repo"];
        if (ghSaved && ghSaved.token && ghSaved.repo && !cancelled) {
          fetch("/api/deploy/config?provider=github-repo", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              token: ghSaved.token.trim(),
              repo: ghSaved.repo.trim(),
              branch: (ghSaved.branch || "main").trim(),
              siteUrl: (ghSaved.siteUrl || "").trim(),
            }),
          }).catch(() => {});
        }
      } catch {
        // silent — store already has localStorage fallback
      }
      // ── 2. 偵測已安裝的 agents ──
      try {
        const res = await fetch("/api/agents", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { agents: AgentInfo[] };
        if (!cancelled) setAgents(data.agents);
      } catch {
        // Settings / Welcome modals will retry on open.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hydrated, setAgents, setAgentModel, setAgentBinOverride, setSelectedAgent]);

  // Keep <html lang="…"> in sync with the user's locale so screen readers
  // and browser features (autotranslate, hyphenation) pick the right language.
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("lang", locale);
    }
  }, [locale]);

  useEffect(() => {
    if (!hydrated || isMobile) return;
    if (!welcomeAck || !selectedAgent) setWelcomeOpen(true);
  }, [hydrated, isMobile, welcomeAck, selectedAgent]);

  if (hydrated && isMobile) {
    return <MobileShell iframeRef={iframeRef} />;
  }

  return (
    <main className="relative flex h-screen flex-col">
      <Toolbar
        iframeRef={iframeRef}
        onOpenAgentPicker={() => setSettingsOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
      />
      <div
        className="flex flex-1 min-h-0"
        style={{ borderTop: "1px solid var(--line-faint)" }}
      >
        <TasksSidebar />
        <div className="relative flex flex-1 min-w-0">
          {layoutMode !== "preview" && (
            <section
              className="flex min-w-0 flex-1 basis-0 flex-col"
              style={
                layoutMode === "split"
                  ? { borderRight: "1px solid var(--line-faint)" }
                  : undefined
              }
            >
              <EditorPane />
            </section>
          )}
          {layoutMode !== "editor" && (
            <section className="flex min-w-0 flex-1 basis-0 flex-col">
              <PreviewPane iframeRef={iframeRef} />
            </section>
          )}
          <ConvertChip />
        </div>
      </div>
      {welcomeOpen && <WelcomeModal onClose={() => setWelcomeOpen(false)} />}
      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
    </main>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import {
  LOCALES,
  LOCALE_LABEL,
  useStore,
  type AgentInfo,
  type Locale,
} from "@/lib/store";
import { useT, type DictKey } from "@/lib/i18n";

type Props = { onClose: () => void; initialSection?: SectionId };

type SectionId = "agent" | "deploy" | "language" | "backup";

const SECTIONS: Array<{ id: SectionId; labelKey: DictKey; hintKey: DictKey }> = [
  { id: "agent", labelKey: "settings.section.agent.label", hintKey: "settings.section.agent.hint" },
  { id: "deploy", labelKey: "settings.section.deploy.label", hintKey: "settings.section.deploy.hint" },
  { id: "language", labelKey: "settings.section.language.label", hintKey: "settings.section.language.hint" },
  { id: "backup", labelKey: "settings.section.backup.label", hintKey: "settings.section.backup.hint" },
];

const PROTOCOL_KEY: Record<AgentInfo["protocol"], { key: DictKey; tone: "ok" | "warn" }> = {
  stdin: { key: "protocol.stdin", tone: "ok" },
  argv: { key: "protocol.argv", tone: "ok" },
  "argv-message": { key: "protocol.argvMessage", tone: "ok" },
  acp: { key: "protocol.acp", tone: "warn" },
  "pi-rpc": { key: "protocol.piRpc", tone: "warn" },
};

const VENDOR_GRADIENT: Record<string, string> = {
  Anthropic: "from-[#c96442] to-[#e9b94a]",
  OpenAI: "from-[#10a37f] to-[#1f7a3a]",
  Cursor: "from-[#5b6cf2] to-[#a1a8f5]",
  Google: "from-[#4285f4] to-[#34a853]",
  GitHub: "from-[#24292e] to-[#444c56]",
  Open: "from-[#6e7448] to-[#b26200]",
  Alibaba: "from-[#ff7a00] to-[#ed6f5c]",
  Aider: "from-[#6c3aa6] to-[#9c2a25]",
  DeepSeek: "from-[#2563eb] to-[#7c3aed]",
  Cognition: "from-[#0f172a] to-[#475569]",
  Mature: "from-[#7c2d12] to-[#b45309]",
  Moonshot: "from-[#0ea5e9] to-[#1e3a8a]",
  Inflection: "from-[#a855f7] to-[#ec4899]",
  AWS: "from-[#ff9900] to-[#232f3e]",
  Kilo: "from-[#16a34a] to-[#0d9488]",
  Mistral: "from-[#fb923c] to-[#ef4444]",
  Qoder: "from-[#0891b2] to-[#7c3aed]",
};

export function SettingsModal({ onClose, initialSection = "agent" }: Props) {
  const [section, setSection] = useState<SectionId>(initialSection);
  const t = useT();

  const handleClose = () => {
    const s = useStore.getState();
    const updates: Record<string, string> = {};
    if (s.selectedAgent) {
      updates.NEXT_PUBLIC_DEFAULT_AGENT = s.selectedAgent;
    }
    const ollamaUrl = s.agentBinOverrides["ollama"];
    if (ollamaUrl !== undefined) {
      updates.NEXT_PUBLIC_OLLAMA_URL = ollamaUrl;
    }
    const ollamaModel = s.agentModels["ollama"];
    if (ollamaModel !== undefined) {
      updates.NEXT_PUBLIC_OLLAMA_MODEL = ollamaModel;
    }
    if (Object.keys(updates).length > 0) {
      fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      }).catch((e) => console.warn("[Config] Failed to save to .env.local:", e));
    }
    onClose();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center od-backdrop"
      style={{ background: "rgba(21, 20, 15, 0.45)", backdropFilter: "blur(6px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        className="relative w-[860px] max-w-[94vw] h-[600px] max-h-[88vh] flex flex-col overflow-hidden od-fade-in"
        style={{
          background: "var(--surface)",
          borderRadius: 24,
          border: "1px solid var(--line-soft)",
          boxShadow: "0 40px 80px -20px rgba(21, 20, 15, 0.35)",
        }}
      >
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid var(--line-faint)" }}
        >
          <div>
            <div className="eyebrow">{t("settings.eyebrow")}</div>
            <h2 className="mt-2 text-[20px] font-semibold tracking-tight text-[var(--ink)] font-[family-name:var(--font-display)]">
              {t("settings.titlePart1")} <em className="serif-em">{t("settings.titleAccent")}</em>
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="grid h-8 w-8 place-items-center rounded-full text-[var(--ink-mute)] hover:bg-[var(--line-faint)] hover:text-[var(--ink)] transition-colors"
            title={t("settings.close")}
          >
            ✕
          </button>
        </div>

        <div className="flex flex-1 min-h-0">
          <nav
            className="w-[200px] shrink-0 px-3 py-4 overflow-y-auto"
            style={{ background: "var(--paper)", borderRight: "1px solid var(--line-faint)" }}
          >
            {SECTIONS.map((s) => {
              const active = s.id === section;
              return (
                <button
                  key={s.id}
                  onClick={() => setSection(s.id)}
                  className={`block w-full rounded-xl px-3 py-2.5 mb-1 text-left transition-all ${
                    active
                      ? "bg-[var(--surface)] ring-1 ring-[var(--line)]"
                      : "hover:bg-[var(--surface)]"
                  }`}
                >
                  <div className={`text-[13.5px] font-medium ${active ? "text-[var(--ink)]" : "text-[var(--ink-soft)]"}`}>
                    {t(s.labelKey)}
                  </div>
                  <div className="text-[11px] text-[var(--ink-faint)] mt-0.5">{t(s.hintKey)}</div>
                </button>
              );
            })}
          </nav>

          <div className="flex-1 min-w-0 overflow-y-auto px-7 py-6">
            {section === "agent" && <AgentSection />}
            {section === "deploy" && <DeploySection />}
            {section === "language" && <LanguageSection />}
            {section === "backup" && <BackupSection />}
          </div>
        </div>

        <div
          className="flex items-center justify-end gap-2 px-6 py-4"
          style={{ borderTop: "1px solid var(--line-faint)", background: "var(--paper)" }}
        >
          <button onClick={handleClose} className="btn-primary">
            {t("settings.done")}
          </button>
        </div>
      </div>
    </div>
  );
}

function AgentSection() {
  const setSelectedAgent = useStore((s) => s.setSelectedAgent);
  const setAgents = useStore((s) => s.setAgents);
  const setAgentModel = useStore((s) => s.setAgentModel);
  const setAgentBinOverride = useStore((s) => s.setAgentBinOverride);
  const agents = useStore((s) => s.agents);
  const selected = useStore((s) => s.selectedAgent);
  const agentModels = useStore((s) => s.agentModels);
  const agentBinOverrides = useStore((s) => s.agentBinOverrides);
  const t = useT();

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  /** 從 .env.local 讀取設定並同步到 store（用於反映最新的 env 值至 UI） */
  const syncFromEnv = async () => {
    try {
      const res = await fetch("/api/config");
      if (!res.ok) return;
      const data = await res.json();
      const currentOverrides = useStore.getState().agentBinOverrides;

      if (data.NEXT_PUBLIC_OLLAMA_MODEL) {
        // .env.local 有設定就以它為準，確保 UI 正確標示
        setAgentModel("ollama", data.NEXT_PUBLIC_OLLAMA_MODEL);
      }

      if (data.NEXT_PUBLIC_OLLAMA_URL && !currentOverrides["ollama"]) {
        setAgentBinOverride("ollama", data.NEXT_PUBLIC_OLLAMA_URL);
      }

      if (data.NEXT_PUBLIC_DEFAULT_AGENT && !useStore.getState().selectedAgent) {
        setSelectedAgent(data.NEXT_PUBLIC_DEFAULT_AGENT);
      }
    } catch (e) {
      // silent
    }
  };

  const load = async () => {
    setLoading(true);
    setErr(null);
    // 同步 .env.local → store，讓 UI 正確標示當前儲存的模型
    await syncFromEnv();
    try {
      const res = await fetch("/api/agents", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { agents: AgentInfo[] };
      setAgents(data.agents);
      const installed = data.agents.filter((a) => a.available);
      if (!installed.find((a) => a.id === selected) && installed.length) {
        setSelectedAgent(installed[0].id);
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "detection failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!agents.length) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const installed = useMemo(() => agents.filter((a) => a.available), [agents]);
  const missing = useMemo(() => agents.filter((a) => !a.available), [agents]);
  const selectedAgent = installed.find((a) => a.id === selected);
  const selectedModelId = selected ? agentModels[selected] ?? "default" : "default";

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[17px] font-semibold text-[var(--ink)]">{t("settings.agent.title")}</h3>
          <p className="mt-1 text-[12.5px] text-[var(--ink-mute)] leading-relaxed">
            {t("settings.agent.subtitle")}
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="text-xs text-[var(--ink-faint)] hover:text-[var(--ink)] disabled:opacity-50 transition-colors shrink-0"
        >
          {loading ? t("welcome.scanning") : t("welcome.rescan")}
        </button>
      </div>

      {err && (
        <div
          className="mb-4 rounded-xl px-4 py-3 text-sm"
          style={{ background: "var(--coral-soft)", color: "var(--coral)" }}
        >
          {t("welcome.detectionFailed")}: {err}
        </div>
      )}

      {installed.length > 0 && (
        <>
          <div className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-[var(--ink-faint)]">
            <span className="pulse-dot" /> {t("welcome.installed", { n: installed.length })}
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {installed.map((a) => (
              <AgentCard
                key={a.id}
                agent={a}
                selected={selected === a.id}
                onClick={() => setSelectedAgent(a.id)}
              />
            ))}
          </div>
        </>
      )}

      {selectedAgent && (
        <ModelPicker
          agent={selectedAgent}
          modelId={selectedModelId}
          onPick={(id) => {
            setAgentModel(selectedAgent.id, id);
          }}
        />
      )}

      {selectedAgent && (
        <CustomBinPath
          agent={selectedAgent}
          value={agentBinOverrides[selectedAgent.id] ?? ""}
          onChange={(p) => {
            setAgentBinOverride(selectedAgent.id, p);
          }}
        />
      )}

      {missing.length > 0 && (
        <>
          <div className="mt-6 mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-[var(--ink-faint)]">
            {t("welcome.notInstalled", { n: missing.length })}
          </div>
          <div className="grid grid-cols-1 gap-2">
            {missing.map((a) => (
              <MissingCard key={a.id} agent={a} />
            ))}
          </div>
        </>
      )}

      {!loading && agents.length === 0 && (
        <div
          className="rounded-2xl border-2 border-dashed py-10 px-6 text-center"
          style={{ borderColor: "var(--line)" }}
        >
          <div className="text-3xl mb-2">🪞</div>
          <p className="text-sm font-medium text-[var(--ink-soft)]">{t("welcome.noAgentsTitle")}</p>
          <p className="mt-2 text-xs text-[var(--ink-mute)]">{t("welcome.noAgentsBody")}</p>
        </div>
      )}
    </div>
  );
}

function LanguageSection() {
  const locale = useStore((s) => s.locale);
  const setLocale = useStore((s) => s.setLocale);
  const t = useT();

  return (
    <div>
      <h3 className="text-[17px] font-semibold text-[var(--ink)]">{t("settings.language.title")}</h3>
      <p className="mt-1 text-[12.5px] text-[var(--ink-mute)] leading-relaxed">
        {t("settings.language.subtitle")}
      </p>

      <div className="mt-5 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
        {LOCALES.map((code) => {
          const active = code === locale;
          return (
            <button
              key={code}
              onClick={() => setLocale(code as Locale)}
              className={`flex items-center justify-between rounded-xl px-4 py-3 text-left transition-all ${
                active
                  ? "ring-2 ring-[var(--coral)] bg-[var(--surface)]"
                  : "ring-1 ring-[var(--line-soft)] hover:ring-[var(--ink)]/30 bg-[var(--surface)]"
              }`}
            >
              <div className="min-w-0">
                <div className="text-[14px] font-medium text-[var(--ink)] truncate">
                  {LOCALE_LABEL[code]}
                </div>
                <div className="font-mono text-[10.5px] text-[var(--ink-faint)] mt-0.5">{code}</div>
              </div>
              {active && (
                <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-[var(--coral)] shrink-0">
                  {t("settings.language.active")}
                </span>
              )}
              {!active && code === "en" && (
                <span className="ml-2 text-[10px] uppercase tracking-wider text-[var(--ink-faint)] shrink-0">
                  {t("settings.language.default")}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div
        className="mt-6 rounded-xl px-4 py-3 text-[12px] text-[var(--ink-mute)]"
        style={{ background: "var(--paper)", border: "1px solid var(--line-faint)" }}
      >
        {t("settings.language.note")}
      </div>
    </div>
  );
}

function AgentCard({
  agent,
  selected,
  onClick,
}: {
  agent: AgentInfo;
  selected: boolean;
  onClick: () => void;
}) {
  const t = useT();
  const proto = PROTOCOL_KEY[agent.protocol];
  const gradient = VENDOR_GRADIENT[agent.vendor] ?? "from-[var(--ink)] to-[var(--ink-soft)]";
  return (
    <button
      onClick={onClick}
      className={`group relative flex items-start gap-3 rounded-2xl p-4 text-left transition-all ${
        selected ? "ring-2 ring-[var(--coral)]" : "ring-1 ring-[var(--line-soft)] hover:ring-[var(--ink)]/30"
      }`}
      style={{ background: "var(--surface)" }}
    >
      <div
        className={`shrink-0 grid h-9 w-9 place-items-center rounded-xl text-white shadow-sm bg-gradient-to-br ${gradient}`}
      >
        <span className="font-semibold text-[15px]">{agent.label.charAt(0)}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <div className="text-[14px] font-semibold text-[var(--ink)] truncate">{agent.label}</div>
          {selected && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--coral)]">
              {t("agent.selected")}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-[11px] text-[var(--ink-faint)] mt-0.5">
          <span>{agent.vendor}</span>
          <span>·</span>
          <span className={proto.tone === "warn" ? "text-[var(--coral)]" : ""}>{t(proto.key)}</span>
        </div>
        {agent.path && (
          <div
            className="font-mono text-[10px] text-[var(--ink-mute)] mt-1.5 truncate"
            title={agent.path}
          >
            {agent.path}
          </div>
        )}
      </div>
    </button>
  );
}

function ModelPicker({
  agent,
  modelId,
  onPick,
}: {
  agent: AgentInfo;
  modelId: string;
  onPick: (id: string) => void;
}) {
  const t = useT();
  const models = agent.models.length
    ? agent.models
    : [{ id: "default", label: t("model.defaultLabel") }];
  const MARK = "​";
  const [before, after = ""] = t("model.label", { agent: MARK }).split(MARK);
  return (
    <div
      className="mt-5 rounded-2xl p-4"
      style={{ background: "var(--paper)", border: "1px solid var(--line-faint)" }}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--ink-faint)]">{t("model.eyebrow")}</div>
          <div className="text-[13px] font-medium text-[var(--ink-soft)] mt-0.5">
            {before}
            <strong className="text-[var(--ink)]">{agent.label}</strong>
            {after}
          </div>
        </div>
        <div className="text-[10.5px] text-[var(--ink-mute)] max-w-[220px] text-right leading-snug">
          {t("model.defaultHint.prefix")}
          <code className="px-1 rounded bg-[var(--surface)] border border-[var(--line-faint)]">
            --model
          </code>
          {t("model.defaultHint.suffix")}
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {models.map((m) => {
          const active = m.id === modelId;
          return (
            <button
              key={m.id}
              onClick={() => onPick(m.id)}
              className={`rounded-full px-3 py-1.5 text-[12px] transition-all ${
                active
                  ? "bg-[var(--ink)] text-[var(--paper)] font-medium"
                  : "bg-[var(--surface)] text-[var(--ink-soft)] border border-[var(--line-soft)] hover:border-[var(--ink)]/40"
              }`}
              title={m.id}
            >
              {m.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CustomBinPath({
  agent,
  value,
  onChange,
}: {
  agent: AgentInfo;
  value: string;
  onChange: (path: string) => void;
}) {
  const t = useT();
  const [draft, setDraft] = useState(value);
  useEffect(() => {
    setDraft(value);
  }, [value, agent.id]);

  const isOllama = agent.id === "ollama";
  const eyebrow = isOllama ? t("settings.agent.title") : t("agent.customBin.eyebrow");
  const subtitle = isOllama
    ? t("settings.agent.binPath.ollama")
    : t("agent.customBin.subtitle", { agent: agent.label });

  const isWindows = typeof navigator !== "undefined" && /Win/i.test(navigator.platform);
  const placeholder = isOllama
    ? "http://localhost:11434"
    : isWindows
      ? "C:\\Users\\you\\scoop\\apps\\nodejs\\current\\claude.cmd"
      : "/usr/local/bin/claude";

  const detected = agent.path;
  const dirty = draft.trim() !== value.trim();

  const updateAgentModels = useStore((s) => s.updateAgentModels);
  const [fetching, setFetching] = useState(false);

  const fetchOllamaModels = async (host: string) => {
    if (!isOllama || !host.trim()) return;
    setFetching(true);
    try {
      const res = await fetch(`/api/agents/ollama-models?host=${encodeURIComponent(host)}`);
      if (!res.ok) throw new Error("Fetch failed");
      const data = await res.json();
      if (data.models) {
        updateAgentModels("ollama", data.models);
      }
    } catch (e) {
      console.error("Failed to sync Ollama models:", e);
    } finally {
      setFetching(false);
    }
  };

  const handleCommit = (val: string) => {
    onChange(val);
    if (isOllama) fetchOllamaModels(val);
  };

  return (
    <div
      className="mt-3 rounded-2xl p-4"
      style={{ background: "var(--paper)", border: "1px solid var(--line-faint)" }}
    >
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--ink-faint)]">
            {eyebrow}
          </div>
          <div className="text-[12.5px] text-[var(--ink-soft)] mt-0.5">
            {subtitle} {fetching && <span className="ml-2 animate-pulse text-[10px] text-[var(--coral)]">Syncing...</span>}
          </div>
        </div>
        {!isOllama && detected && (
          <div className="text-[10.5px] text-[var(--ink-mute)] max-w-[260px] text-right leading-snug">
            {t("agent.customBin.detected")}
            <code className="ml-1 break-all font-mono text-[10px] text-[var(--ink-soft)]">{detected}</code>
          </div>
        )}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => handleCommit(draft)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleCommit(draft);
            if (e.key === "Escape") setDraft(value);
          }}
          placeholder={placeholder}
          className="min-w-0 flex-1 rounded-lg px-3 py-1.5 font-mono text-[12px] outline-none"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--line)",
            color: "var(--ink)",
          }}
        />
        {value && (
          <button
            onClick={() => {
              setDraft("");
              onChange("");
            }}
            className="shrink-0 rounded-lg px-2.5 py-1.5 text-[11px] text-[var(--ink-mute)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--coral)]"
          >
            {t("agent.customBin.clear")}
          </button>
        )}
        {dirty && (
          <button
            onClick={() => onChange(draft)}
            className="shrink-0 rounded-lg px-3 py-1.5 text-[11px] font-medium"
            style={{ background: "var(--ink)", color: "var(--paper)" }}
          >
            {t("agent.customBin.save")}
          </button>
        )}
      </div>
      <div className="mt-2 text-[10.5px] text-[var(--ink-mute)] leading-snug">
        {t("agent.customBin.hint")}
      </div>
    </div>
  );
}

function MissingCard({ agent }: { agent: AgentInfo }) {
  const t = useT();
  const gradient = VENDOR_GRADIENT[agent.vendor] ?? "from-[var(--ink-faint)] to-[var(--ink-mute)]";
  return (
    <div
      className="flex items-center gap-3 rounded-xl p-3 opacity-70"
      style={{ background: "var(--paper)", border: "1px solid var(--line-faint)" }}
    >
      <div
        className={`shrink-0 grid h-8 w-8 place-items-center rounded-lg text-white text-[13px] font-semibold bg-gradient-to-br ${gradient}`}
      >
        {agent.label.charAt(0)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-medium text-[var(--ink-soft)]">{agent.label}</div>
        <div className="text-[10.5px] text-[var(--ink-faint)]">{agent.vendor}</div>
      </div>
      <span className="text-[10px] uppercase tracking-wider text-[var(--ink-faint)]">
        {t("agent.notInstalled")}
      </span>
    </div>
  );
}

function DeploySection() {
  const t = useT();
  return (
    <div>
      <div className="mb-4">
        <h3 className="text-[17px] font-semibold text-[var(--ink)]">
          {t("settings.deploy.title")}
        </h3>
        <p className="mt-1 text-[12.5px] text-[var(--ink-mute)] leading-relaxed">
          {t("settings.deploy.subtitle")}
        </p>
      </div>
      <GitHubRepoDeployConfig />
      <VercelDeployConfig />
    </div>
  );
}

function GitHubRepoDeployConfig() {
  const t = useT();
  const [token, setToken] = useState("");
  const [repo, setRepo] = useState("");
  const [branch, setBranch] = useState("");
  const [siteUrl, setSiteUrl] = useState("");
  const [configured, setConfigured] = useState(false);
  const [tokenMask, setTokenMask] = useState("");
  const [loading, setLoading] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await fetch("/api/deploy/config?provider=github-repo");
      if (!res.ok) return;
      const data = await res.json();
      setConfigured(!!data.configured);
      setTokenMask(data.tokenMask || "");
      setToken(data.tokenMask || "");
      setRepo(data.repo || "");
      setBranch(data.branch || "");
      setSiteUrl(data.siteUrl || "");
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSave = async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/deploy/config?provider=github-repo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: token.trim(),
          repo: repo.trim(),
          branch: branch.trim(),
          siteUrl: siteUrl.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
      setConfigured(!!data.configured);
      setTokenMask(data.tokenMask || "");
      setToken(data.tokenMask || token);
      setRepo(data.repo || "");
      setBranch(data.branch || "");
      setSiteUrl(data.siteUrl || "");
      setSavedAt(Date.now());
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const onClear = async () => {
    if (!confirm("Clear GitHub config from ~/.html-anything?")) return;
    setLoading(true);
    setErr(null);
    try {
      await fetch("/api/deploy/config?provider=github-repo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: "", repo: "" }),
      });
      setToken("");
      setRepo("");
      setBranch("");
      setSiteUrl("");
      setConfigured(false);
      setTokenMask("");
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full rounded-lg px-3 py-1.5 font-mono text-[12px] outline-none mb-3";
  const inputStyle = { background: "var(--surface)", border: "1px solid var(--line)", color: "var(--ink)" };
  const labelClass = "block text-[11px] uppercase tracking-[0.14em] text-[var(--ink-faint)] mb-1";

  return (
    <div
      className="mb-3 rounded-2xl p-4"
      style={{ background: "var(--paper)", border: "1px solid var(--line-faint)" }}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <div className="text-[13px] font-semibold text-[var(--ink)]">
            {t("settings.deploy.githubRepo.title")}
          </div>
          {configured && (
            <div className="text-[10.5px] text-[var(--green)] mt-0.5">
              ● {t("settings.deploy.configured")}
            </div>
          )}
        </div>
        <a
          href="https://github.com/settings/tokens"
          target="_blank"
          rel="noreferrer noopener"
          className="text-[10.5px] text-[var(--coral)] hover:underline shrink-0"
        >
          github.com/settings/tokens ↗
        </a>
      </div>

      <label className={labelClass}>{t("settings.deploy.githubRepo.tokenLabel")}</label>
      <input
        type="text"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        placeholder={t("settings.deploy.githubRepo.tokenPlaceholder")}
        className={inputClass}
        style={inputStyle}
      />

      <label className={labelClass}>{t("settings.deploy.githubRepo.repoLabel")}</label>
      <input
        type="text"
        value={repo}
        onChange={(e) => setRepo(e.target.value)}
        placeholder={t("settings.deploy.githubRepo.repoPlaceholder")}
        className={inputClass}
        style={inputStyle}
      />

      <label className={labelClass}>{t("settings.deploy.githubRepo.branchLabel")}</label>
      <input
        type="text"
        value={branch}
        onChange={(e) => setBranch(e.target.value)}
        placeholder="main"
        className={inputClass}
        style={inputStyle}
      />

      <label className={labelClass}>{t("settings.deploy.githubRepo.siteUrlLabel")}</label>
      <input
        type="text"
        value={siteUrl}
        onChange={(e) => setSiteUrl(e.target.value)}
        placeholder={t("settings.deploy.githubRepo.siteUrlPlaceholder")}
        className={inputClass}
        style={inputStyle}
      />
      <div className="text-[10.5px] text-[var(--ink-mute)] -mt-2 mb-3 leading-snug">
        {t("settings.deploy.githubRepo.siteUrlHint")}
      </div>

      <div className="flex items-center gap-2 text-[10.5px] text-[var(--ink-mute)] mb-3 leading-snug">
        {t("settings.deploy.githubRepo.tokenHint")}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onSave}
          disabled={loading || !token.trim() || !repo.trim()}
          className="rounded-lg px-3 py-1.5 text-[11px] font-medium disabled:opacity-40"
          style={{ background: "var(--ink)", color: "var(--paper)" }}
        >
          {t("settings.deploy.save")}
        </button>
        {configured && (
          <button
            onClick={onClear}
            disabled={loading}
            className="rounded-lg px-2.5 py-1.5 text-[11px] text-[var(--ink-mute)] hover:bg-[var(--surface)] hover:text-[var(--coral)]"
          >
            {t("settings.deploy.clear")}
          </button>
        )}
        {savedAt && (
          <span className="text-[10.5px] text-[var(--green)]">
            {t("settings.deploy.configured")}
          </span>
        )}
      </div>
      {err && (
        <div className="mt-2 text-[11px]" style={{ color: "var(--red)" }}>
          {err}
        </div>
      )}
    </div>
  );
}

function VercelDeployConfig() {
  const t = useT();
  const [token, setToken] = useState("");
  const [teamSlug, setTeamSlug] = useState("");
  const [configured, setConfigured] = useState(false);
  const [tokenMask, setTokenMask] = useState("");
  const [loading, setLoading] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await fetch("/api/deploy/config?provider=vercel");
      if (!res.ok) return;
      const data = await res.json();
      setConfigured(!!data.configured);
      setTokenMask(data.tokenMask || "");
      setToken(data.tokenMask || "");
      setTeamSlug(data.teamSlug || "");
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSave = async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/deploy/config?provider=vercel", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.trim(), teamSlug: teamSlug.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
      setConfigured(!!data.configured);
      setTokenMask(data.tokenMask || "");
      setToken(data.tokenMask || token);
      setTeamSlug(data.teamSlug || "");
      setSavedAt(Date.now());
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const onClear = async () => {
    if (!confirm("Clear Vercel token from ~/.html-anything?")) return;
    setLoading(true);
    setErr(null);
    try {
      await fetch("/api/deploy/config?provider=vercel", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: "", teamSlug: "" }),
      });
      setToken("");
      setTeamSlug("");
      setConfigured(false);
      setTokenMask("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="mb-3 rounded-2xl p-4"
      style={{ background: "var(--paper)", border: "1px solid var(--line-faint)" }}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <div className="text-[13px] font-semibold text-[var(--ink)]">
            {t("settings.deploy.vercel.title")}
          </div>
          {configured && (
            <div className="text-[10.5px] text-[var(--green)] mt-0.5">
              ● {t("settings.deploy.configured")}
            </div>
          )}
        </div>
        <a
          href="https://vercel.com/account/tokens"
          target="_blank"
          rel="noreferrer noopener"
          className="text-[10.5px] text-[var(--coral)] hover:underline shrink-0"
        >
          vercel.com/account/tokens ↗
        </a>
      </div>
      <label className="block text-[11px] uppercase tracking-[0.14em] text-[var(--ink-faint)] mb-1">
        {t("settings.deploy.vercel.tokenLabel")}
      </label>
      <input
        type="text"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        placeholder={t("settings.deploy.vercel.tokenPlaceholder")}
        className="w-full rounded-lg px-3 py-1.5 font-mono text-[12px] outline-none mb-2"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--line)",
          color: "var(--ink)",
        }}
      />
      <label className="block text-[11px] uppercase tracking-[0.14em] text-[var(--ink-faint)] mb-1">
        {t("settings.deploy.vercel.teamSlugLabel")}
      </label>
      <input
        type="text"
        value={teamSlug}
        onChange={(e) => setTeamSlug(e.target.value)}
        placeholder={t("settings.deploy.vercel.teamSlugPlaceholder")}
        className="w-full rounded-lg px-3 py-1.5 font-mono text-[12px] outline-none mb-3"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--line)",
          color: "var(--ink)",
        }}
      />
      <div className="flex items-center gap-2 text-[10.5px] text-[var(--ink-mute)] mb-2 leading-snug">
        {t("settings.deploy.vercel.tokenHint")}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onSave}
          disabled={loading || !token.trim() || token.trim() === tokenMask}
          className="rounded-lg px-3 py-1.5 text-[11px] font-medium disabled:opacity-40"
          style={{ background: "var(--ink)", color: "var(--paper)" }}
        >
          {t("settings.deploy.save")}
        </button>
        {configured && (
          <button
            onClick={onClear}
            disabled={loading}
            className="rounded-lg px-2.5 py-1.5 text-[11px] text-[var(--ink-mute)] hover:bg-[var(--surface)] hover:text-[var(--coral)]"
          >
            {t("settings.deploy.clear")}
          </button>
        )}
        {savedAt && (
          <span className="text-[10.5px] text-[var(--green)]">
            {t("settings.deploy.configured")}
          </span>
        )}
      </div>
      {err && (
        <div className="mt-2 text-[11px]" style={{ color: "var(--red)" }}>
          {err}
        </div>
      )}
    </div>
  );
}

// ── Backup & Restore ──────────────────────────────────────────────────────────

const LS_KEY = "html-everything-store";

function toB64(arr: Uint8Array): string {
  let s = "";
  for (let i = 0; i < arr.length; i++) s += String.fromCharCode(arr[i]);
  return btoa(s);
}

function fromB64(s: string): Uint8Array {
  const binary = atob(s);
  const result = new Uint8Array(new ArrayBuffer(binary.length));
  for (let i = 0; i < binary.length; i++) result[i] = binary.charCodeAt(i);
  return result;
}

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const raw = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveKey"] as KeyUsage[],
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: new Uint8Array(salt), iterations: 300_000, hash: "SHA-256" },
    raw,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"] as KeyUsage[],
  );
}

async function encryptJson(data: unknown, password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(JSON.stringify(data)),
  );
  return {
    algorithm: "AES-GCM-PBKDF2-SHA256",
    iterations: 300_000,
    salt: toB64(salt),
    iv: toB64(iv),
    ciphertext: toB64(new Uint8Array(ciphertext)),
  };
}

async function decryptJson(
  blob: { salt: string; iv: string; ciphertext: string },
  password: string,
): Promise<unknown> {
  const iv = fromB64(blob.iv);
  const data = fromB64(blob.ciphertext);
  const key = await deriveKey(password, fromB64(blob.salt));
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv as unknown as BufferSource },
    key,
    data as unknown as BufferSource,
  );
  return JSON.parse(new TextDecoder().decode(plain));
}

function BackupSection() {
  const t = useT();
  const [exportPw, setExportPw] = useState("");
  const [importPw, setImportPw] = useState("");
  const [importFile, setImportFile] = useState<File | null>(null);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [exportMsg, setExportMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [importMsg, setImportMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const handleExport = async () => {
    if (!exportPw) return;
    setExporting(true);
    setExportMsg(null);
    try {
      const res = await fetch("/api/backup");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { tokens, envLocal } = await res.json();

      const encryptedTokens = await encryptJson(tokens, exportPw);
      const appState = JSON.parse(localStorage.getItem(LS_KEY) ?? "{}");

      const backup = {
        version: 1,
        exportedAt: new Date().toISOString(),
        appState,
        envLocal,
        tokens: encryptedTokens,
      };

      const blob = new Blob([JSON.stringify(backup, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `html-anything-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setExportMsg({ ok: true, text: t("settings.backup.export.success") });
    } catch (err) {
      setExportMsg({ ok: false, text: err instanceof Error ? err.message : String(err) });
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async () => {
    if (!importFile || !importPw) return;
    setImporting(true);
    setImportMsg(null);
    try {
      const text = await importFile.text();
      let backup: Record<string, unknown>;
      try {
        backup = JSON.parse(text);
      } catch {
        throw new Error(t("settings.backup.import.errorInvalidFile"));
      }

      if (!backup.version || typeof backup.tokens !== "object" || !(backup.tokens as Record<string, unknown>).ciphertext) {
        throw new Error(t("settings.backup.import.errorInvalidFile"));
      }

      let rawTokens: unknown;
      try {
        rawTokens = await decryptJson(
          backup.tokens as { salt: string; iv: string; ciphertext: string },
          importPw,
        );
      } catch {
        throw new Error(t("settings.backup.import.errorWrongPassword"));
      }

      // Restore tokens on server
      await fetch("/api/backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokens: rawTokens }),
      });

      // Restore env vars
      if (backup.envLocal && typeof backup.envLocal === "object") {
        await fetch("/api/config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(backup.envLocal),
        });
      }

      // Restore localStorage
      if (backup.appState) {
        localStorage.setItem(LS_KEY, JSON.stringify(backup.appState));
      }

      setImportMsg({ ok: true, text: t("settings.backup.import.success") });
    } catch (err) {
      setImportMsg({ ok: false, text: err instanceof Error ? err.message : String(err) });
    } finally {
      setImporting(false);
    }
  };

  const cardStyle = {
    background: "var(--paper)",
    border: "1px solid var(--line-faint)",
  };
  const inputStyle = {
    background: "var(--surface)",
    border: "1px solid var(--line)",
    color: "var(--ink)",
  };
  const labelClass = "block text-[11px] uppercase tracking-[0.14em] text-[var(--ink-faint)] mb-1";
  const inputClass = "w-full rounded-lg px-3 py-1.5 font-mono text-[12px] outline-none mb-3";

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-[17px] font-semibold text-[var(--ink)]">
          {t("settings.backup.title")}
        </h3>
        <p className="mt-1 text-[12.5px] text-[var(--ink-mute)] leading-relaxed">
          {t("settings.backup.subtitle")}
        </p>
      </div>

      {/* Export */}
      <div className="mb-3 rounded-2xl p-4" style={cardStyle}>
        <div className="text-[13px] font-semibold text-[var(--ink)] mb-3">
          {t("settings.backup.export.heading")}
        </div>
        <label className={labelClass}>{t("settings.backup.export.passwordLabel")}</label>
        <input
          type="password"
          value={exportPw}
          onChange={(e) => setExportPw(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleExport(); }}
          placeholder={t("settings.backup.export.passwordPlaceholder")}
          className={inputClass}
          style={inputStyle}
          autoComplete="new-password"
        />
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            disabled={exporting || !exportPw}
            className="rounded-lg px-3 py-1.5 text-[11px] font-medium disabled:opacity-40"
            style={{ background: "var(--ink)", color: "var(--paper)" }}
          >
            {exporting
              ? t("settings.backup.export.exporting")
              : t("settings.backup.export.button")}
          </button>
          {exportMsg && (
            <span
              className="text-[11px]"
              style={{ color: exportMsg.ok ? "var(--green)" : "var(--coral)" }}
            >
              {exportMsg.text}
            </span>
          )}
        </div>
      </div>

      {/* Import */}
      <div className="mb-3 rounded-2xl p-4" style={cardStyle}>
        <div className="text-[13px] font-semibold text-[var(--ink)] mb-3">
          {t("settings.backup.import.heading")}
        </div>
        <label className={labelClass}>{t("settings.backup.import.fileLabel")}</label>
        <input
          type="file"
          accept=".json,application/json"
          onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
          className="w-full text-[12px] text-[var(--ink-soft)] mb-3 file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--surface)] file:px-2.5 file:py-1 file:text-[11px] file:text-[var(--ink-soft)] file:cursor-pointer"
        />
        <label className={labelClass}>{t("settings.backup.import.passwordLabel")}</label>
        <input
          type="password"
          value={importPw}
          onChange={(e) => setImportPw(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleImport(); }}
          placeholder={t("settings.backup.import.passwordPlaceholder")}
          className={inputClass}
          style={inputStyle}
          autoComplete="current-password"
        />
        <div className="flex items-center gap-2">
          <button
            onClick={handleImport}
            disabled={importing || !importFile || !importPw}
            className="rounded-lg px-3 py-1.5 text-[11px] font-medium disabled:opacity-40"
            style={{ background: "var(--ink)", color: "var(--paper)" }}
          >
            {importing
              ? t("settings.backup.import.importing")
              : t("settings.backup.import.button")}
          </button>
          {importMsg && (
            <span
              className="text-[11px] leading-snug"
              style={{ color: importMsg.ok ? "var(--green)" : "var(--coral)" }}
            >
              {importMsg.text}
            </span>
          )}
        </div>
      </div>

      {/* Note */}
      <div
        className="rounded-xl px-4 py-3 text-[11px] text-[var(--ink-mute)] leading-relaxed"
        style={{ background: "var(--paper)", border: "1px solid var(--line-faint)" }}
      >
        🔐 {t("settings.backup.note")}
      </div>
    </div>
  );
}

function CloudflareDeployConfig() {
  const t = useT();
  const [token, setToken] = useState("");
  const [accountId, setAccountId] = useState("");
  const [configured, setConfigured] = useState(false);
  const [tokenMask, setTokenMask] = useState("");
  const [loading, setLoading] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await fetch("/api/deploy/config?provider=cloudflare-pages");
      if (!res.ok) return;
      const data = await res.json();
      setConfigured(!!data.configured);
      setTokenMask(data.tokenMask || "");
      setToken(data.tokenMask || "");
      setAccountId(data.accountId || "");
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSave = async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/deploy/config?provider=cloudflare-pages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.trim(), accountId: accountId.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
      setConfigured(!!data.configured);
      setTokenMask(data.tokenMask || "");
      setToken(data.tokenMask || token);
      setAccountId(data.accountId || "");
      setSavedAt(Date.now());
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const onClear = async () => {
    if (!confirm("Clear Cloudflare token from ~/.html-anything?")) return;
    setLoading(true);
    setErr(null);
    try {
      await fetch("/api/deploy/config?provider=cloudflare-pages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: "", accountId: "" }),
      });
      setToken("");
      setAccountId("");
      setConfigured(false);
      setTokenMask("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="mb-3 rounded-2xl p-4"
      style={{ background: "var(--paper)", border: "1px solid var(--line-faint)" }}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <div className="text-[13px] font-semibold text-[var(--ink)]">
            {t("settings.deploy.cloudflare.title")}
          </div>
          {configured && (
            <div className="text-[10.5px] text-[var(--green)] mt-0.5">
              ● {t("settings.deploy.configured")}
            </div>
          )}
        </div>
        <a
          href="https://dash.cloudflare.com/?to=/:account/workers-and-pages/pages"
          target="_blank"
          rel="noreferrer noopener"
          className="text-[10.5px] text-[var(--coral)] hover:underline shrink-0"
        >
          dash.cloudflare.com ↗
        </a>
      </div>

      <label className="block text-[11px] uppercase tracking-[0.14em] text-[var(--ink-faint)] mb-1">
        {t("settings.deploy.cloudflare.accountIdLabel")}
      </label>
      <input
        type="text"
        value={accountId}
        onChange={(e) => setAccountId(e.target.value)}
        placeholder={t("settings.deploy.cloudflare.accountIdPlaceholder")}
        className="w-full rounded-lg px-3 py-1.5 font-mono text-[12px] outline-none mb-3"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--line)",
          color: "var(--ink)",
        }}
      />

      <label className="block text-[11px] uppercase tracking-[0.14em] text-[var(--ink-faint)] mb-1">
        {t("settings.deploy.cloudflare.tokenLabel")}
      </label>
      <input
        type="text"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        placeholder={t("settings.deploy.cloudflare.tokenPlaceholder")}
        className="w-full rounded-lg px-3 py-1.5 font-mono text-[12px] outline-none mb-2"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--line)",
          color: "var(--ink)",
        }}
      />

      <div className="flex items-center gap-2 text-[10.5px] text-[var(--ink-mute)] mb-3 leading-snug">
        {t("settings.deploy.cloudflare.tokenHint")}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onSave}
          disabled={loading || !token.trim() || !accountId.trim() || (token.trim() === tokenMask && configured)}
          className="rounded-lg px-3 py-1.5 text-[11px] font-medium disabled:opacity-40"
          style={{ background: "var(--ink)", color: "var(--paper)" }}
        >
          {t("settings.deploy.save")}
        </button>
        {configured && (
          <button
            onClick={onClear}
            disabled={loading}
            className="rounded-lg px-2.5 py-1.5 text-[11px] text-[var(--ink-mute)] hover:bg-[var(--surface)] hover:text-[var(--coral)]"
          >
            {t("settings.deploy.clear")}
          </button>
        )}
        {savedAt && (
          <span className="text-[10.5px] text-[var(--green)]">
            {t("settings.deploy.configured")}
          </span>
        )}
      </div>
      {err && (
        <div className="mt-2 text-[11px]" style={{ color: "var(--red)" }}>
          {err}
        </div>
      )}
    </div>
  );
}

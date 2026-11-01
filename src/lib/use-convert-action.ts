"use client";

import { useCallback } from "react";
import { useStore, selectActiveTask } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { useConvert } from "@/lib/use-convert";

export function useConvertAction() {
  const agent = useStore((s) => s.selectedAgent);
  const agents = useStore((s) => s.agents);
  const agentModels = useStore((s) => s.agentModels);
  const activeTaskId = useStore((s) => s.activeTaskId);
  const template = useStore((s) => selectActiveTask(s)?.templateId ?? "article-magazine");
  const content = useStore((s) => selectActiveTask(s)?.content ?? "");
  const format = useStore((s) => selectActiveTask(s)?.format ?? "text");
  const status = useStore((s) => selectActiveTask(s)?.status ?? "idle");
  const { run, cancel } = useConvert();
  const t = useT();

  const agentInfo = agents.find((a) => a.id === agent);
  const model = agent ? agentModels[agent] ?? "default" : "default";
  const canConvert =
    !!agent && !!content.trim() && status !== "running" && !agentInfo?.unsupported;

  const isRunning = status === "running";

  const tip = !agent
    ? t("toolbar.firstSelectAgent")
    : agentInfo?.unsupported
      ? t("toolbar.unsupportedProtocol")
      : !content.trim()
        ? t("toolbar.enterContent")
        : t("convertChip.tooltip");

  const trigger = useCallback(() => {
    if (isRunning) {
      cancel(activeTaskId);
      return;
    }
    if (!canConvert) return;
    run({ taskId: activeTaskId, agent: agent!, templateId: template, content, format, model });
  }, [isRunning, canConvert, cancel, run, activeTaskId, agent, template, content, format, model]);

  return {
    agent,
    agentInfo,
    canConvert,
    isRunning,
    tip,
    trigger,
    status,
  };
}

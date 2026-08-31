"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Bot, ChevronLeft, Clock, Copy, Download, FileText, History,
  Play, Plus, RotateCcw, Settings2, Sparkles, Trash2, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DashboardCard, DashboardCardContent, DashboardCardHeader,
  DashboardCardTitle, DashboardCardDescription, DashboardPanel,
} from "@/components/dashboard/ui/dashboard-card";
import { dashboardInputClass, dashboardSelectClass } from "@/components/dashboard/ui/dashboard-styles";
import { safeMarkdownToHtml } from "@/lib/ai/sanitize";
import {
  CheckboxToggle, GenerationProgress,
  ProjectHistoryCard, EmptyHistory, HistoryPagination,
  type ProjectHistoryItem,
} from "@/components/dashboard/builder-shared";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/client";
import { useProductT } from "@/lib/i18n/use-scoped-t";
import { GlsGenerationLanguageSelect } from "@/components/dashboard/language/gls-generation-language-select";
import {
  getInitialGlsGenerationLanguage,
  glsGenerationLanguagePayload,
} from "@/lib/language-platform/generation/service";
import { AGENT_TYPES, AGENT_TOOLS, AGENT_TEMPLATES, AGENT_CATEGORIES, getAgentTypeLabel, getToolLabel } from "@/lib/constants/ai-agents";
import type { Agent, AgentExecution } from "@/types/agents";
import type { AgentOutput } from "@/plugins/ai-agents/types";

type Tab = "agents" | "run" | "create" | "history" | "generating" | "result";

type Props = {
  initialAgents?: Agent[];
  initialExecutions?: AgentExecution[];
};

export function AiAgentsTool({ initialAgents = [], initialExecutions = [] }: Props) {
  const { t, locale } = useTranslation();
  const p = useProductT("aiAgents");
  const [tab, setTab] = useState<Tab>("agents");
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [executions, setExecutions] = useState<AgentExecution[]>(initialExecutions);

  // Create agent state
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newType, setNewType] = useState("custom");
  const [newCategory, setNewCategory] = useState("general");
  const [newPrompt, setNewPrompt] = useState("");
  const [newTools, setNewTools] = useState<string[]>([]);
  const [newTemp, setNewTemp] = useState("0.7");

  // Run agent state
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [task, setTask] = useState("");
  const [context, setContext] = useState("");
  const [maxSteps, setMaxSteps] = useState("6");
  const [language, setLanguage] = useState(() =>
    getInitialGlsGenerationLanguage({ fallback: "ui-locale", uiLocale: locale }),
  );
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<{ output: AgentOutput; execution: AgentExecution } | null>(null);

  // History
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);

  const fetchAgents = useCallback(async () => {
    try {
      const res = await fetch("/api/ai-agents?limit=50");
      if (!res.ok) return;
      const d = await res.json();
      setAgents(d.agents ?? []);
    } catch { /* ignore */ }
  }, []);

  const fetchExecutions = useCallback(async () => {
    try {
      const res = await fetch(`/api/ai-agents/executions?page=${historyPage}&limit=10`);
      if (!res.ok) return;
      const d = await res.json();
      setExecutions(d.executions ?? []);
      setHistoryTotal(d.total ?? 0);
    } catch { /* ignore */ }
  }, [historyPage]);

  useEffect(() => { if (tab === "history") fetchExecutions(); }, [tab, fetchExecutions]);

  const handleCreateAgent = async () => {
    if (!newName.trim()) { toast.error(p("errors.agentNameRequired")); return; }
    const res = await fetch("/api/ai-agents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create-agent",
        name: newName, description: newDesc, agentType: newType,
        category: newCategory, systemPrompt: newPrompt, tools: newTools,
        temperature: parseFloat(newTemp) || 0.7,
      }),
    });
    const d = await res.json();
    if (!res.ok) { toast.error(d.error ?? p("errors.createAgentFailed")); return; }
    toast.success(p("toasts.agentCreated"));
    setNewName(""); setNewDesc(""); setNewPrompt(""); setNewTools([]);
    fetchAgents();
    setTab("agents");
  };

  const handleFromTemplate = (tpl: typeof AGENT_TEMPLATES[number]) => {
    setNewName(tpl.name);
    setNewDesc(tpl.description);
    setNewType(tpl.type);
    setNewCategory(tpl.category);
    setNewPrompt(tpl.systemPrompt);
    setNewTools([...tpl.tools]);
    setTab("create");
  };

  const handleRunAgent = async () => {
    if (!task.trim()) { toast.error(p("errors.describeTask")); return; }
    setGenerating(true);
    setTab("generating");
    try {
      const res = await fetch("/api/ai-agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: selectedAgent?.id,
          task, context, maxSteps: parseInt(maxSteps) || 6,
          ...glsGenerationLanguagePayload(language),
        }),
      });
      const d = await res.json();
      if (!res.ok) { toast.error(d.error ?? p("errors.agentTaskFailed")); setTab("run"); return; }
      setResult({ output: d.output, execution: d.execution });
      setTab("result");
      toast.success(d.message ?? p("toasts.taskCompleted"));
    } catch { toast.error(p("errors.requestFailed")); setTab("run"); }
    finally { setGenerating(false); }
  };

  const handleDeleteAgent = async (id: string) => {
    await fetch(`/api/ai-agents/${id}`, { method: "DELETE" });
    toast.success(p("toasts.agentDeleted"));
    fetchAgents();
  };

  const handleDownloadResult = () => {
    if (!result?.output) return;
    const report = result.output.files?.find((f) => f.path === "report.md");
    if (!report) return;
    const blob = new Blob([report.content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${result.output.title || "agent-report"}.md`; a.click();
    URL.revokeObjectURL(url);
  };

  const executionItems: ProjectHistoryItem[] = executions.map((e) => ({
    id: e.id,
    name: e.task_name || p("steps.agentTask"),
    typeLabel: e.provider ?? "AI",
    description: `${e.status} · ${(e.token_usage?.prompt ?? 0) + (e.token_usage?.completion ?? 0)} tokens · ${e.execution_time_ms}ms`,
    status: e.status,
    created_at: e.created_at,
    is_favorite: false,
    has_blueprint: e.status === "completed",
  }));

  // ----------------------------------------------------------------
  // AGENTS LIST
  // ----------------------------------------------------------------
  if (tab === "agents") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button onClick={() => setTab("create")} size="sm" className="btn-gold gap-1.5 rounded-xl text-xs font-bold text-luxury-black">
              <Plus className="size-3" /> {p("steps.createAgent")}
            </Button>
            <Button onClick={() => setTab("history")} variant="outline" size="sm" className="gap-1.5 rounded-xl border-white/10 text-xs text-white/50">
              <History className="size-3" /> {p("steps.executionHistory")}
            </Button>
          </div>
        </div>

        {/* Templates */}
        <DashboardCard>
          <DashboardCardHeader>
            <div className="flex items-center gap-2"><Sparkles className="size-5 text-premium-gold-light" /><DashboardCardTitle>{p("steps.agentTemplates")}</DashboardCardTitle></div>
            <DashboardCardDescription>{p("steps.templatesHint")}</DashboardCardDescription>
          </DashboardCardHeader>
          <DashboardCardContent>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {AGENT_TEMPLATES.map((tpl) => (
                <DashboardPanel key={tpl.id} className="flex flex-col gap-2 p-4">
                  <p className="text-sm font-bold text-white/90">{tpl.name}</p>
                  <p className="flex-1 text-[11px] text-white/40">{tpl.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {tpl.tools.slice(0, 3).map((t) => (
                      <span key={t} className="rounded-md bg-white/5 px-1.5 py-0.5 text-[9px] text-white/30">{getToolLabel(t)}</span>
                    ))}
                    {tpl.tools.length > 3 && <span className="text-[9px] text-white/20">+{tpl.tools.length - 3}</span>}
                  </div>
                  <Button size="sm" variant="outline" className="mt-1 gap-1.5 rounded-lg border-white/10 text-xs text-white/50" onClick={() => handleFromTemplate(tpl)}>
                    <Copy className="size-3" /> {p("steps.useTemplate")}
                  </Button>
                </DashboardPanel>
              ))}
            </div>
          </DashboardCardContent>
        </DashboardCard>

        {/* User Agents */}
        <DashboardCard>
          <DashboardCardHeader>
            <div className="flex items-center gap-2"><Bot className="size-5 text-premium-gold-light" /><DashboardCardTitle>{p("steps.yourAgents", { count: agents.filter((a) => !a.is_template).length })}</DashboardCardTitle></div>
          </DashboardCardHeader>
          <DashboardCardContent>
            {agents.filter((a) => !a.is_template).length === 0 ? (
              <DashboardPanel className="py-10 text-center">
                <Bot className="mx-auto size-8 text-white/10" />
                <p className="mt-3 text-xs text-white/30">{p("steps.noAgentsYet")}</p>
              </DashboardPanel>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {agents.filter((a) => !a.is_template).map((agent) => (
                  <DashboardPanel key={agent.id} className="flex flex-col gap-2 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-bold text-white/90">{agent.name}</p>
                        <p className="text-[10px] text-white/30">{getAgentTypeLabel(agent.agent_type)} &middot; {p("steps.runs", { count: agent.total_runs })}</p>
                      </div>
                      <div className={cn("size-2 rounded-full", agent.is_active ? "bg-green-400" : "bg-white/20")} />
                    </div>
                    {agent.description && <p className="flex-1 text-[11px] text-white/40">{agent.description}</p>}
                    <div className="flex gap-1.5 pt-1">
                      <Button size="sm" className="btn-gold flex-1 gap-1 rounded-lg text-xs font-bold text-luxury-black" onClick={() => { setSelectedAgent(agent); setTab("run"); }}>
                        <Play className="size-3" /> {p("nav.run")}
                      </Button>
                      <Button size="icon-xs" variant="ghost" className="text-white/30 hover:text-red-400" onClick={() => handleDeleteAgent(agent.id)}>
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  </DashboardPanel>
                ))}
              </div>
            )}
          </DashboardCardContent>
        </DashboardCard>

        {/* Quick Run */}
        <DashboardCard>
          <DashboardCardHeader>
            <div className="flex items-center gap-2"><Zap className="size-5 text-premium-gold-light" /><DashboardCardTitle>{p("steps.quickTask")}</DashboardCardTitle></div>
            <DashboardCardDescription>{p("steps.quickTaskDescription")}</DashboardCardDescription>
          </DashboardCardHeader>
          <DashboardCardContent>
            <div className="flex gap-3">
              <Input value={task} onChange={(e) => setTask(e.target.value)} placeholder={p("placeholders.task")} className={cn(dashboardInputClass, "flex-1")} />
              <Button onClick={() => { setSelectedAgent(null); handleRunAgent(); }} disabled={generating || !task.trim()} className="btn-gold gap-1.5 rounded-xl font-bold text-luxury-black">
                <Zap className="size-4" /> {p("steps.runQuick")}
              </Button>
            </div>
          </DashboardCardContent>
        </DashboardCard>
      </div>
    );
  }

  // ----------------------------------------------------------------
  // CREATE AGENT
  // ----------------------------------------------------------------
  if (tab === "create") {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-white/40" onClick={() => setTab("agents")}>
          <ChevronLeft className="size-3" /> {p("steps.backToAgents")}
        </Button>

        <DashboardCard>
          <DashboardCardHeader>
            <div className="flex items-center gap-2"><Settings2 className="size-5 text-premium-gold-light" /><DashboardCardTitle>{p("steps.createNewAgent")}</DashboardCardTitle></div>
          </DashboardCardHeader>
          <DashboardCardContent>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-white/60">{p("steps.agentName")}</label>
                  <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder={p("placeholders.agentName")} className={dashboardInputClass} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-white/60">{p("steps.type")}</label>
                  <select value={newType} onChange={(e) => setNewType(e.target.value)} className={dashboardSelectClass}>
                    {AGENT_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-white/60">{p("steps.description")}</label>
                <Input value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder={p("placeholders.agentDescription")} className={dashboardInputClass} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-white/60">{p("steps.category")}</label>
                  <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className={dashboardSelectClass}>
                    {AGENT_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-white/60">{p("steps.temperature")}</label>
                  <select value={newTemp} onChange={(e) => setNewTemp(e.target.value)} className={dashboardSelectClass}>
                    <option value="0.3">{p("steps.conservative")}</option>
                    <option value="0.5">{p("steps.balanced")}</option>
                    <option value="0.7">{p("steps.creative")}</option>
                    <option value="1.0">{p("steps.experimental")}</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-white/60">{p("steps.systemPrompt")}</label>
                <textarea value={newPrompt} onChange={(e) => setNewPrompt(e.target.value)}
                  placeholder={p("placeholders.systemPrompt")}
                  className={cn(dashboardInputClass, "min-h-[100px] resize-y")} rows={4} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/60">{p("steps.availableTools")}</label>
                <div className="flex flex-wrap gap-2">
                  {AGENT_TOOLS.map((tool) => (
                    <CheckboxToggle key={tool.id} label={tool.label} checked={newTools.includes(tool.id)}
                      onChange={(c) => setNewTools((p) => c ? [...p, tool.id] : p.filter((x) => x !== tool.id))} />
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="rounded-xl border-white/10 text-white/50" onClick={() => setTab("agents")}>{t("common.cancel")}</Button>
                <Button size="sm" className="btn-gold rounded-xl font-bold text-luxury-black" onClick={handleCreateAgent}>{p("steps.createAgentBtn")}</Button>
              </div>
            </div>
          </DashboardCardContent>
        </DashboardCard>
      </div>
    );
  }

  // ----------------------------------------------------------------
  // RUN AGENT
  // ----------------------------------------------------------------
  if (tab === "run") {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-white/40" onClick={() => setTab("agents")}>
          <ChevronLeft className="size-3" /> {p("steps.backToAgents")}
        </Button>

        <DashboardCard>
          <DashboardCardHeader>
            <div className="flex items-center gap-2">
              <Play className="size-5 text-premium-gold-light" />
              <div>
                <DashboardCardTitle>{selectedAgent ? p("steps.runAgentTitle", { name: selectedAgent.name }) : p("steps.quickTask")}</DashboardCardTitle>
                {selectedAgent && <DashboardCardDescription>{selectedAgent.description}</DashboardCardDescription>}
              </div>
            </div>
          </DashboardCardHeader>
          <DashboardCardContent>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-white/60">{p("steps.task")}</label>
                <textarea value={task} onChange={(e) => setTask(e.target.value)}
                  placeholder={p("placeholders.task")}
                  className={cn(dashboardInputClass, "min-h-[100px] resize-y")} rows={4} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-white/60">{p("steps.additionalContext")}</label>
                <textarea value={context} onChange={(e) => setContext(e.target.value)}
                  placeholder={p("placeholders.context")}
                  className={cn(dashboardInputClass, "min-h-[60px] resize-y")} rows={2} />
              </div>
              <div className="max-w-xs">
                <label className="mb-1 block text-xs font-medium text-white/60">{t("common.language")}</label>
                <GlsGenerationLanguageSelect serviceId="ai-agents" value={language} onChange={setLanguage} />
              </div>
              <div className="max-w-xs">
                <label className="mb-1 block text-xs font-medium text-white/60">{p("steps.maxStepsLabel")}</label>
                <select value={maxSteps} onChange={(e) => setMaxSteps(e.target.value)} className={dashboardSelectClass}>
                  <option value="3">{p("steps.stepsFast")}</option>
                  <option value="6">{p("steps.stepsStandard")}</option>
                  <option value="9">{p("steps.stepsThorough")}</option>
                  <option value="12">{p("steps.stepsComprehensive")}</option>
                </select>
              </div>
              {selectedAgent && selectedAgent.tools.length > 0 && (
                <div>
                  <p className="mb-1 text-xs font-medium text-white/60">{p("steps.toolsAvailable")}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(selectedAgent.tools as string[]).map((t) => (
                      <span key={t} className="rounded-md bg-premium-gold/10 px-2 py-0.5 text-[10px] font-medium text-premium-gold-light">{getToolLabel(t)}</span>
                    ))}
                  </div>
                </div>
              )}
              <Button className="btn-gold gap-2 rounded-xl font-bold text-luxury-black" onClick={handleRunAgent} disabled={!task.trim() || generating}>
                <Play className="size-4" /> {p("steps.executeAgent")}
              </Button>
            </div>
          </DashboardCardContent>
        </DashboardCard>
      </div>
    );
  }

  // ----------------------------------------------------------------
  // GENERATING
  // ----------------------------------------------------------------
  if (tab === "generating") {
    return (
      <div className="space-y-6">
        <GenerationProgress title={p("generating.title")} subtitle={p("generating.subtitle")} events={[]} />
      </div>
    );
  }

  // ----------------------------------------------------------------
  // RESULT
  // ----------------------------------------------------------------
  if (tab === "result" && result) {
    const { output } = result;
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-white/40" onClick={() => { setResult(null); setTab("agents"); }}>
            <ChevronLeft className="size-3" /> {p("steps.backToAgents")}
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1.5 rounded-xl border-white/10 text-xs text-white/50" onClick={() => { setTab("run"); }}>
              <RotateCcw className="size-3" /> {p("steps.runAgain")}
            </Button>
            <Button size="sm" className="btn-gold gap-1.5 rounded-xl text-xs font-bold text-luxury-black" onClick={handleDownloadResult}>
              <Download className="size-3" /> {p("steps.downloadReport")}
            </Button>
          </div>
        </div>

        {/* Summary */}
        <DashboardPanel gold className="p-5">
          <h2 className="text-lg font-black text-white">{output.title}</h2>
          <p className="mt-2 text-xs text-white/60">{output.summary}</p>
          {output.metrics && (
            <div className="mt-4 flex gap-4">
              {Object.entries(output.metrics).map(([k, v]) => (
                <div key={k} className="text-center">
                  <span className="text-lg font-bold text-premium-gold-light">{v}</span>
                  <p className="text-[9px] uppercase text-white/30">{k.replace(/([A-Z])/g, " $1")}</p>
                </div>
              ))}
            </div>
          )}
        </DashboardPanel>

        {/* Step Results */}
        <DashboardCard>
          <DashboardCardHeader>
            <div className="flex items-center gap-2"><Clock className="size-5 text-premium-gold-light" /><DashboardCardTitle>{p("steps.executionSteps", { count: output.stepResults?.length ?? 0 })}</DashboardCardTitle></div>
          </DashboardCardHeader>
          <DashboardCardContent>
            <div className="space-y-2">
              {(output.stepResults ?? []).map((step, i) => (
                <DashboardPanel key={step.stepId} className="p-3">
                  <div className="flex items-start gap-3">
                    <span className="flex size-6 flex-shrink-0 items-center justify-center rounded-full bg-premium-gold/15 text-[10px] font-bold text-premium-gold-light">{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white/80">{step.stepName}</p>
                      <p className="mt-0.5 text-[11px] text-white/40">{step.result.slice(0, 300)}{step.result.length > 300 ? "..." : ""}</p>
                      <p className="mt-1 text-[10px] text-white/20">{step.durationMs}ms</p>
                    </div>
                  </div>
                </DashboardPanel>
              ))}
            </div>
          </DashboardCardContent>
        </DashboardCard>

        {/* Report Sections */}
        {output.sections && output.sections.length > 0 && (
          <DashboardCard>
            <DashboardCardHeader><DashboardCardTitle>{p("steps.report")}</DashboardCardTitle></DashboardCardHeader>
            <DashboardCardContent>
              <div className="space-y-4">
                {output.sections.map((s, i) => (
                  <div key={i}>
                    <h3 className="text-sm font-bold text-white/80">{s.heading}</h3>
                    <div className="mt-1 text-xs text-white/50 [&_ul]:list-disc [&_ul]:pl-4 [&_li]:mt-0.5"
                      dangerouslySetInnerHTML={{ __html: safeMarkdownToHtml(s.content) }} />
                  </div>
                ))}
              </div>
            </DashboardCardContent>
          </DashboardCard>
        )}

        {/* Deliverables & Recommendations */}
        <div className="grid gap-4 sm:grid-cols-2">
          {output.deliverables && output.deliverables.length > 0 && (
            <DashboardCard>
              <DashboardCardHeader><DashboardCardTitle>{p("steps.deliverables")}</DashboardCardTitle></DashboardCardHeader>
              <DashboardCardContent>
                <ul className="space-y-1">
                  {output.deliverables.map((d, i) => <li key={i} className="flex gap-2 text-xs text-white/60"><span className="text-premium-gold-light">✓</span>{d}</li>)}
                </ul>
              </DashboardCardContent>
            </DashboardCard>
          )}
          {output.recommendations && output.recommendations.length > 0 && (
            <DashboardCard>
              <DashboardCardHeader><DashboardCardTitle>{p("steps.recommendations")}</DashboardCardTitle></DashboardCardHeader>
              <DashboardCardContent>
                <ul className="space-y-1">
                  {output.recommendations.map((r, i) => <li key={i} className="flex gap-2 text-xs text-white/60"><span className="text-premium-gold-light">→</span>{r}</li>)}
                </ul>
              </DashboardCardContent>
            </DashboardCard>
          )}
        </div>

        {/* Files */}
        {output.files && output.files.length > 0 && (
          <DashboardCard>
            <DashboardCardHeader>
              <div className="flex items-center gap-2"><FileText className="size-5 text-premium-gold-light" /><DashboardCardTitle>{p("steps.outputFiles")}</DashboardCardTitle></div>
            </DashboardCardHeader>
            <DashboardCardContent>
              <div className="space-y-2">
                {output.files.map((f) => (
                  <DashboardPanel key={f.path} className="flex items-center gap-3 p-3">
                    <FileText className="size-4 text-white/20" />
                    <span className="flex-1 font-mono text-xs text-white/70">{f.path}</span>
                    <span className="text-[10px] text-white/30">{(f.content.length / 1024).toFixed(1)} KB</span>
                  </DashboardPanel>
                ))}
              </div>
            </DashboardCardContent>
          </DashboardCard>
        )}
      </div>
    );
  }

  // ----------------------------------------------------------------
  // EXECUTION HISTORY
  // ----------------------------------------------------------------
  if (tab === "history") {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-white/40" onClick={() => setTab("agents")}>
          <ChevronLeft className="size-3" /> {p("steps.backToAgents")}
        </Button>

        <DashboardCard>
          <DashboardCardHeader>
            <div className="flex items-center gap-2"><History className="size-5 text-premium-gold-light" /><DashboardCardTitle>{p("steps.executionHistoryTitle")}</DashboardCardTitle></div>
            <DashboardCardDescription>{p("steps.totalExecutions", { count: historyTotal })}</DashboardCardDescription>
          </DashboardCardHeader>
          <DashboardCardContent>
            {executionItems.length === 0 ? (
              <EmptyHistory noun={p("history.emptyNoun")} onNew={() => setTab("agents")} />
            ) : (
              <>
                <div className="space-y-2">
                  {executionItems.map((item) => (
                    <ProjectHistoryCard key={item.id} item={item} icon={Bot}
                      onFavorite={() => {}}
                      onDelete={() => {}}
                      onRegenerate={() => {}}
                      onView={async () => {
                        const exec = executions.find((e) => e.id === item.id);
                        if (!exec) return;
                        try {
                          const res = await fetch(`/api/ai-agents/executions/${exec.id}`);
                          const data = await res.json();
                          if (!res.ok || !data.execution) {
                            throw new Error(data.error || p("errors.loadExecutionFailed"));
                          }
                          const full = data.execution as AgentExecution;
                          setResult({
                            output: (full.output ?? {}) as unknown as AgentOutput,
                            execution: full,
                          });
                          setTab("result");
                        } catch (error) {
                          toast.error(
                            error instanceof Error
                              ? error.message
                              : p("errors.loadExecutionFailed"),
                          );
                        }
                      }}
                    />
                  ))}
                </div>
                <HistoryPagination page={historyPage} total={historyTotal} pageSize={10} onPageChange={setHistoryPage} />
              </>
            )}
          </DashboardCardContent>
        </DashboardCard>
      </div>
    );
  }

  return null;
}

// simpleMarkdownToHtml replaced by safeMarkdownToHtml from @/lib/ai/sanitize

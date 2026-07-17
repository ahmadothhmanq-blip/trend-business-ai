"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Check,
  ClipboardCopy,
  Copy,
  Download,
  FileText,
  Lightbulb,
  RefreshCw,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DashboardCard,
  DashboardCardContent,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCardDescription,
  DashboardPanel,
} from "@/components/dashboard/ui/dashboard-card";
import { dashboardInputClass, dashboardSelectClass } from "@/components/dashboard/ui/dashboard-styles";
import {
  TypeSelectorCard,
  CheckboxToggle,
  GenerationProgress,
  ProjectHistoryCard,
  EmptyHistory,
  HistoryPagination,
  type ProjectHistoryItem,
} from "@/components/dashboard/builder-shared";
import { cn } from "@/lib/utils";
import { safeMarkdownToHtml } from "@/lib/ai/sanitize";
import {
  BUSINESS_TOOLS,
  BUSINESS_TYPES,
  COMPANY_STAGES,
  BUSINESS_INDUSTRIES,
  BUSINESS_OPTION_LIST,
  getBusinessTool,
  getBusinessToolLabel,
  getBusinessTypeLabel,
} from "@/lib/constants/business-suite";
import type { BusinessGeneration, BusinessScorecard } from "@/types/business";

type Props = { initialGenerations?: BusinessGeneration[] };

/* ------------------------------------------------------------------ */
/*  SCORECARD CARD                                                     */
/* ------------------------------------------------------------------ */

function ScoreGauge({ label, value, max = 100, invert }: { label: string; value: number; max?: number; invert?: boolean }) {
  const pct = Math.round((value / max) * 100);
  const color = invert
    ? (pct >= 70 ? "text-red-400" : pct >= 40 ? "text-yellow-400" : "text-green-400")
    : (pct >= 70 ? "text-green-400" : pct >= 40 ? "text-yellow-400" : "text-red-400");
  return (
    <div className="flex flex-col items-center p-3">
      <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">{label}</span>
      <span className={cn("mt-1 text-xl font-black", color)}>{value}</span>
      <div className="mt-1 h-1 w-12 overflow-hidden rounded-full bg-white/5">
        <div className={cn("h-full rounded-full", color.replace("text-", "bg-").replace("-400", "-500/50"))} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function ScorecardDisplay({ sc }: { sc: BusinessScorecard }) {
  return (
    <DashboardPanel className="grid grid-cols-3 gap-0 divide-x divide-white/[0.06] sm:grid-cols-4 lg:grid-cols-7">
      <ScoreGauge label="Overall" value={sc.overall} />
      <ScoreGauge label="Viability" value={sc.viability} />
      <ScoreGauge label="Market Fit" value={sc.marketFit} />
      <ScoreGauge label="Financials" value={sc.financialHealth} />
      <ScoreGauge label="Competitive" value={sc.competitivePosition} />
      <ScoreGauge label="Growth" value={sc.growthPotential} />
      <ScoreGauge label="Risk" value={sc.riskLevel} invert />
    </DashboardPanel>
  );
}

/* ------------------------------------------------------------------ */
/*  PREVIEW                                                            */
/* ------------------------------------------------------------------ */

type PreviewTab = "document" | "scorecard" | "risks" | "action-plan" | "files";

function BusinessPreview({
  gen,
  onBack,
  onRegenerate,
  onContinue,
}: {
  gen: BusinessGeneration;
  onBack: () => void;
  onRegenerate?: () => void;
  onContinue?: () => void;
}) {
  const bp = gen.blueprint;
  const [tab, setTab] = useState<PreviewTab>("document");
  const [copied, setCopied] = useState(false);

  if (!bp) {
    return (
      <DashboardPanel className="py-16 text-center">
        <FileText className="mx-auto size-10 text-white/20" />
        <p className="mt-4 text-white/50">No analysis to preview</p>
        <Button variant="outline" className="mt-4 rounded-xl border-white/10 text-white/60" onClick={onBack}>Back</Button>
      </DashboardPanel>
    );
  }

  const tabs: { key: PreviewTab; label: string; show: boolean }[] = [
    { key: "document", label: "Document", show: true },
    { key: "scorecard", label: "Scorecard", show: !!bp.scorecard },
    { key: "risks", label: `Risks (${bp.risks.length})`, show: bp.risks.length > 0 || bp.opportunities.length > 0 },
    { key: "action-plan", label: `Action Plan (${bp.actionPlan.length})`, show: bp.actionPlan.length > 0 || bp.recommendations.length > 0 },
    { key: "files", label: `Files (${bp.files.length})`, show: bp.files.length > 0 },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-xs" onClick={onBack} className="text-white/40 hover:text-white"><ArrowLeft className="size-4" /></Button>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-bold text-white">{bp.title}</h3>
          <p className="text-xs text-white/40">{getBusinessToolLabel(bp.businessTool)} &middot; {getBusinessTypeLabel(bp.businessType)} &middot; {bp.industry} &middot; {gen.provider ?? "deepseek"}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {onRegenerate ? (
            <Button variant="outline" size="sm" className="gap-1.5 rounded-lg border-white/10 text-xs text-white/60 hover:border-white/20" onClick={onRegenerate}>
              <RefreshCw className="size-3" /> Regenerate
            </Button>
          ) : null}
          {onContinue ? (
            <Button variant="outline" size="sm" className="gap-1.5 rounded-lg border-premium-gold/20 text-xs text-premium-gold-light hover:border-premium-gold/40" onClick={onContinue}>
              <Wand2 className="size-3" /> Improve with AI
            </Button>
          ) : null}
          <Button variant="outline" size="sm" className="gap-1.5 rounded-lg border-white/10 text-xs text-white/60 hover:text-white" onClick={() => { navigator.clipboard.writeText(bp.body); setCopied(true); toast.success("Copied"); setTimeout(() => setCopied(false), 2000); }}>
            {copied ? <Check className="size-3" /> : <ClipboardCopy className="size-3" />} {copied ? "Copied" : "Copy"}
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 rounded-lg border-white/10 text-xs text-white/60 hover:border-premium-gold/25 hover:text-premium-gold-light"
            onClick={async () => {
              const JSZip = (await import("jszip")).default; const zip = new JSZip();
              for (const f of bp.files) zip.file(f.path, f.content);
              const blob = await zip.generateAsync({ type: "blob" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a"); a.href = url;
              a.download = `${bp.title.replace(/\s+/g, "-").toLowerCase()}.zip`; a.click();
              URL.revokeObjectURL(url); toast.success("Exported");
            }}>
            <Download className="size-3" /> Export ZIP
          </Button>
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto">
        {tabs.filter((t) => t.show).map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)} className={cn("whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-all", tab === key ? "bg-premium-gold/15 text-premium-gold-light" : "text-white/40 hover:bg-white/5 hover:text-white/60")}>{label}</button>
        ))}
      </div>

      {tab === "document" && (
        <DashboardPanel className="p-5 sm:p-8">
          <article className="prose prose-invert prose-sm max-w-none prose-headings:text-white/90 prose-p:text-white/70 prose-li:text-white/60 prose-strong:text-white/80 prose-a:text-premium-gold-light prose-table:text-white/60 prose-th:text-white/80 prose-td:text-white/50 prose-th:border-white/10 prose-td:border-white/5">
            <div dangerouslySetInnerHTML={{ __html: safeMarkdownToHtml(bp.body) }} />
          </article>
        </DashboardPanel>
      )}

      {tab === "scorecard" && bp.scorecard && (
        <div className="space-y-4">
          <ScorecardDisplay sc={bp.scorecard} />
          <DashboardPanel className="p-5">
            <p className="text-xs text-white/50">The scorecard provides a quantitative assessment across seven key dimensions. Scores above 70 indicate strong performance, 40-70 needs attention, below 40 requires immediate action. Risk Level is inverted — a lower score is better.</p>
          </DashboardPanel>
        </div>
      )}

      {tab === "risks" && (
        <div className="space-y-4">
          {bp.risks.length > 0 && (
            <DashboardCard>
              <DashboardCardHeader>
                <div className="flex items-center gap-2"><AlertTriangle className="size-4 text-red-400" /><DashboardCardTitle>Risk Assessment</DashboardCardTitle></div>
              </DashboardCardHeader>
              <DashboardCardContent>
                <div className="space-y-3">
                  {bp.risks.map((risk, i) => {
                    const sevColor: Record<string, string> = { low: "bg-green-500/15 text-green-400", medium: "bg-yellow-500/15 text-yellow-400", high: "bg-orange-500/15 text-orange-400", critical: "bg-red-500/15 text-red-400" };
                    return (
                      <DashboardPanel key={i} className="space-y-2 p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white/70">{risk.category}</span>
                          <span className={cn("rounded-md px-2 py-0.5 text-[10px] font-bold uppercase", sevColor[risk.severity] ?? sevColor.medium)}>{risk.severity}</span>
                        </div>
                        <p className="text-xs text-white/50">{risk.description}</p>
                        <div className="rounded-lg bg-white/[0.02] p-2">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-white/30">Mitigation</p>
                          <p className="mt-0.5 text-xs text-white/50">{risk.mitigation}</p>
                        </div>
                      </DashboardPanel>
                    );
                  })}
                </div>
              </DashboardCardContent>
            </DashboardCard>
          )}

          {bp.opportunities.length > 0 && (
            <DashboardCard>
              <DashboardCardHeader>
                <div className="flex items-center gap-2"><TrendingUp className="size-4 text-green-400" /><DashboardCardTitle>Opportunities</DashboardCardTitle></div>
              </DashboardCardHeader>
              <DashboardCardContent>
                <div className="space-y-3">
                  {bp.opportunities.map((opp, i) => {
                    const impColor: Record<string, string> = { low: "bg-white/5 text-white/40", medium: "bg-blue-500/15 text-blue-400", high: "bg-green-500/15 text-green-400" };
                    return (
                      <DashboardPanel key={i} className="space-y-2 p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white/70">{opp.title}</span>
                          <span className={cn("rounded-md px-2 py-0.5 text-[10px] font-medium", impColor[opp.impact] ?? impColor.medium)}>{opp.impact} impact</span>
                        </div>
                        <p className="text-xs text-white/50">{opp.description}</p>
                        <div className="flex gap-4 text-[10px] text-white/30">
                          <span>Timeframe: {opp.timeframe}</span>
                        </div>
                        <p className="text-xs text-premium-gold-light/70">→ {opp.actionRequired}</p>
                      </DashboardPanel>
                    );
                  })}
                </div>
              </DashboardCardContent>
            </DashboardCard>
          )}
        </div>
      )}

      {tab === "action-plan" && (
        <div className="space-y-4">
          {bp.actionPlan.length > 0 && (
            <DashboardCard>
              <DashboardCardHeader>
                <div className="flex items-center gap-2"><Target className="size-4 text-premium-gold-light" /><DashboardCardTitle>Action Plan</DashboardCardTitle></div>
              </DashboardCardHeader>
              <DashboardCardContent>
                <div className="space-y-2">
                  {bp.actionPlan.map((item, i) => {
                    const priColor: Record<string, string> = { low: "bg-white/5 text-white/40", medium: "bg-blue-500/15 text-blue-400", high: "bg-orange-500/15 text-orange-400", urgent: "bg-red-500/15 text-red-400" };
                    return (
                      <DashboardPanel key={i} className="flex items-start gap-3 p-3">
                        <span className={cn("mt-0.5 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase", priColor[item.priority] ?? priColor.medium)}>{item.priority}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-white/70">{item.action}</p>
                          <p className="mt-0.5 text-[10px] text-white/30">{item.owner} &middot; {item.deadline}</p>
                        </div>
                      </DashboardPanel>
                    );
                  })}
                </div>
              </DashboardCardContent>
            </DashboardCard>
          )}

          {bp.recommendations.length > 0 && (
            <DashboardPanel className="p-5">
              <div className="mb-3 flex items-center gap-2 text-premium-gold-light"><Lightbulb className="size-4" /><span className="text-xs font-bold uppercase tracking-wider">Recommendations</span></div>
              <ul className="space-y-2">{bp.recommendations.map((r, i) => <li key={i} className="text-xs text-white/60">• {r}</li>)}</ul>
            </DashboardPanel>
          )}

          {bp.improvements.length > 0 && (
            <DashboardPanel className="p-5">
              <div className="mb-3 flex items-center gap-2 text-premium-gold-light"><Wand2 className="size-4" /><span className="text-xs font-bold uppercase tracking-wider">Improvements</span></div>
              <ul className="space-y-2">{bp.improvements.map((im, i) => <li key={i} className="text-xs text-white/60">• {im}</li>)}</ul>
            </DashboardPanel>
          )}
        </div>
      )}

      {tab === "files" && (
        <div className="space-y-2">
          {bp.files.map((f, i) => (
            <DashboardPanel key={i} className="flex items-center justify-between gap-3 p-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-white/80">{f.path}</p>
                <p className="text-[10px] text-white/40">{f.language} &middot; {f.content.length} chars</p>
              </div>
              <Button variant="ghost" size="icon-xs" className="text-white/30 hover:text-white" onClick={() => { navigator.clipboard.writeText(f.content); toast.success("Copied"); }}>
                <Copy className="size-3" />
              </Button>
            </DashboardPanel>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  HELPERS                                                            */
/* ------------------------------------------------------------------ */

// simpleMarkdownToHtml replaced by safeMarkdownToHtml from @/lib/ai/sanitize

function toHistoryItem(gen: BusinessGeneration): ProjectHistoryItem {
  return {
    id: gen.id,
    name: gen.title,
    typeLabel: getBusinessToolLabel(gen.business_tool),
    description: gen.description || gen.prompt,
    status: gen.status,
    is_favorite: gen.is_favorite,
    created_at: gen.created_at,
    has_blueprint: !!gen.blueprint,
    tags: gen.options,
  };
}

/* ------------------------------------------------------------------ */
/*  MAIN COMPONENT                                                     */
/* ------------------------------------------------------------------ */

export function BusinessSuiteTool({ initialGenerations }: Props) {
  type Step = "tool" | "type" | "config" | "generating" | "preview" | "history";

  const [step, setStep] = useState<Step>("tool");
  const [selectedTool, setSelectedTool] = useState("");
  const [selectedType, setSelectedType] = useState("startup");
  const [prompt, setPrompt] = useState("");
  const [industry, setIndustry] = useState("Technology");
  const [companyStage, setCompanyStage] = useState("Startup");
  const [targetMarket, setTargetMarket] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const [progressEvents, setProgressEvents] = useState<string[]>([]);

  const [generations, setGenerations] = useState<BusinessGeneration[]>(initialGenerations ?? []);
  const [previewGen, setPreviewGen] = useState<BusinessGeneration | null>(null);
  const [parentId, setParentId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchGenerations = useCallback(async () => {
    try {
      const p = new URLSearchParams({ page: String(page), limit: "12" });
      if (search) p.set("search", search);
      const res = await fetch(`/api/business-suite?${p}`);
      if (!res.ok) return;
      const d = await res.json();
      setGenerations(d.generations ?? []);
      setTotal(d.total ?? 0);
    } catch { /* ignore */ }
  }, [page, search]);

  useEffect(() => { if (step === "history") fetchGenerations(); }, [step, fetchGenerations]);

  const handleSelectTool = (id: string) => {
    setSelectedTool(id);
    const tool = getBusinessTool(id);
    if (tool) setOptions([...tool.defaultOptions]);
    setStep("type");
  };

  const handleGenerate = async (mode: BusinessGeneration["mode"] = "generate", parentGenerationId?: string) => {
    if (!selectedTool || !prompt.trim()) {
      toast.error(
        mode === "continue"
          ? "Describe the changes you want in natural language."
          : "Select a tool and describe your business context.",
      );
      return;
    }
    setStep("generating");
    setProgressEvents(["Sending request..."]);
    try {
      const res = await fetch("/api/business-suite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt, businessTool: selectedTool, businessType: selectedType,
          industry, companyStage, targetMarket, options, mode, parentGenerationId,
          continueInstruction: mode === "continue" ? prompt : undefined,
        }),
      });
      const d = await res.json();
      if (!res.ok) { toast.error(d.error ?? "Generation failed"); setStep("config"); return; }
      toast.success(d.message ?? "Analysis complete!");
      setParentId(null);
      if (d.generation) { setPreviewGen(d.generation); setStep("preview"); } else { setStep("history"); }
    } catch { toast.error("Request failed."); setStep("config"); }
  };

  const loadGenerationConfig = (gen: BusinessGeneration) => {
    setSelectedTool(gen.business_tool);
    setSelectedType(gen.business_type);
    setIndustry(gen.industry);
    setCompanyStage(gen.company_stage);
    setTargetMarket(gen.target_market);
    setOptions(gen.options ?? []);
  };

  const handleRegenerate = (gen: BusinessGeneration) => {
    loadGenerationConfig(gen);
    setPrompt(gen.prompt);
    void handleGenerate("regenerate", gen.id);
  };

  const handleContinue = (gen: BusinessGeneration) => {
    loadGenerationConfig(gen);
    setParentId(gen.id);
    setPrompt("");
    setPreviewGen(null);
    setStep("config");
    toast.message("Describe your changes in natural language, then click Improve with AI.");
  };

  const handleFavorite = async (gen: BusinessGeneration) => {
    const next = !gen.is_favorite;
    setGenerations((p) => p.map((g) => g.id === gen.id ? { ...g, is_favorite: next } : g));
    await fetch(`/api/business-suite/${gen.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ is_favorite: next }) });
  };

  const handleDelete = async (id: string) => {
    setGenerations((p) => p.filter((g) => g.id !== id));
    await fetch(`/api/business-suite/${id}`, { method: "DELETE" });
    toast.success("Deleted");
  };

  if (step === "preview" && previewGen) {
    return (
      <BusinessPreview
        gen={previewGen}
        onBack={() => { setPreviewGen(null); setStep("history"); fetchGenerations(); }}
        onRegenerate={() => handleRegenerate(previewGen)}
        onContinue={() => handleContinue(previewGen)}
      />
    );
  }

  if (step === "generating") {
    return <GenerationProgress title="Analyzing your business..." subtitle="AI is performing deep analysis, scoring, risk assessment, and building action plans" events={progressEvents} />;
  }

  const optionsByCategory = BUSINESS_OPTION_LIST.reduce<Record<string, typeof BUSINESS_OPTION_LIST>>((acc, o) => {
    if (!acc[o.category]) acc[o.category] = [];
    acc[o.category].push(o);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto">
        {([{ key: "tool" as const, label: "New Analysis" }, { key: "history" as const, label: "My Projects" }]).map(({ key, label }) => (
          <button key={key} onClick={() => setStep(key)} className={cn("whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition-all", (step === key || ((step === "type" || step === "config") && key === "tool")) ? "bg-premium-gold/15 text-premium-gold-light" : step === "history" && key === "history" ? "bg-premium-gold/15 text-premium-gold-light" : "text-white/50 hover:bg-white/5 hover:text-white/70")}>{label}</button>
        ))}
      </div>

      {/* Tool Selection */}
      {step === "tool" && (
        <DashboardCard>
          <DashboardCardHeader>
            <DashboardCardTitle>Business Suite</DashboardCardTitle>
            <DashboardCardDescription>Choose a business tool to get started</DashboardCardDescription>
          </DashboardCardHeader>
          <DashboardCardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {BUSINESS_TOOLS.map((def) => <TypeSelectorCard key={def.id} def={def} selected={selectedTool === def.id} onSelect={() => handleSelectTool(def.id)} />)}
            </div>
          </DashboardCardContent>
        </DashboardCard>
      )}

      {/* Business Type Selection */}
      {step === "type" && (
        <DashboardCard>
          <DashboardCardHeader>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon-xs" onClick={() => { setStep("tool"); setSelectedTool(""); }} className="text-white/40 hover:text-white"><ArrowLeft className="size-4" /></Button>
              {(() => { const tool = getBusinessTool(selectedTool); const Icon = tool?.icon ?? BarChart3; return (
                <><div className="flex size-10 items-center justify-center rounded-xl bg-premium-gold/15 text-premium-gold-light"><Icon className="size-5" /></div>
                <div><DashboardCardTitle>{tool?.label ?? "Business Tool"}</DashboardCardTitle><DashboardCardDescription>Select your business type</DashboardCardDescription></div></>
              ); })()}
            </div>
          </DashboardCardHeader>
          <DashboardCardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {BUSINESS_TYPES.map((def) => <TypeSelectorCard key={def.id} def={def} selected={selectedType === def.id} onSelect={() => setSelectedType(def.id)} />)}
            </div>
            {selectedType && (
              <div className="mt-6 flex justify-end">
                <Button onClick={() => setStep("config")} className="btn-gold gap-2 rounded-xl font-bold text-luxury-black">Configure <ArrowRight className="size-4" /></Button>
              </div>
            )}
          </DashboardCardContent>
        </DashboardCard>
      )}

      {/* Configuration */}
      {step === "config" && (
        <DashboardCard>
          <DashboardCardHeader>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon-xs" onClick={() => setStep("type")} className="text-white/40 hover:text-white"><ArrowLeft className="size-4" /></Button>
              {(() => { const tool = getBusinessTool(selectedTool); const Icon = tool?.icon ?? Sparkles; return (
                <><div className="flex size-10 items-center justify-center rounded-xl bg-premium-gold/15 text-premium-gold-light"><Icon className="size-5" /></div>
                <div><DashboardCardTitle>{tool?.label}: {getBusinessTypeLabel(selectedType)}</DashboardCardTitle><DashboardCardDescription>Describe your business and configure the analysis</DashboardCardDescription></div></>
              ); })()}
            </div>
          </DashboardCardHeader>
          <DashboardCardContent>
            <div className="space-y-5">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/60">
                  {parentId ? "Describe changes (natural language)" : "Business description *"}
                </label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={
                    parentId
                      ? "Example: Add more detail on competitive risks, expand the financial projections section, and prioritize quick wins..."
                      : "Describe your business — what you do, your goals, challenges, current situation, what analysis you need..."
                  }
                  rows={4}
                  className={cn(dashboardInputClass, "min-h-[100px] resize-none")}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">Industry</label>
                  <select value={industry} onChange={(e) => setIndustry(e.target.value)} className={dashboardSelectClass}>
                    {BUSINESS_INDUSTRIES.map((ind) => <option key={ind} value={ind}>{ind}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">Company Stage</label>
                  <select value={companyStage} onChange={(e) => setCompanyStage(e.target.value)} className={dashboardSelectClass}>
                    {COMPANY_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">Target Market</label>
                  <Input value={targetMarket} onChange={(e) => setTargetMarket(e.target.value)} placeholder="e.g. SMBs in North America" className={dashboardInputClass} />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-medium text-white/60">Analysis Options</label>
                {Object.entries(optionsByCategory).map(([cat, items]) => (
                  <div key={cat}>
                    <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-white/30">{cat}</p>
                    <div className="flex flex-wrap gap-2">
                      {items.map(({ id, label }) => (
                        <CheckboxToggle key={id} label={label} checked={options.includes(id)} onChange={(c) => setOptions((p) => c ? [...p, id] : p.filter((o) => o !== id))} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button
                  variant="outline"
                  className="rounded-xl border-white/10 text-white/60 hover:border-white/20"
                  onClick={() => {
                    setParentId(null);
                    setStep("type");
                  }}
                >
                  Back
                </Button>
                {parentId ? (
                  <Button
                    onClick={() => void handleGenerate("continue", parentId)}
                    disabled={!prompt.trim()}
                    className="btn-gold gap-2 rounded-xl font-bold text-luxury-black"
                  >
                    <Sparkles className="size-4" /> Improve with AI
                  </Button>
                ) : (
                  <Button onClick={() => void handleGenerate()} disabled={!prompt.trim()} className="btn-gold gap-2 rounded-xl font-bold text-luxury-black">
                    <Sparkles className="size-4" /> Generate Analysis
                  </Button>
                )}
              </div>
            </div>
          </DashboardCardContent>
        </DashboardCard>
      )}

      {/* History */}
      {step === "history" && (
        <>
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/30" />
              <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search analyses..." className={cn(dashboardInputClass, "pl-10")} />
            </div>
            <span className="text-xs text-white/40">{total} project{total !== 1 ? "s" : ""}</span>
          </div>
          {generations.length === 0 ? (
            <EmptyHistory noun="business analyses" onNew={() => setStep("tool")} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {generations.map((gen) => {
                const tool = getBusinessTool(gen.business_tool);
                return (
                  <ProjectHistoryCard key={gen.id} item={toHistoryItem(gen)} icon={tool?.icon ?? BarChart3}
                    onFavorite={() => handleFavorite(gen)} onDelete={() => handleDelete(gen.id)}
                    onView={() => { setPreviewGen(gen); setStep("preview"); }}
                    onRegenerate={() => handleRegenerate(gen)}
                    onContinue={() => handleContinue(gen)} />
                );
              })}
            </div>
          )}
          <HistoryPagination page={page} total={total} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}

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
import { useTranslation } from "@/lib/i18n/client";
import { translateOption } from "@/lib/i18n/product-options";
import { resolveLabel } from "@/lib/i18n/resolve-constant-label";
import { useProductT } from "@/lib/i18n/use-scoped-t";
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
  const p = useProductT("businessSuite");
  return (
    <DashboardPanel className="grid grid-cols-3 gap-0 divide-x divide-white/[0.06] sm:grid-cols-4 lg:grid-cols-7">
      <ScoreGauge label={p("scorecard.overall")} value={sc.overall} />
      <ScoreGauge label={p("scorecard.viability")} value={sc.viability} />
      <ScoreGauge label={p("scorecard.marketFit")} value={sc.marketFit} />
      <ScoreGauge label={p("scorecard.financials")} value={sc.financialHealth} />
      <ScoreGauge label={p("scorecard.competitive")} value={sc.competitivePosition} />
      <ScoreGauge label={p("scorecard.growth")} value={sc.growthPotential} />
      <ScoreGauge label={p("scorecard.risk")} value={sc.riskLevel} invert />
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
  const { t } = useTranslation();
  const p = useProductT("businessSuite");
  const bp = gen.blueprint;
  const [tab, setTab] = useState<PreviewTab>("document");
  const [copied, setCopied] = useState(false);

  if (!bp) {
    return (
      <DashboardPanel className="py-16 text-center">
        <FileText className="mx-auto size-10 text-white/20" />
        <p className="mt-4 text-white/50">{p("preview.noAnalysis")}</p>
        <Button variant="outline" className="mt-4 rounded-xl border-white/10 text-white/60" onClick={onBack}>{t("common.back")}</Button>
      </DashboardPanel>
    );
  }

  const tabs: { key: PreviewTab; label: string; show: boolean }[] = [
    { key: "document", label: p("preview.document"), show: true },
    { key: "scorecard", label: p("preview.scorecard"), show: !!bp.scorecard },
    { key: "risks", label: p("preview.risks", { count: bp.risks.length }), show: bp.risks.length > 0 || bp.opportunities.length > 0 },
    { key: "action-plan", label: p("preview.actionPlan", { count: bp.actionPlan.length }), show: bp.actionPlan.length > 0 || bp.recommendations.length > 0 },
    { key: "files", label: p("preview.files", { count: bp.files.length }), show: bp.files.length > 0 },
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
              <RefreshCw className="size-3" /> {p("actions.regenerate")}
            </Button>
          ) : null}
          {onContinue ? (
            <Button variant="outline" size="sm" className="gap-1.5 rounded-lg border-premium-gold/20 text-xs text-premium-gold-light hover:border-premium-gold/40" onClick={onContinue}>
              <Wand2 className="size-3" /> {p("actions.improveWithAi")}
            </Button>
          ) : null}
          <Button variant="outline" size="sm" className="gap-1.5 rounded-lg border-white/10 text-xs text-white/60 hover:text-white" onClick={() => { navigator.clipboard.writeText(bp.body); setCopied(true); toast.success(p("preview.copied")); setTimeout(() => setCopied(false), 2000); }}>
            {copied ? <Check className="size-3" /> : <ClipboardCopy className="size-3" />} {copied ? p("preview.copied") : t("common.copy")}
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 rounded-lg border-white/10 text-xs text-white/60 hover:border-premium-gold/25 hover:text-premium-gold-light"
            onClick={async () => {
              const JSZip = (await import("jszip")).default; const zip = new JSZip();
              for (const f of bp.files) zip.file(f.path, f.content);
              const blob = await zip.generateAsync({ type: "blob" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a"); a.href = url;
              a.download = `${bp.title.replace(/\s+/g, "-").toLowerCase()}.zip`; a.click();
              URL.revokeObjectURL(url); toast.success(p("toasts.exported"));
            }}>
            <Download className="size-3" /> {p("preview.exportZip")}
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
            <p className="text-xs text-white/50">{p("preview.scorecardHint")}</p>
          </DashboardPanel>
        </div>
      )}

      {tab === "risks" && (
        <div className="space-y-4">
          {bp.risks.length > 0 && (
            <DashboardCard>
              <DashboardCardHeader>
                <div className="flex items-center gap-2"><AlertTriangle className="size-4 text-red-400" /><DashboardCardTitle>{p("preview.riskAssessment")}</DashboardCardTitle></div>
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
                          <p className="text-[10px] font-bold uppercase tracking-wider text-white/30">{p("preview.mitigation")}</p>
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
                <div className="flex items-center gap-2"><TrendingUp className="size-4 text-green-400" /><DashboardCardTitle>{p("preview.opportunities")}</DashboardCardTitle></div>
              </DashboardCardHeader>
              <DashboardCardContent>
                <div className="space-y-3">
                  {bp.opportunities.map((opp, i) => {
                    const impColor: Record<string, string> = { low: "bg-white/5 text-white/40", medium: "bg-blue-500/15 text-blue-400", high: "bg-green-500/15 text-green-400" };
                    return (
                      <DashboardPanel key={i} className="space-y-2 p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white/70">{opp.title}</span>
                          <span className={cn("rounded-md px-2 py-0.5 text-[10px] font-medium", impColor[opp.impact] ?? impColor.medium)}>{p("preview.impact", { impact: opp.impact })}</span>
                        </div>
                        <p className="text-xs text-white/50">{opp.description}</p>
                        <div className="flex gap-4 text-[10px] text-white/30">
                          <span>{p("preview.timeframe", { timeframe: opp.timeframe })}</span>
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
                <div className="flex items-center gap-2"><Target className="size-4 text-premium-gold-light" /><DashboardCardTitle>{p("preview.actionPlanTitle")}</DashboardCardTitle></div>
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
              <div className="mb-3 flex items-center gap-2 text-premium-gold-light"><Lightbulb className="size-4" /><span className="text-xs font-bold uppercase tracking-wider">{p("preview.recommendations")}</span></div>
              <ul className="space-y-2">{bp.recommendations.map((r, i) => <li key={i} className="text-xs text-white/60">• {r}</li>)}</ul>
            </DashboardPanel>
          )}

          {bp.improvements.length > 0 && (
            <DashboardPanel className="p-5">
              <div className="mb-3 flex items-center gap-2 text-premium-gold-light"><Wand2 className="size-4" /><span className="text-xs font-bold uppercase tracking-wider">{p("preview.improvements")}</span></div>
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
                <p className="text-[10px] text-white/40">{f.language} &middot; {f.content.length} {p("preview.chars")}</p>
              </div>
              <Button variant="ghost" size="icon-xs" className="text-white/30 hover:text-white" onClick={() => { navigator.clipboard.writeText(f.content); toast.success(p("preview.copied")); }}>
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
  const { t } = useTranslation();
  const p = useProductT("businessSuite");
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
          ? p("errors.describeChanges")
          : p("errors.selectToolAndDescribe"),
      );
      return;
    }
    setStep("generating");
    setProgressEvents([p("generating.sendingRequest")]);
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
      if (!res.ok) { toast.error(d.error ?? p("errors.generationFailed")); setStep("config"); return; }
      toast.success(d.message ?? p("toasts.analysisComplete"));
      setParentId(null);
      if (d.generation) { setPreviewGen(d.generation); setStep("preview"); } else { setStep("history"); }
    } catch { toast.error(p("errors.requestFailed")); setStep("config"); }
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
    toast.message(p("errors.editThenImprove"));
  };

  const handleFavorite = async (gen: BusinessGeneration) => {
    const next = !gen.is_favorite;
    setGenerations((p) => p.map((g) => g.id === gen.id ? { ...g, is_favorite: next } : g));
    await fetch(`/api/business-suite/${gen.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ is_favorite: next }) });
  };

  const handleDelete = async (id: string) => {
    setGenerations((p) => p.filter((g) => g.id !== id));
    await fetch(`/api/business-suite/${id}`, { method: "DELETE" });
    toast.success(p("toasts.deleted"));
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
    return <GenerationProgress title={p("generating.title")} subtitle={p("generating.subtitle")} events={progressEvents} />;
  }

  const optionsByCategory = BUSINESS_OPTION_LIST.reduce<Record<string, typeof BUSINESS_OPTION_LIST>>((acc, o) => {
    if (!acc[o.category]) acc[o.category] = [];
    acc[o.category].push(o);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto">
        {([{ key: "tool" as const, label: p("nav.newAnalysis") }, { key: "history" as const, label: p("nav.myProjects") }]).map(({ key, label }) => (
          <button key={key} onClick={() => setStep(key)} className={cn("whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition-all", (step === key || ((step === "type" || step === "config") && key === "tool")) ? "bg-premium-gold/15 text-premium-gold-light" : step === "history" && key === "history" ? "bg-premium-gold/15 text-premium-gold-light" : "text-white/50 hover:bg-white/5 hover:text-white/70")}>{label}</button>
        ))}
      </div>

      {/* Tool Selection */}
      {step === "tool" && (
        <DashboardCard>
          <DashboardCardHeader>
            <DashboardCardTitle>{p("steps.title")}</DashboardCardTitle>
            <DashboardCardDescription>{p("steps.chooseTool")}</DashboardCardDescription>
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
                <div><DashboardCardTitle>{tool?.label ?? p("steps.businessTool")}</DashboardCardTitle><DashboardCardDescription>{p("steps.selectBusinessType")}</DashboardCardDescription></div></>
              ); })()}
            </div>
          </DashboardCardHeader>
          <DashboardCardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {BUSINESS_TYPES.map((def) => <TypeSelectorCard key={def.id} def={def} selected={selectedType === def.id} onSelect={() => setSelectedType(def.id)} />)}
            </div>
            {selectedType && (
              <div className="mt-6 flex justify-end">
                <Button onClick={() => setStep("config")} className="btn-gold gap-2 rounded-xl font-bold text-luxury-black">{p("steps.configure")} <ArrowRight className="size-4" /></Button>
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
                <div><DashboardCardTitle>{tool?.label}: {getBusinessTypeLabel(selectedType)}</DashboardCardTitle><DashboardCardDescription>{p("steps.configureDescription")}</DashboardCardDescription></div></>
              ); })()}
            </div>
          </DashboardCardHeader>
          <DashboardCardContent>
            <div className="space-y-5">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/60">
                  {parentId ? p("steps.describeChanges") : p("steps.businessDescription")}
                </label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={parentId ? p("placeholders.editExample") : p("placeholders.businessBrief")}
                  rows={4}
                  className={cn(dashboardInputClass, "min-h-[100px] resize-none")}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">{p("steps.industry")}</label>
                  <select value={industry} onChange={(e) => setIndustry(e.target.value)} className={dashboardSelectClass}>
                    {BUSINESS_INDUSTRIES.map((ind) => <option key={ind} value={ind}>{translateOption(t, "constants.businessSuite.industries", ind)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">{p("steps.companyStage")}</label>
                  <select value={companyStage} onChange={(e) => setCompanyStage(e.target.value)} className={dashboardSelectClass}>
                    {COMPANY_STAGES.map((s) => <option key={s} value={s}>{translateOption(t, "constants.businessSuite.companyStages", s)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">{p("steps.targetMarket")}</label>
                  <Input value={targetMarket} onChange={(e) => setTargetMarket(e.target.value)} placeholder={p("placeholders.targetMarket")} className={dashboardInputClass} />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-medium text-white/60">{p("steps.analysisOptions")}</label>
                {Object.entries(optionsByCategory).map(([cat, items]) => (
                  <div key={cat}>
                    <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-white/30">{translateOption(t, "constants.businessSuite.categories", cat)}</p>
                    <div className="flex flex-wrap gap-2">
                      {items.map((opt) => (
                        <CheckboxToggle key={opt.id} label={resolveLabel(t, opt)} checked={options.includes(opt.id)} onChange={(c) => setOptions((p) => c ? [...p, opt.id] : p.filter((o) => o !== opt.id))} />
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
                  {t("common.back")}
                </Button>
                {parentId ? (
                  <Button
                    onClick={() => void handleGenerate("continue", parentId)}
                    disabled={!prompt.trim()}
                    className="btn-gold gap-2 rounded-xl font-bold text-luxury-black"
                  >
                    <Sparkles className="size-4" /> {p("actions.improveWithAi")}
                  </Button>
                ) : (
                  <Button onClick={() => void handleGenerate()} disabled={!prompt.trim()} className="btn-gold gap-2 rounded-xl font-bold text-luxury-black">
                    <Sparkles className="size-4" /> {p("steps.generateAnalysis")}
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
              <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder={p("placeholders.searchAnalyses")} className={cn(dashboardInputClass, "pl-10")} />
            </div>
            <span className="text-xs text-white/40">{total === 1 ? p("history.count", { count: total }) : p("history.countPlural", { count: total })}</span>
          </div>
          {generations.length === 0 ? (
            <EmptyHistory noun={p("history.emptyNoun")} onNew={() => setStep("tool")} />
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

"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowRight, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DashboardCard,
  DashboardCardContent,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCardDescription,
} from "@/components/dashboard/ui/dashboard-card";
import { dashboardInputClass, dashboardSelectClass } from "@/components/dashboard/ui/dashboard-styles";
import {
  TypeSelectorCard,
  CheckboxToggle,
  GenerationProgress,
  ProjectFilePreview,
  ProjectHistoryCard,
  EmptyHistory,
  HistoryPagination,
  OnePromptExperience,
  type ProjectHistoryItem,
} from "@/components/dashboard/builder-shared";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/client";
import { translateOption } from "@/lib/i18n/product-options";
import { resolveLabel } from "@/lib/i18n/resolve-constant-label";
import { useProductT } from "@/lib/i18n/use-scoped-t";
import {
  LANDING_PAGE_TYPES,
  LP_LANGUAGES,
  LP_DESIGN_STYLES,
  LP_COLOR_STYLES,
  LP_SECTION_OPTIONS,
  getLandingPageType,
} from "@/lib/constants/landing-page-builder";
import { getOnePromptProduct } from "@/lib/constants/one-prompt-products";
import { useIdeaQueryParam } from "@/lib/hooks/use-idea-query-param";
import type { LandingPageGeneration } from "@/types/landing-page";

type LPBuilderToolProps = { initialGenerations?: LandingPageGeneration[] };

function toHistoryItem(gen: LandingPageGeneration): ProjectHistoryItem {
  const def = getLandingPageType(gen.page_type);
  return {
    id: gen.id,
    name: gen.page_name,
    typeLabel: def?.label ?? gen.page_type,
    description: gen.description || gen.prompt,
    status: gen.status,
    is_favorite: gen.is_favorite,
    created_at: gen.created_at,
    has_blueprint: !!gen.blueprint,
  };
}

export function LandingPageBuilderTool({ initialGenerations }: LPBuilderToolProps) {
  const { t } = useTranslation();
  const p = useProductT("landingPageBuilder");
  const onePrompt = getOnePromptProduct("landing-page-builder");
  const [step, setStep] = useState<"type" | "config" | "history" | "generating" | "preview">("type");
  const [selectedType, setSelectedType] = useState("");
  const [prompt, setPrompt] = useState("");
  const [language, setLanguage] = useState("English");
  const [designStyle, setDesignStyle] = useState("Modern");
  const [colorStyle, setColorStyle] = useState("Dark Minimal");
  const [sections, setSections] = useState<string[]>([]);
  const [progressEvents, setProgressEvents] = useState<string[]>([]);

  const [generations, setGenerations] = useState<LandingPageGeneration[]>(initialGenerations ?? []);
  const [previewGen, setPreviewGen] = useState<LandingPageGeneration | null>(null);
  const [parentId, setParentId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const applyIdea = useCallback((idea: string) => {
    setPrompt(idea);
    setStep("config");
    if (!selectedType) {
      const def = LANDING_PAGE_TYPES[0];
      setSelectedType(def.id);
      setSections([...def.defaultSections]);
    }
  }, [selectedType]);
  useIdeaQueryParam(applyIdea);

  const fetchGenerations = useCallback(async () => {
    try {
      const p = new URLSearchParams({ page: String(page), limit: "12" });
      if (search) p.set("search", search);
      const res = await fetch(`/api/landing-page-builder?${p}`);
      if (!res.ok) return;
      const d = await res.json();
      setGenerations(d.generations ?? []);
      setTotal(d.total ?? 0);
    } catch { /* ignore */ }
  }, [page, search]);

  useEffect(() => { if (step === "history") fetchGenerations(); }, [step, fetchGenerations]);

  const handleSelectType = (id: string) => {
    setSelectedType(id);
    const def = getLandingPageType(id);
    if (def) setSections([...def.defaultSections]);
  };

  const handleGenerate = async (
    mode: "generate" | "regenerate" | "continue" | "retry" = "generate",
    parentGenerationId?: string,
    overridePrompt?: string,
  ) => {
    const idea = (overridePrompt ?? prompt).trim();
    let pageType = selectedType;
    let pageSections = sections;
    if (!pageType) {
      const def = LANDING_PAGE_TYPES[0];
      pageType = def.id;
      pageSections = [...def.defaultSections];
      setSelectedType(pageType);
      setSections(pageSections);
    }
    if (!pageType || !idea) {
      toast.error(
        mode === "continue"
          ? p("errors.describeChanges")
          : p("errors.enterIdea"),
      );
      return;
    }
    if (overridePrompt) setPrompt(overridePrompt);
    setStep("generating");
    setProgressEvents([
      p("generating.ideaEvent"),
      p("generating.strategyEvent"),
    ]);
    try {
      const res = await fetch("/api/landing-page-builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: idea,
          pageType,
          language,
          designStyle,
          colorStyle,
          sections: pageSections,
          mode,
          parentGenerationId,
          continueInstruction: mode === "continue" ? idea : undefined,
        }),
      });
      const d = await res.json();
      if (!res.ok) { toast.error(d.error ?? p("errors.generationFailed")); setStep("config"); return; }
      toast.success(d.message ?? p("toasts.pageGenerated"));
      setParentId(null);
      if (d.generation) { setPreviewGen(d.generation); setStep("preview"); } else { setStep("history"); }
    } catch { toast.error(p("errors.requestFailed")); setStep("config"); }
  };

  const handleOnePrompt = (idea: string) => {
    void handleGenerate("generate", undefined, idea);
  };

  const loadGenerationConfig = (gen: LandingPageGeneration) => {
    setSelectedType(gen.page_type);
    setLanguage(gen.language);
    setDesignStyle(gen.design_style);
    setColorStyle(gen.color_style);
    setSections(gen.sections ?? []);
  };

  const handleRegenerate = (gen: LandingPageGeneration) => {
    loadGenerationConfig(gen);
    setPrompt(gen.prompt);
    setParentId(gen.id);
    void handleGenerate("regenerate", gen.id);
  };

  const handleContinue = (gen: LandingPageGeneration) => {
    loadGenerationConfig(gen);
    setParentId(gen.id);
    setPrompt("");
    setPreviewGen(null);
    setStep("config");
    toast.message(p("errors.editThenImprove"));
  };

  const handleFavorite = async (gen: LandingPageGeneration) => {
    const next = !gen.is_favorite;
    setGenerations((p) => p.map((g) => g.id === gen.id ? { ...g, is_favorite: next } : g));
    await fetch(`/api/landing-page-builder/${gen.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ is_favorite: next }) });
  };

  const handleDelete = async (id: string) => {
    setGenerations((p) => p.filter((g) => g.id !== id));
    await fetch(`/api/landing-page-builder/${id}`, { method: "DELETE" });
    toast.success(p("toasts.deleted"));
  };

  if (step === "preview" && previewGen) {
    const bp = previewGen.blueprint;
    return (
      <ProjectFilePreview
        title={bp?.title || previewGen.page_name}
        subtitle={`${p("preview.filesCount", { count: bp?.files?.length ?? 0 })} · ${previewGen.provider ?? "deepseek"} · ${previewGen.generation_time_ms ? `${(previewGen.generation_time_ms / 1000).toFixed(1)}s` : p("preview.notAvailable")}`}
        files={bp?.files ?? []}
        downloadName={bp?.title || previewGen.page_name}
        onBack={() => { setPreviewGen(null); setStep("history"); fetchGenerations(); }}
        onRegenerate={() => handleRegenerate(previewGen)}
        onContinue={() => handleContinue(previewGen)}
      />
    );
  }

  if (step === "generating") {
    return <GenerationProgress title={p("generating.title")} subtitle={p("generating.subtitle")} events={progressEvents} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {([{ key: "type" as const, label: p("nav.newPage") }, { key: "history" as const, label: p("nav.myPages") }]).map(({ key, label }) => (
          <button key={key} onClick={() => setStep(key)} className={cn("rounded-xl px-4 py-2 text-sm font-medium transition-all", step === key || (step === "config" && key === "type") ? "bg-premium-gold/15 text-premium-gold-light" : "text-white/50 hover:bg-white/5 hover:text-white/70")}>{label}</button>
        ))}
      </div>

      {(step === "type" || step === "config") && (
        <OnePromptExperience
          product={onePrompt}
          value={prompt}
          onChange={setPrompt}
          onSubmit={handleOnePrompt}
          showPipelinePreview={step === "type"}
          compact={step === "config"}
        />
      )}

      {step === "type" && (
        <DashboardCard>
          <DashboardCardHeader>
            <DashboardCardTitle>{p("steps.chooseType")}</DashboardCardTitle>
            <DashboardCardDescription>
              {p("steps.chooseTypeHint")}
            </DashboardCardDescription>
          </DashboardCardHeader>
          <DashboardCardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {LANDING_PAGE_TYPES.map((def) => <TypeSelectorCard key={def.id} def={def} selected={selectedType === def.id} onSelect={() => handleSelectType(def.id)} />)}
            </div>
            {selectedType && (
              <div className="mt-6 flex justify-end">
                <Button onClick={() => setStep("config")} className="btn-gold gap-2 rounded-xl font-bold text-luxury-black">{p("steps.configurePage")} <ArrowRight className="size-4" /></Button>
              </div>
            )}
          </DashboardCardContent>
        </DashboardCard>
      )}

      {step === "config" && (
        <DashboardCard>
          <DashboardCardHeader>
            <div className="flex items-center gap-3">
              {(() => { const def = getLandingPageType(selectedType); const Icon = def?.icon ?? Sparkles; return (<>
                <div className="flex size-10 items-center justify-center rounded-xl bg-premium-gold/15 text-premium-gold-light"><Icon className="size-5" /></div>
                <div><DashboardCardTitle>{p("steps.customLandingPage", { type: def?.label ?? t("common.create") })}</DashboardCardTitle><DashboardCardDescription>{p("steps.configureDescription")}</DashboardCardDescription></div>
              </>); })()}
            </div>
          </DashboardCardHeader>
          <DashboardCardContent>
            <div className="space-y-5">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/60">
                  {parentId ? p("steps.describeChanges") : p("steps.describePage")}
                </label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={parentId ? p("placeholders.editExample") : p("placeholders.pageBrief")}
                  rows={4}
                  className={cn(dashboardInputClass, "min-h-[100px] resize-none")}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div><label className="mb-1.5 block text-xs font-medium text-white/60">{p("steps.language")}</label><select value={language} onChange={(e) => setLanguage(e.target.value)} className={dashboardSelectClass}>{LP_LANGUAGES.map((l) => <option key={l} value={l}>{translateOption(t, "constants.contentStudio.languages", l)}</option>)}</select></div>
                <div><label className="mb-1.5 block text-xs font-medium text-white/60">{p("steps.designStyle")}</label><select value={designStyle} onChange={(e) => setDesignStyle(e.target.value)} className={dashboardSelectClass}>{LP_DESIGN_STYLES.map((s) => <option key={s} value={s}>{translateOption(t, "constants.landingPageBuilder.designStyles", s)}</option>)}</select></div>
                <div><label className="mb-1.5 block text-xs font-medium text-white/60">{p("steps.colorStyle")}</label><select value={colorStyle} onChange={(e) => setColorStyle(e.target.value)} className={dashboardSelectClass}>{LP_COLOR_STYLES.map((c) => <option key={c} value={c}>{translateOption(t, "constants.landingPageBuilder.colorStyles", c)}</option>)}</select></div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/60">{p("steps.sections")}</label>
                <div className="flex flex-wrap gap-2">{LP_SECTION_OPTIONS.map((opt) => <CheckboxToggle key={opt.id} label={resolveLabel(t, opt)} checked={sections.includes(opt.id)} onChange={(c) => setSections((p) => c ? [...p, opt.id] : p.filter((s) => s !== opt.id))} />)}</div>
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
                  <Button
                    onClick={() => void handleGenerate()}
                    disabled={!prompt.trim()}
                    className="btn-gold gap-2 rounded-xl font-bold text-luxury-black"
                  >
                    <Sparkles className="size-4" /> {p("steps.generateLandingPage")}
                  </Button>
                )}
              </div>
            </div>
          </DashboardCardContent>
        </DashboardCard>
      )}

      {step === "history" && (
        <>
          <div className="flex items-center gap-3">
            <div className="relative flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/30" /><Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder={p("placeholders.searchPages")} className={cn(dashboardInputClass, "pl-10")} /></div>
            <span className="text-xs text-white/40">{total === 1 ? p("history.count", { count: total }) : p("history.countPlural", { count: total })}</span>
          </div>
          {generations.length === 0 ? (
            <EmptyHistory noun={p("history.emptyNoun")} onNew={() => setStep("type")} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {generations.map((gen) => {
                const def = getLandingPageType(gen.page_type);
                return (
                  <ProjectHistoryCard
                    key={gen.id}
                    item={toHistoryItem(gen)}
                    icon={def?.icon ?? Sparkles}
                    onFavorite={() => handleFavorite(gen)}
                    onDelete={() => handleDelete(gen.id)}
                    onView={() => { setPreviewGen(gen); setStep("preview"); }}
                    onRegenerate={() => handleRegenerate(gen)}
                    onContinue={() => handleContinue(gen)}
                  />
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

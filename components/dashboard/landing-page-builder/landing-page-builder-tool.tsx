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
  type ProjectHistoryItem,
} from "@/components/dashboard/builder-shared";
import { cn } from "@/lib/utils";
import {
  LANDING_PAGE_TYPES,
  LP_LANGUAGES,
  LP_DESIGN_STYLES,
  LP_COLOR_STYLES,
  LP_SECTION_OPTIONS,
  getLandingPageType,
} from "@/lib/constants/landing-page-builder";
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
  ) => {
    if (!selectedType || !prompt.trim()) {
      toast.error(
        mode === "continue"
          ? "Describe the changes you want in natural language."
          : "Select a page type and describe your landing page.",
      );
      return;
    }
    setStep("generating");
    setProgressEvents(["Sending request..."]);
    try {
      const res = await fetch("/api/landing-page-builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          pageType: selectedType,
          language,
          designStyle,
          colorStyle,
          sections,
          mode,
          parentGenerationId,
          continueInstruction: mode === "continue" ? prompt : undefined,
        }),
      });
      const d = await res.json();
      if (!res.ok) { toast.error(d.error ?? "Generation failed"); setStep("config"); return; }
      toast.success(d.message ?? "Landing page generated!");
      setParentId(null);
      if (d.generation) { setPreviewGen(d.generation); setStep("preview"); } else { setStep("history"); }
    } catch { toast.error("Request failed."); setStep("config"); }
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
    toast.message("Describe your changes in natural language, then click Improve with AI.");
  };

  const handleFavorite = async (gen: LandingPageGeneration) => {
    const next = !gen.is_favorite;
    setGenerations((p) => p.map((g) => g.id === gen.id ? { ...g, is_favorite: next } : g));
    await fetch(`/api/landing-page-builder/${gen.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ is_favorite: next }) });
  };

  const handleDelete = async (id: string) => {
    setGenerations((p) => p.filter((g) => g.id !== id));
    await fetch(`/api/landing-page-builder/${id}`, { method: "DELETE" });
    toast.success("Deleted");
  };

  if (step === "preview" && previewGen) {
    const bp = previewGen.blueprint;
    return (
      <ProjectFilePreview
        title={bp?.title || previewGen.page_name}
        subtitle={`${bp?.files?.length ?? 0} files · ${previewGen.provider ?? "deepseek"} · ${previewGen.generation_time_ms ? `${(previewGen.generation_time_ms / 1000).toFixed(1)}s` : "N/A"}`}
        files={bp?.files ?? []}
        downloadName={bp?.title || previewGen.page_name}
        onBack={() => { setPreviewGen(null); setStep("history"); fetchGenerations(); }}
        onRegenerate={() => handleRegenerate(previewGen)}
        onContinue={() => handleContinue(previewGen)}
      />
    );
  }

  if (step === "generating") {
    return <GenerationProgress title="Generating your landing page..." subtitle="This usually takes 30-90 seconds" events={progressEvents} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {([{ key: "type" as const, label: "New Page" }, { key: "history" as const, label: "My Pages" }]).map(({ key, label }) => (
          <button key={key} onClick={() => setStep(key)} className={cn("rounded-xl px-4 py-2 text-sm font-medium transition-all", step === key || (step === "config" && key === "type") ? "bg-premium-gold/15 text-premium-gold-light" : "text-white/50 hover:bg-white/5 hover:text-white/70")}>{label}</button>
        ))}
      </div>

      {step === "type" && (
        <DashboardCard>
          <DashboardCardHeader>
            <DashboardCardTitle>Choose Landing Page Type</DashboardCardTitle>
            <DashboardCardDescription>Select the type of landing page you want to generate</DashboardCardDescription>
          </DashboardCardHeader>
          <DashboardCardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {LANDING_PAGE_TYPES.map((def) => <TypeSelectorCard key={def.id} def={def} selected={selectedType === def.id} onSelect={() => handleSelectType(def.id)} />)}
            </div>
            {selectedType && (
              <div className="mt-6 flex justify-end">
                <Button onClick={() => setStep("config")} className="btn-gold gap-2 rounded-xl font-bold text-luxury-black">Configure Page <ArrowRight className="size-4" /></Button>
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
                <div><DashboardCardTitle>{def?.label ?? "Custom"} Landing Page</DashboardCardTitle><DashboardCardDescription>Describe your page and configure sections</DashboardCardDescription></div>
              </>); })()}
            </div>
          </DashboardCardHeader>
          <DashboardCardContent>
            <div className="space-y-5">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/60">
                  {parentId ? "Describe changes (natural language)" : "Describe your landing page"}
                </label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={
                    parentId
                      ? "Example: Make the hero more urgent, add a pricing section, and switch CTA to Start free trial..."
                      : "Describe what this landing page is for, your product/service, target audience, and conversion goal..."
                  }
                  rows={4}
                  className={cn(dashboardInputClass, "min-h-[100px] resize-none")}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div><label className="mb-1.5 block text-xs font-medium text-white/60">Language</label><select value={language} onChange={(e) => setLanguage(e.target.value)} className={dashboardSelectClass}>{LP_LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}</select></div>
                <div><label className="mb-1.5 block text-xs font-medium text-white/60">Design Style</label><select value={designStyle} onChange={(e) => setDesignStyle(e.target.value)} className={dashboardSelectClass}>{LP_DESIGN_STYLES.map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
                <div><label className="mb-1.5 block text-xs font-medium text-white/60">Color Style</label><select value={colorStyle} onChange={(e) => setColorStyle(e.target.value)} className={dashboardSelectClass}>{LP_COLOR_STYLES.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/60">Sections</label>
                <div className="flex flex-wrap gap-2">{LP_SECTION_OPTIONS.map(({ id, label }) => <CheckboxToggle key={id} label={label} checked={sections.includes(id)} onChange={(c) => setSections((p) => c ? [...p, id] : p.filter((s) => s !== id))} />)}</div>
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
                  <Button
                    onClick={() => void handleGenerate()}
                    disabled={!prompt.trim()}
                    className="btn-gold gap-2 rounded-xl font-bold text-luxury-black"
                  >
                    <Sparkles className="size-4" /> Generate Landing Page
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
            <div className="relative flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/30" /><Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search pages..." className={cn(dashboardInputClass, "pl-10")} /></div>
            <span className="text-xs text-white/40">{total} page{total !== 1 ? "s" : ""}</span>
          </div>
          {generations.length === 0 ? (
            <EmptyHistory noun="landing pages" onNew={() => setStep("type")} />
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

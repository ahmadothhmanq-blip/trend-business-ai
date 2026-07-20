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
import {
  WEBAPP_TYPES,
  WEBAPP_LANGUAGES,
  WEBAPP_DESIGN_STYLES,
  WEBAPP_COLOR_STYLES,
  WEBAPP_FEATURE_OPTIONS,
  getWebAppType,
} from "@/lib/constants/webapp-builder";
import { getOnePromptProduct } from "@/lib/constants/one-prompt-products";
import { useIdeaQueryParam } from "@/lib/hooks/use-idea-query-param";
import type { WebAppGeneration } from "@/types/webapp";

type WebAppBuilderToolProps = { initialGenerations?: WebAppGeneration[] };

function toHistoryItem(gen: WebAppGeneration): ProjectHistoryItem {
  const def = getWebAppType(gen.app_type);
  return {
    id: gen.id,
    name: gen.app_name,
    typeLabel: def?.label ?? gen.app_type,
    description: gen.description || gen.prompt,
    status: gen.status,
    is_favorite: gen.is_favorite,
    created_at: gen.created_at,
    has_blueprint: !!gen.blueprint,
    tags: gen.features,
  };
}

export function WebAppBuilderTool({ initialGenerations }: WebAppBuilderToolProps) {
  const onePrompt = getOnePromptProduct("app-builder");
  const [step, setStep] = useState<"type" | "config" | "history" | "generating" | "preview">("type");
  const [selectedType, setSelectedType] = useState("");
  const [prompt, setPrompt] = useState("");
  const [language, setLanguage] = useState("English");
  const [designStyle, setDesignStyle] = useState("Modern");
  const [colorStyle, setColorStyle] = useState("Dark Minimal");
  const [features, setFeatures] = useState<string[]>([]);
  const [progressEvents, setProgressEvents] = useState<string[]>([]);

  const [generations, setGenerations] = useState<WebAppGeneration[]>(initialGenerations ?? []);
  const [previewGen, setPreviewGen] = useState<WebAppGeneration | null>(null);
  const [parentId, setParentId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const applyIdea = useCallback((idea: string) => {
    setPrompt(idea);
    setStep("config");
    if (!selectedType) {
      const def = WEBAPP_TYPES[0];
      setSelectedType(def.id);
      setFeatures([...def.defaultFeatures]);
    }
  }, [selectedType]);
  useIdeaQueryParam(applyIdea);

  const fetchGenerations = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: String(page), limit: "12" });
      if (search) params.set("search", search);
      const res = await fetch(`/api/webapp-builder?${params}`);
      if (!res.ok) return;
      const data = await res.json();
      setGenerations(data.generations ?? []);
      setTotal(data.total ?? 0);
    } catch { /* ignore */ }
  }, [page, search]);

  useEffect(() => { if (step === "history") fetchGenerations(); }, [step, fetchGenerations]);

  const handleSelectType = (id: string) => {
    setSelectedType(id);
    const def = getWebAppType(id);
    if (def) setFeatures([...def.defaultFeatures]);
  };

  const handleGenerate = async (
    mode: "generate" | "regenerate" | "continue" | "retry" = "generate",
    parentGenerationId?: string,
    overridePrompt?: string,
  ) => {
    const idea = (overridePrompt ?? prompt).trim();
    let appType = selectedType;
    let appFeatures = features;
    if (!appType) {
      const def = WEBAPP_TYPES[0];
      appType = def.id;
      appFeatures = [...def.defaultFeatures];
      setSelectedType(appType);
      setFeatures(appFeatures);
    }
    if (!appType || !idea) {
      toast.error(
        mode === "continue"
          ? "Describe the changes you want in natural language."
          : "Enter your business idea to generate an app.",
      );
      return;
    }
    if (overridePrompt) setPrompt(overridePrompt);
    setStep("generating");
    setProgressEvents([
      "[idea] Understanding your product idea...",
      "[strategy] Planning screens and flows...",
    ]);
    try {
      const res = await fetch("/api/webapp-builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: idea,
          appType,
          language,
          designStyle,
          colorStyle,
          features: appFeatures,
          mode,
          parentGenerationId,
          continueInstruction: mode === "continue" ? idea : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Generation failed"); setStep("config"); return; }
      toast.success(data.message ?? "Web app generated!");
      setParentId(null);
      if (data.generation) { setPreviewGen(data.generation); setStep("preview"); } else { setStep("history"); }
    } catch { toast.error("Request failed. Check your connection."); setStep("config"); }
  };

  const handleOnePrompt = (idea: string) => {
    void handleGenerate("generate", undefined, idea);
  };

  const loadGenerationConfig = (gen: WebAppGeneration) => {
    setSelectedType(gen.app_type);
    setLanguage(gen.language);
    setDesignStyle(gen.design_style);
    setColorStyle(gen.color_style);
    setFeatures(gen.features ?? []);
  };

  const handleRegenerate = (gen: WebAppGeneration) => {
    loadGenerationConfig(gen);
    setPrompt(gen.prompt);
    void handleGenerate("regenerate", gen.id);
  };

  const handleContinue = (gen: WebAppGeneration) => {
    loadGenerationConfig(gen);
    setParentId(gen.id);
    setPrompt("");
    setPreviewGen(null);
    setStep("config");
    toast.message("Describe your changes in natural language, then click Improve with AI.");
  };

  const handleFavorite = async (gen: WebAppGeneration) => {
    const next = !gen.is_favorite;
    setGenerations((prev) => prev.map((g) => (g.id === gen.id ? { ...g, is_favorite: next } : g)));
    await fetch(`/api/webapp-builder/${gen.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ is_favorite: next }) });
  };

  const handleDelete = async (id: string) => {
    setGenerations((prev) => prev.filter((g) => g.id !== id));
    await fetch(`/api/webapp-builder/${id}`, { method: "DELETE" });
    toast.success("Deleted");
  };

  if (step === "preview" && previewGen) {
    const bp = previewGen.blueprint;
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button
            asChild
            className="btn-gold rounded-xl font-bold text-luxury-black"
          >
            <a href={`/dashboard/app-builder/${previewGen.id}`}>Open App Management</a>
          </Button>
          <Button asChild variant="outline" className="rounded-xl border-white/10">
            <a href={`/api/webapp-builder/${previewGen.id}/live-preview`} target="_blank" rel="noopener noreferrer">
              Open Live Preview
            </a>
          </Button>
        </div>
        <DashboardCard>
          <DashboardCardHeader>
            <DashboardCardTitle>Live app preview</DashboardCardTitle>
            <DashboardCardDescription>
              Sandbox runtime from your generated app model
            </DashboardCardDescription>
          </DashboardCardHeader>
          <DashboardCardContent className="flex justify-center">
            <iframe
              title="Generated app live preview"
              src={`/api/webapp-builder/${previewGen.id}/live-preview`}
              className="h-[560px] w-full max-w-4xl rounded-2xl border border-white/15 bg-black"
              sandbox="allow-same-origin"
            />
          </DashboardCardContent>
        </DashboardCard>
        <ProjectFilePreview
          title={bp?.title || previewGen.app_name}
          subtitle={`${bp?.files?.length ?? 0} files · ${previewGen.provider ?? "deepseek"} · ${previewGen.generation_time_ms ? `${(previewGen.generation_time_ms / 1000).toFixed(1)}s` : "N/A"}${bp?.appModel ? ` · ${bp.appModel.templateId}` : ""}`}
          files={bp?.files ?? []}
          downloadName={bp?.title || previewGen.app_name}
          onBack={() => { setPreviewGen(null); setStep("history"); fetchGenerations(); }}
          onRegenerate={() => handleRegenerate(previewGen)}
          onContinue={() => handleContinue(previewGen)}
        />
      </div>
    );
  }

  if (step === "generating") {
    return <GenerationProgress title="Generating your web app..." subtitle="This may take 1-3 minutes depending on complexity" events={progressEvents} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {([{ key: "type" as const, label: "New App" }, { key: "history" as const, label: "My Apps" }]).map(({ key, label }) => (
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
            <DashboardCardTitle>Or choose an app type</DashboardCardTitle>
            <DashboardCardDescription>
              Optional — One Prompt uses a smart default if you skip this
            </DashboardCardDescription>
          </DashboardCardHeader>
          <DashboardCardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {WEBAPP_TYPES.map((def) => <TypeSelectorCard key={def.id} def={def} selected={selectedType === def.id} onSelect={() => handleSelectType(def.id)} />)}
            </div>
            {selectedType && (
              <div className="mt-6 flex justify-end">
                <Button onClick={() => setStep("config")} className="btn-gold gap-2 rounded-xl font-bold text-luxury-black">Configure App <ArrowRight className="size-4" /></Button>
              </div>
            )}
          </DashboardCardContent>
        </DashboardCard>
      )}

      {step === "config" && (
        <DashboardCard>
          <DashboardCardHeader>
            <div className="flex items-center gap-3">
              {(() => { const def = getWebAppType(selectedType); const Icon = def?.icon ?? Sparkles; return (<>
                <div className="flex size-10 items-center justify-center rounded-xl bg-premium-gold/15 text-premium-gold-light"><Icon className="size-5" /></div>
                <div><DashboardCardTitle>{def?.label ?? "Custom"} App</DashboardCardTitle><DashboardCardDescription>Describe your app and configure generation options</DashboardCardDescription></div>
              </>); })()}
            </div>
          </DashboardCardHeader>
          <DashboardCardContent>
            <div className="space-y-5">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/60">
                  {parentId ? "Describe changes (natural language)" : "Describe your app"}
                </label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={
                    parentId
                      ? "Example: Add a dark mode toggle, simplify the dashboard layout, and add export to CSV..."
                      : "Describe the web application you want to build in detail..."
                  }
                  rows={4}
                  className={cn(dashboardInputClass, "min-h-[100px] resize-none")}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div><label className="mb-1.5 block text-xs font-medium text-white/60">Language</label><select value={language} onChange={(e) => setLanguage(e.target.value)} className={dashboardSelectClass}>{WEBAPP_LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}</select></div>
                <div><label className="mb-1.5 block text-xs font-medium text-white/60">Design Style</label><select value={designStyle} onChange={(e) => setDesignStyle(e.target.value)} className={dashboardSelectClass}>{WEBAPP_DESIGN_STYLES.map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
                <div><label className="mb-1.5 block text-xs font-medium text-white/60">Color Style</label><select value={colorStyle} onChange={(e) => setColorStyle(e.target.value)} className={dashboardSelectClass}>{WEBAPP_COLOR_STYLES.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/60">Features</label>
                <div className="flex flex-wrap gap-2">{WEBAPP_FEATURE_OPTIONS.map(({ id, label }) => <CheckboxToggle key={id} label={label} checked={features.includes(id)} onChange={(c) => setFeatures((p) => c ? [...p, id] : p.filter((f) => f !== id))} />)}</div>
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
                    <Sparkles className="size-4" /> Generate Web App
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
            <div className="relative flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/30" /><Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search apps..." className={cn(dashboardInputClass, "pl-10")} /></div>
            <span className="text-xs text-white/40">{total} app{total !== 1 ? "s" : ""}</span>
          </div>
          {generations.length === 0 ? (
            <EmptyHistory noun="web apps" onNew={() => setStep("type")} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {generations.map((gen) => {
                const def = getWebAppType(gen.app_type);
                return (
                  <ProjectHistoryCard
                    key={gen.id}
                    item={toHistoryItem(gen)}
                    icon={def?.icon ?? Sparkles}
                    onFavorite={() => handleFavorite(gen)}
                    onDelete={() => handleDelete(gen.id)}
                    onView={() => {
                      window.location.href = `/dashboard/app-builder/${gen.id}`;
                    }}
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

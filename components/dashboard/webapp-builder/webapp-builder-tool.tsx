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
  WEBAPP_TYPES,
  WEBAPP_LANGUAGES,
  WEBAPP_DESIGN_STYLES,
  WEBAPP_COLOR_STYLES,
  WEBAPP_FEATURE_OPTIONS,
  getWebAppType,
} from "@/lib/constants/webapp-builder";
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
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

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

  const handleGenerate = async (mode: "generate" | "regenerate" | "retry" = "generate", parentId?: string) => {
    if (!selectedType || !prompt.trim()) { toast.error("Select an app type and describe your app."); return; }
    setStep("generating");
    setProgressEvents(["Sending request..."]);
    try {
      const res = await fetch("/api/webapp-builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, appType: selectedType, language, designStyle, colorStyle, features, mode, parentGenerationId: parentId }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Generation failed"); setStep("config"); return; }
      toast.success(data.message ?? "Web app generated!");
      if (data.generation) { setPreviewGen(data.generation); setStep("preview"); } else { setStep("history"); }
    } catch { toast.error("Request failed. Check your connection."); setStep("config"); }
  };

  const handleRegenerate = (gen: WebAppGeneration) => {
    setSelectedType(gen.app_type); setPrompt(gen.prompt); setLanguage(gen.language);
    setDesignStyle(gen.design_style); setColorStyle(gen.color_style); setFeatures(gen.features ?? []);
    handleGenerate("regenerate", gen.id);
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
      <ProjectFilePreview
        title={bp?.title || previewGen.app_name}
        subtitle={`${bp?.files?.length ?? 0} files · ${previewGen.provider ?? "deepseek"} · ${previewGen.generation_time_ms ? `${(previewGen.generation_time_ms / 1000).toFixed(1)}s` : "N/A"}`}
        files={bp?.files ?? []}
        downloadName={bp?.title || previewGen.app_name}
        onBack={() => { setPreviewGen(null); setStep("history"); fetchGenerations(); }}
      />
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

      {step === "type" && (
        <DashboardCard>
          <DashboardCardHeader>
            <DashboardCardTitle>Choose App Type</DashboardCardTitle>
            <DashboardCardDescription>Select the type of web application you want to build</DashboardCardDescription>
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
                <label className="mb-1.5 block text-xs font-medium text-white/60">Describe your app</label>
                <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Describe the web application you want to build in detail..." rows={4} className={cn(dashboardInputClass, "min-h-[100px] resize-none")} />
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
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="rounded-xl border-white/10 text-white/60 hover:border-white/20" onClick={() => setStep("type")}>Back</Button>
                <Button onClick={() => handleGenerate()} disabled={!prompt.trim()} className="btn-gold gap-2 rounded-xl font-bold text-luxury-black"><Sparkles className="size-4" /> Generate Web App</Button>
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
                    onView={() => { setPreviewGen(gen); setStep("preview"); }}
                    onRegenerate={() => handleRegenerate(gen)}
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

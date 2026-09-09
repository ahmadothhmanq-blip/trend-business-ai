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
import { GlsGenerationLanguageSelect } from "@/components/dashboard/language/gls-generation-language-select";
import {
  getGlsAvailableGenerationLanguages,
  getInitialGlsGenerationLanguage,
  glsGenerationLanguagePayload,
} from "@/lib/language-platform/generation/service";
import { normalizeGlsGenerationLanguage } from "@/lib/language-platform/generation/options";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/client";
import { useProductT } from "@/lib/i18n/use-scoped-t";
import {
  WEBAPP_TYPES,
  WEBAPP_DESIGN_STYLES,
  WEBAPP_COLOR_STYLES,
  WEBAPP_FEATURE_OPTIONS,
  getWebAppType,
  getWebappTypeForTemplate,
} from "@/lib/constants/webapp-builder";
import { AppTemplatesPanel, resolveTemplateDescription, resolveTemplateLabel, type AppTemplateSummary } from "@/components/dashboard/webapp-builder/app-templates-panel";
import { AppStudioChat } from "@/components/dashboard/webapp-builder/app-studio-chat";
import {
  AppBuilderOnboarding,
  type OnboardingVerticalId,
} from "@/components/dashboard/webapp-builder/app-builder-onboarding";
import { getOnePromptProduct } from "@/lib/constants/one-prompt-products";
import { useIdeaQueryParam } from "@/lib/hooks/use-idea-query-param";
import type { WebAppGeneration } from "@/types/webapp";
import type { StudioChatPlan } from "@/lib/webapp/studio-chat/engine";

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
  const { t } = useTranslation();
  const p = useProductT("webappBuilder");
  const onePrompt = getOnePromptProduct("app-builder");
  const [step, setStep] = useState<"type" | "config" | "history" | "generating" | "preview">("type");
  const [selectedType, setSelectedType] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [selectedTemplateLabel, setSelectedTemplateLabel] = useState("");
  const [onboardingVertical, setOnboardingVertical] = useState<OnboardingVerticalId | "">("");
  const [prompt, setPrompt] = useState("");
  const [language, setLanguage] = useState(() => {
    const initial = normalizeGlsGenerationLanguage(getInitialGlsGenerationLanguage());
    const supported = getGlsAvailableGenerationLanguages("app-builder");
    return supported.includes(initial) ? initial : "English";
  });
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
    setSelectedTemplateId("");
    setSelectedTemplateLabel("");
    const def = getWebAppType(id);
    if (def) setFeatures([...def.defaultFeatures]);
  };

  const handleSelectTemplate = (template: AppTemplateSummary) => {
    setSelectedTemplateId(template.id);
    setSelectedTemplateLabel(resolveTemplateLabel(p, template));
    const appType = getWebappTypeForTemplate(template.id);
    setSelectedType(appType);
    setFeatures([...template.defaultFeatures]);
    if (
      template.id === "crm" ||
      template.id === "booking" ||
      template.id === "ecommerce" ||
      template.id === "healthcare" ||
      template.id === "finance"
    ) {
      setOnboardingVertical(template.id);
    }
    if (!prompt.trim()) {
      setPrompt(resolveTemplateDescription(p, template));
    }
    setStep("config");
  };

  const handleOnboardingVertical = (vertical: OnboardingVerticalId, templateId: string) => {
    setOnboardingVertical(vertical);
    setSelectedTemplateId(templateId);
    setSelectedTemplateLabel(p(`onboarding.verticals.${vertical}.label`));
    setSelectedType(getWebappTypeForTemplate(templateId));
    setStep("config");
  };

  const clearTemplateSelection = () => {
    setSelectedTemplateId("");
    setSelectedTemplateLabel("");
    setOnboardingVertical("");
  };

  const handleGenerate = async (
    mode: "generate" | "regenerate" | "continue" | "retry" = "generate",
    parentGenerationId?: string,
    overridePrompt?: string,
    overrides?: {
      appType?: string;
      templateId?: string;
      features?: string[];
      language?: string;
    },
  ) => {
    const idea = (overridePrompt ?? prompt).trim();
    let appType = overrides?.appType || selectedType;
    let appFeatures = overrides?.features?.length ? overrides.features : features;
    const templateId = overrides?.templateId ?? selectedTemplateId;
    let genLanguage = language;
    if (overrides?.language) {
      const normalized = normalizeGlsGenerationLanguage(overrides.language);
      const supported = getGlsAvailableGenerationLanguages("app-builder");
      if (supported.includes(normalized)) genLanguage = normalized;
    }
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
          ? p("errors.describeChanges")
          : p("errors.enterIdeaApp"),
      );
      return;
    }
    if (overridePrompt) setPrompt(overridePrompt);
    if (overrides?.templateId !== undefined) {
      setSelectedTemplateId(overrides.templateId || "");
    }
    if (overrides?.appType) setSelectedType(overrides.appType);
    if (overrides?.features?.length) setFeatures(overrides.features);
    if (genLanguage !== language) setLanguage(genLanguage);
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
          templateId: templateId || undefined,
          ...glsGenerationLanguagePayload(genLanguage),
          designStyle,
          colorStyle,
          features: appFeatures,
          mode,
          parentGenerationId,
          continueInstruction: mode === "continue" ? idea : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? p("errors.generationFailed")); setStep("config"); return; }
      toast.success(data.message ?? p("toasts.appCreated"));
      setParentId(null);
      if (data.generation) { setPreviewGen(data.generation); setStep("preview"); } else { setStep("history"); }
    } catch { toast.error(p("errors.requestFailedConnection")); setStep("config"); }
  };

  const handleOnePrompt = (idea: string) => {
    void handleGenerate("generate", undefined, idea);
  };

  const handleStudioBuildApproved = (plan: StudioChatPlan, compiledPrompt: string) => {
    setSelectedTemplateLabel(plan.title);
    void handleGenerate("generate", undefined, compiledPrompt, {
      appType: plan.appType || selectedType || WEBAPP_TYPES[0]?.id || "custom",
      templateId: plan.templateId || "",
      features: plan.features.length ? plan.features : features,
      language: plan.language,
    });
  };

  const loadGenerationConfig = (gen: WebAppGeneration) => {
    setSelectedType(gen.app_type);
    const templateId = gen.blueprint?.appModel?.templateId ?? "";
    setSelectedTemplateId(templateId);
    setSelectedTemplateLabel(
      templateId
        ? resolveTemplateLabel(p, { id: templateId, label: templateId })
        : "",
    );
    {
      const next = normalizeGlsGenerationLanguage(gen.language || "English");
      const supported = getGlsAvailableGenerationLanguages("app-builder");
      setLanguage(supported.includes(next) ? next : "English");
    }
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
    toast.message(p("errors.editThenImprove"));
  };

  const handleFavorite = async (gen: WebAppGeneration) => {
    const next = !gen.is_favorite;
    setGenerations((prev) => prev.map((g) => (g.id === gen.id ? { ...g, is_favorite: next } : g)));
    await fetch(`/api/webapp-builder/${gen.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ is_favorite: next }) });
  };

  const handleDelete = async (id: string) => {
    setGenerations((prev) => prev.filter((g) => g.id !== id));
    await fetch(`/api/webapp-builder/${id}`, { method: "DELETE" });
    toast.success(p("toasts.deleted"));
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
            <a href={`/dashboard/app-builder/${previewGen.id}`}>{p("preview.openManagement")}</a>
          </Button>
          <Button asChild variant="outline" className="rounded-xl border-white/10">
            <a href={`/api/webapp-builder/${previewGen.id}/live-preview`} target="_blank" rel="noopener noreferrer">
              {p("preview.openLivePreview")}
            </a>
          </Button>
        </div>
        <AppStudioChat
          mode="edit"
          language={language}
          generationId={previewGen.id}
          onApplied={({ generation }) => {
            setPreviewGen(generation);
            setGenerations((prev) =>
              prev.map((g) => (g.id === generation.id ? generation : g)),
            );
          }}
        />
        <DashboardCard>
          <DashboardCardHeader>
            <DashboardCardTitle>{p("preview.liveAppPreview")}</DashboardCardTitle>
            <DashboardCardDescription>
              {p("preview.liveAppPreviewDescription")}
            </DashboardCardDescription>
          </DashboardCardHeader>
          <DashboardCardContent className="flex justify-center">
            <iframe
              title={p("preview.livePreviewIframeTitle")}
              src={`/api/webapp-builder/${previewGen.id}/live-preview`}
              className="h-[560px] w-full max-w-4xl rounded-2xl border border-white/15 bg-black"
              sandbox="allow-scripts allow-same-origin allow-forms"
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
    return <GenerationProgress title={p("generating.titleLong")} subtitle={p("generating.subtitleLong")} events={progressEvents} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {([{ key: "type" as const, label: p("nav.newApp") }, { key: "history" as const, label: p("nav.myApps") }]).map(({ key, label }) => (
          <button key={key} onClick={() => setStep(key)} className={cn("rounded-xl px-4 py-2 text-sm font-medium transition-all", step === key || (step === "config" && key === "type") ? "bg-premium-gold/15 text-premium-gold-light" : "text-white/50 hover:bg-white/5 hover:text-white/70")}>{label}</button>
        ))}
      </div>

      {(step === "type" || step === "config") && (
        <AppBuilderOnboarding
          selectedVertical={onboardingVertical}
          onPickVertical={handleOnboardingVertical}
        />
      )}

      {(step === "type" || step === "config") && (
        <AppStudioChat
          mode="build"
          language={language}
          seedVertical={onboardingVertical || null}
          onBuildApproved={handleStudioBuildApproved}
        />
      )}

      {(step === "type" || step === "config") && (
        <details className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <summary className="cursor-pointer text-sm font-medium text-white/70">
            {p("studioChat.quickGenerateOptional")}
          </summary>
          <div className="mt-4">
            <OnePromptExperience
              product={onePrompt}
              value={prompt}
              onChange={setPrompt}
              onSubmit={handleOnePrompt}
              showPipelinePreview={step === "type"}
              compact={step === "config"}
              aiDescriptionTags
              language={language}
              onTagsChange={(tags) => {
                if (tags.length > 0) setFeatures(tags);
              }}
              onInsightChange={(insight) => {
                if (!insight.appType || selectedTemplateId) return;
                const label = insight.appType.trim();
                const match = WEBAPP_TYPES.find(
                  (def) =>
                    def.label.toLowerCase() === label.toLowerCase() ||
                    def.id === label.toLowerCase().replace(/\s+/g, "-"),
                );
                if (match) {
                  setSelectedType(match.id);
                  return;
                }
                const arabicToId: Record<string, string> = {
                  "إدارة علاقات العملاء": "crm",
                  "تخطيط موارد المؤسسة": "erp",
                  "لوحة تحكم": "dashboard",
                  "برمجيات سحابية": "saas",
                  "نظام حجوزات": "booking",
                  "نقطة بيع": "pos",
                  "نظام تعليم": "lms",
                  "موارد بشرية": "hr",
                  "مخزون": "inventory",
                  "إدارة متجر إلكتروني": "ecommerce-admin",
                  "تطبيق ويب مخصص": "custom",
                };
                const mapped = arabicToId[label];
                if (mapped) setSelectedType(mapped);
              }}
            />
          </div>
        </details>
      )}

      {step === "type" && (
        <>
          <DashboardCard>
            <DashboardCardContent className="pt-6">
              <AppTemplatesPanel
                selectedId={selectedTemplateId}
                onSelect={handleSelectTemplate}
                onClear={clearTemplateSelection}
              />
            </DashboardCardContent>
          </DashboardCard>

          <DashboardCard>
            <DashboardCardHeader>
              <DashboardCardTitle>{p("steps.orBrowseTemplates")}</DashboardCardTitle>
              <DashboardCardDescription>
                {t("products.common.optionalOnePrompt")}
              </DashboardCardDescription>
            </DashboardCardHeader>
            <DashboardCardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {WEBAPP_TYPES.map((def) => <TypeSelectorCard key={def.id} def={def} selected={selectedType === def.id && !selectedTemplateId} onSelect={() => handleSelectType(def.id)} />)}
              </div>
              {selectedType && !selectedTemplateId && (
                <div className="mt-6 flex justify-end">
                  <Button onClick={() => setStep("config")} className="btn-gold gap-2 rounded-xl font-bold text-luxury-black">{p("steps.configureApp")} <ArrowRight className="size-4" /></Button>
                </div>
              )}
            </DashboardCardContent>
          </DashboardCard>
        </>
      )}

      {step === "config" && (
        <DashboardCard>
          <DashboardCardHeader>
            <div className="flex items-center gap-3">
              {(() => {
                const def = getWebAppType(selectedType);
                const Icon = def?.icon ?? Sparkles;
                const title = selectedTemplateLabel
                  ? selectedTemplateLabel
                  : p("steps.customApp", { type: def?.label ?? t("products.common.custom") });
                return (<>
                <div className="flex size-10 items-center justify-center rounded-xl bg-premium-gold/15 text-premium-gold-light"><Icon className="size-5" /></div>
                <div>
                  <DashboardCardTitle>{title}</DashboardCardTitle>
                  <DashboardCardDescription>
                    {selectedTemplateId
                      ? p("templates.selected", { name: selectedTemplateLabel })
                      : p("steps.configureDescription")}
                  </DashboardCardDescription>
                </div>
              </>); })()}
            </div>
          </DashboardCardHeader>
          <DashboardCardContent>
            <div className="space-y-5">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/60">
                  {parentId ? p("steps.describeChanges") : p("steps.describeYourApp")}
                </label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={parentId ? p("placeholders.appBriefContinue") : p("placeholders.appBriefNew")}
                  rows={4}
                  className={cn(dashboardInputClass, "min-h-[100px] resize-none")}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div><label className="mb-1.5 block text-xs font-medium text-white/60">{p("labels.language")}</label><GlsGenerationLanguageSelect serviceId="app-builder" value={language} onChange={setLanguage} /></div>
                <div><label className="mb-1.5 block text-xs font-medium text-white/60">{p("steps.designStyle")}</label><select value={designStyle} onChange={(e) => setDesignStyle(e.target.value)} className={dashboardSelectClass}>{WEBAPP_DESIGN_STYLES.map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
                <div><label className="mb-1.5 block text-xs font-medium text-white/60">{p("steps.colorStyle")}</label><select value={colorStyle} onChange={(e) => setColorStyle(e.target.value)} className={dashboardSelectClass}>{WEBAPP_COLOR_STYLES.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/60">{p("steps.features")}</label>
                <div className="flex flex-wrap gap-2">{WEBAPP_FEATURE_OPTIONS.map(({ id, label }) => <CheckboxToggle key={id} label={label} checked={features.includes(id)} onChange={(c) => setFeatures((p) => c ? [...p, id] : p.filter((f) => f !== id))} />)}</div>
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button
                  variant="outline"
                  className="rounded-xl border-white/10 text-white/60 hover:border-white/20"
                  onClick={() => {
                    setParentId(null);
                    clearTemplateSelection();
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
                    <Sparkles className="size-4" /> {p("steps.generateWebApp")}
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
            <div className="relative flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/30" /><Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder={p("placeholders.searchApps")} className={cn(dashboardInputClass, "pl-10")} /></div>
            <span className="text-xs text-white/40">
              {total === 1 ? p("history.count", { count: total }) : p("history.countPlural", { count: total })}
            </span>
          </div>
          {generations.length === 0 ? (
            <EmptyHistory noun={p("history.emptyNoun")} item={p("history.emptyItem")} onNew={() => setStep("type")} />
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

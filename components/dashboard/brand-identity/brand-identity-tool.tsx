"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Copy,
  Download,
  Eye,
  Megaphone,
  RefreshCw,
  Search,
  Sparkles,
  Type,
  Wand2,
  LayoutTemplate,
  Settings2,
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
  OnePromptExperience,
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
import { sanitizeSvgContent, safeMarkdownToHtml } from "@/lib/ai/sanitize";
import {
  BRAND_TYPES,
  BRAND_PERSONALITIES,
  BRAND_INDUSTRIES,
  BRAND_DELIVERABLE_OPTIONS,
  getBrandType,
} from "@/lib/constants/brand-identity-builder";
import { getOnePromptProduct } from "@/lib/constants/one-prompt-products";
import { useIdeaQueryParam } from "@/lib/hooks/use-idea-query-param";
import type { BrandIdentityGeneration } from "@/types/brand-identity";
import type { BrandTemplateDefinition } from "@/lib/ai-core/brand-studio/types";

type Props = { initialGenerations?: BrandIdentityGeneration[] };

/* ------------------------------------------------------------------ */
/*  Color Swatch                                                       */
/* ------------------------------------------------------------------ */

function ColorSwatch({ color }: { color: { name: string; hex: string; role: string; usage?: string } }) {
  const p = useProductT("brandIdentity");
  return (
    <button
      type="button"
      className="group flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5 text-left transition-all hover:border-white/[0.12]"
      onClick={() => { navigator.clipboard.writeText(color.hex); toast.success(p("preview.colorCopied", { hex: color.hex })); }}
    >
      <div className="size-10 rounded-lg shadow-inner" style={{ backgroundColor: color.hex }} />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-white/80">{color.name}</p>
        <p className="truncate text-[10px] text-white/40">{color.hex} &middot; {color.role}</p>
        {color.usage && <p className="truncate text-[10px] text-white/30">{color.usage}</p>}
      </div>
      <Copy className="ml-auto size-3 flex-shrink-0 text-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Asset Preview                                                      */
/* ------------------------------------------------------------------ */

function AssetPreview({ asset }: { asset: { name: string; category: string; description: string; content: string; format: string } }) {
  const p = useProductT("brandIdentity");
  const isSvg = asset.format === "svg" && asset.content.includes("<svg");
  const isHtml = asset.format === "html" && asset.content.includes("<");

  return (
    <DashboardPanel className="space-y-3 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-white/80">{asset.name}</p>
          <p className="text-[10px] text-white/40">{asset.category} &middot; {asset.format}</p>
        </div>
        <Button variant="ghost" size="icon-xs" className="text-white/30 hover:text-white" onClick={() => { navigator.clipboard.writeText(asset.content); toast.success(p("preview.copied")); }}>
          <Copy className="size-3" />
        </Button>
      </div>
      {asset.description && <p className="text-xs text-white/50">{asset.description}</p>}
      {isSvg && (
        <div className="overflow-hidden rounded-lg border border-white/[0.06]">
          <div className="flex items-center justify-center bg-white p-4" dangerouslySetInnerHTML={{ __html: sanitizeSvgContent(asset.content) }} />
        </div>
      )}
      {isHtml && !isSvg && (
        <div className="overflow-hidden rounded-lg border border-white/[0.06]">
          <div className="bg-white p-4" dangerouslySetInnerHTML={{ __html: safeMarkdownToHtml(asset.content) }} />
        </div>
      )}
      {!isSvg && !isHtml && asset.content && (
        <pre className="max-h-[200px] overflow-auto rounded-lg bg-white/[0.02] p-3 text-[11px] leading-relaxed text-white/60">{asset.content.slice(0, 2000)}</pre>
      )}
    </DashboardPanel>
  );
}

/* ------------------------------------------------------------------ */
/*  Brand Identity Preview (full brand book view)                      */
/* ------------------------------------------------------------------ */

type PreviewTab = "overview" | "strategy" | "story" | "colors" | "typography" | "voice" | "logo" | "assets" | "files";

function BrandPreview({
  gen,
  onBack,
  onRegenerate,
  onContinue,
}: {
  gen: BrandIdentityGeneration;
  onBack: () => void;
  onRegenerate?: () => void;
  onContinue?: () => void;
}) {
  const { t } = useTranslation();
  const p = useProductT("brandIdentity");
  const bp = gen.blueprint;
  const [tab, setTab] = useState<PreviewTab>("overview");

  if (!bp) {
    return (
      <DashboardPanel className="py-16 text-center">
        <Sparkles className="mx-auto size-10 text-white/20" />
        <p className="mt-4 text-white/50">{p("preview.noBrand")}</p>
        <Button variant="outline" className="mt-4 rounded-xl border-white/10 text-white/60" onClick={onBack}>{t("common.back")}</Button>
      </DashboardPanel>
    );
  }

  const tabs: { key: PreviewTab; label: string; show: boolean }[] = [
    { key: "overview", label: p("preview.overview"), show: true },
    { key: "strategy", label: p("preview.strategy"), show: !!bp.brandStrategy },
    { key: "story", label: p("preview.story"), show: !!bp.brandStory },
    { key: "colors", label: p("preview.colors"), show: bp.colorPalette.length > 0 },
    { key: "typography", label: p("preview.typography"), show: !!bp.typography.primary },
    { key: "voice", label: p("preview.voice"), show: !!bp.voiceTone.tone },
    { key: "logo", label: p("preview.logoRules"), show: !!bp.logoGuidelines },
    { key: "assets", label: p("preview.assets"), show: bp.assets.length > 0 },
    { key: "files", label: p("preview.filesTab"), show: bp.files.length > 0 },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-xs" onClick={onBack} className="text-white/40 hover:text-white"><ArrowLeft className="size-4" /></Button>
        <div>
          <h3 className="font-bold text-white">{bp.title}</h3>
          <p className="text-xs text-white/40">{gen.brand_type} &middot; {gen.provider ?? "deepseek"} &middot; {gen.generation_time_ms ? `${(gen.generation_time_ms / 1000).toFixed(1)}s` : ""}</p>
        </div>
        <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
          <Link href={`/dashboard/brand-studio/${gen.id}`}>
            <Button variant="outline" size="sm" className="gap-1.5 rounded-lg border-white/10 text-xs text-white/60 hover:border-premium-gold/25">
              <Settings2 className="size-3" /> {p("preview.workspace")}
            </Button>
          </Link>
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
          <Button variant="outline" size="sm" className="gap-1.5 rounded-lg border-white/10 text-xs text-white/60 hover:border-premium-gold/25 hover:text-premium-gold-light"
            onClick={async () => {
              const JSZip = (await import("jszip")).default; const zip = new JSZip();
              for (const f of bp.files) zip.file(f.path, f.content);
              const blob = await zip.generateAsync({ type: "blob" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a"); a.href = url;
              a.download = `${bp.title.replace(/\s+/g, "-").toLowerCase()}-brand-kit.zip`; a.click();
              URL.revokeObjectURL(url); toast.success(p("preview.kitDownloaded"));
            }}>
            <Download className="size-3" /> {p("preview.downloadKit")}
          </Button>
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1">
        {tabs.filter((t) => t.show).map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)} className={cn("whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-all", tab === key ? "bg-premium-gold/15 text-premium-gold-light" : "text-white/40 hover:bg-white/5 hover:text-white/60")}>{label}</button>
        ))}
      </div>

      {/* Overview */}
      {tab === "overview" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <DashboardPanel className="space-y-3 p-5">
            <div className="flex items-center gap-2 text-premium-gold-light"><Sparkles className="size-4" /><span className="text-xs font-bold uppercase tracking-wider">{p("preview.mission")}</span></div>
            <p className="text-sm leading-relaxed text-white/70">{bp.mission || p("preview.notSpecified")}</p>
          </DashboardPanel>
          <DashboardPanel className="space-y-3 p-5">
            <div className="flex items-center gap-2 text-premium-gold-light"><Eye className="size-4" /><span className="text-xs font-bold uppercase tracking-wider">{p("preview.vision")}</span></div>
            <p className="text-sm leading-relaxed text-white/70">{bp.vision || p("preview.notSpecified")}</p>
          </DashboardPanel>
          <DashboardPanel className="space-y-3 p-5 sm:col-span-2">
            <div className="flex items-center gap-2 text-premium-gold-light"><BookOpen className="size-4" /><span className="text-xs font-bold uppercase tracking-wider">{p("preview.coreValues")}</span></div>
            <div className="flex flex-wrap gap-2">
              {bp.values.map((v, i) => <span key={i} className="rounded-full border border-premium-gold/20 bg-premium-gold/5 px-3 py-1 text-xs font-medium text-premium-gold-light">{v}</span>)}
            </div>
          </DashboardPanel>
          {bp.voiceTone.tagline && (
            <DashboardPanel className="space-y-2 p-5 sm:col-span-2">
              <div className="flex items-center gap-2 text-premium-gold-light"><Megaphone className="size-4" /><span className="text-xs font-bold uppercase tracking-wider">{p("preview.tagline")}</span></div>
              <p className="text-lg font-bold italic text-white/80">&ldquo;{bp.voiceTone.tagline}&rdquo;</p>
            </DashboardPanel>
          )}
          {bp.voiceTone.elevatorPitch && (
            <DashboardPanel className="space-y-2 p-5 sm:col-span-2">
              <span className="text-xs font-bold uppercase tracking-wider text-white/40">{p("preview.elevatorPitch")}</span>
              <p className="text-sm leading-relaxed text-white/70">{bp.voiceTone.elevatorPitch}</p>
            </DashboardPanel>
          )}
          <DashboardPanel className="p-5 sm:col-span-2">
            <div className="flex gap-4">
              {bp.colorPalette.slice(0, 7).map((c, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <div className="size-12 rounded-xl shadow-lg" style={{ backgroundColor: c.hex }} />
                  <span className="text-[10px] text-white/40">{c.name}</span>
                </div>
              ))}
            </div>
          </DashboardPanel>
        </div>
      )}

      {/* Strategy */}
      {tab === "strategy" && (
        <DashboardPanel className="max-h-[600px] overflow-auto p-6">
          <pre className="whitespace-pre-wrap text-xs leading-relaxed text-white/70">{bp.brandStrategy}</pre>
        </DashboardPanel>
      )}

      {/* Story */}
      {tab === "story" && (
        <DashboardPanel className="max-h-[600px] overflow-auto p-6">
          <pre className="whitespace-pre-wrap text-xs leading-relaxed text-white/70">{bp.brandStory}</pre>
        </DashboardPanel>
      )}

      {/* Colors */}
      {tab === "colors" && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {bp.colorPalette.map((c, i) => <ColorSwatch key={i} color={c} />)}
        </div>
      )}

      {/* Typography */}
      {tab === "typography" && (
        <DashboardPanel className="space-y-5 p-6">
          <div className="flex items-center gap-3">
            <Type className="size-5 text-premium-gold-light" />
            <div>
              <p className="text-sm font-semibold text-white">{p("preview.primaryTypography", { font: bp.typography.primary })}</p>
              <p className="text-xs text-white/40">{p("preview.secondaryTypography", { font: bp.typography.secondary })}</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">{p("preview.headings")}</span>
              <p style={{ fontFamily: `"${bp.typography.primary}", sans-serif` }} className="text-2xl font-bold text-white">{bp.title}</p>
              <p className="text-xs text-white/50">{bp.typography.headingStyle || bp.typography.weight}</p>
            </div>
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">{p("preview.bodyText")}</span>
              <p style={{ fontFamily: `"${bp.typography.secondary}", serif` }} className="text-base leading-relaxed text-white/60">{p("preview.bodySample")}</p>
              <p className="text-xs text-white/50">{bp.typography.bodyStyle}</p>
            </div>
          </div>
          {bp.typography.notes && <p className="text-xs text-white/40">{bp.typography.notes}</p>}
        </DashboardPanel>
      )}

      {/* Voice & Tone */}
      {tab === "voice" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <DashboardPanel className="space-y-3 p-5">
            <span className="text-xs font-bold uppercase tracking-wider text-premium-gold-light">{p("preview.tone")}</span>
            <p className="text-sm text-white/70">{bp.voiceTone.tone}</p>
          </DashboardPanel>
          {bp.voiceTone.doExamples.length > 0 && (
            <DashboardPanel className="space-y-3 p-5">
              <span className="text-xs font-bold uppercase tracking-wider text-green-400">{p("preview.doExamples")}</span>
              {bp.voiceTone.doExamples.map((e, i) => <p key={i} className="text-xs text-white/60">&bull; {e}</p>)}
            </DashboardPanel>
          )}
          {bp.voiceTone.dontExamples.length > 0 && (
            <DashboardPanel className="space-y-3 p-5">
              <span className="text-xs font-bold uppercase tracking-wider text-red-400">{p("preview.dontExamples")}</span>
              {bp.voiceTone.dontExamples.map((e, i) => <p key={i} className="text-xs text-white/60">&bull; {e}</p>)}
            </DashboardPanel>
          )}
        </div>
      )}

      {/* Logo Rules */}
      {tab === "logo" && (
        <DashboardPanel className="max-h-[600px] overflow-auto p-6">
          <pre className="whitespace-pre-wrap text-xs leading-relaxed text-white/70">{bp.logoGuidelines}</pre>
        </DashboardPanel>
      )}

      {/* Assets */}
      {tab === "assets" && (
        <div className="grid gap-4 sm:grid-cols-2">
          {bp.assets.map((a, i) => <AssetPreview key={i} asset={a} />)}
        </div>
      )}

      {/* Files */}
      {tab === "files" && (
        <div className="space-y-2">
          {bp.files.map((f, i) => (
            <DashboardPanel key={i} className="flex items-center justify-between gap-3 p-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-white/80">{f.path}</p>
                <p className="text-[10px] text-white/40">{f.language} &middot; {f.content.length} chars</p>
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
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function toHistoryItem(gen: BrandIdentityGeneration): ProjectHistoryItem {
  const def = getBrandType(gen.brand_type);
  return {
    id: gen.id,
    name: gen.brand_name,
    typeLabel: def?.label ?? gen.brand_type,
    description: gen.description || gen.prompt,
    status: gen.status,
    is_favorite: gen.is_favorite,
    created_at: gen.created_at,
    has_blueprint: !!gen.blueprint,
    tags: gen.deliverables,
  };
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export function BrandIdentityTool({ initialGenerations }: Props) {
  const { t, locale } = useTranslation();
  const p = useProductT("brandIdentity");
  const onePrompt = getOnePromptProduct("brand-designer");
  const [step, setStep] = useState<"type" | "config" | "history" | "generating" | "preview">("type");
  const [selectedType, setSelectedType] = useState("");
  const [brandName, setBrandName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [language, setLanguage] = useState(() =>
    getInitialGlsGenerationLanguage({ fallback: "ui-locale", uiLocale: locale }),
  );
  const [industry, setIndustry] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [personality, setPersonality] = useState("Professional");
  const [deliverables, setDeliverables] = useState<string[]>([]);
  const [progressEvents, setProgressEvents] = useState<string[]>([]);
  const [templates, setTemplates] = useState<BrandTemplateDefinition[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");

  const [generations, setGenerations] = useState<BrandIdentityGeneration[]>(initialGenerations ?? []);
  const [previewGen, setPreviewGen] = useState<BrandIdentityGeneration | null>(null);
  const [parentId, setParentId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const applyIdea = useCallback((idea: string) => {
    setPrompt(idea);
    if (!brandName.trim()) {
      setBrandName(idea.split(/\s+/).slice(0, 3).join(" ").replace(/[^\w\s-]/g, "").trim() || "New Brand");
    }
    setStep("config");
    if (!selectedType) {
      const def = BRAND_TYPES[0];
      setSelectedType(def.id);
      setDeliverables([...def.defaultDeliverables]);
    }
  }, [brandName, selectedType]);
  useIdeaQueryParam(applyIdea);

  const fetchGenerations = useCallback(async () => {
    try {
      const p = new URLSearchParams({ page: String(page), limit: "12" });
      if (search) p.set("search", search);
      const res = await fetch(`/api/brand-identity?${p}`);
      if (!res.ok) return;
      const d = await res.json();
      setGenerations(d.generations ?? []);
      setTotal(d.total ?? 0);
    } catch { /* ignore */ }
  }, [page, search]);

  useEffect(() => {
    fetch("/api/brand-identity/templates")
      .then((r) => r.json())
      .then((d) => setTemplates(d.templates ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => { if (step === "history") fetchGenerations(); }, [step, fetchGenerations]);

  const applyTemplate = (template: BrandTemplateDefinition) => {
    setSelectedTemplate(template.id);
    setSelectedType(template.brandType);
    setPersonality(template.personality);
    setDeliverables([...template.deliverables]);
    if (template.industry) setIndustry(template.industry);
    setStep("config");
    toast.message(`${t("products.common.templateGallery")}: ${template.label}`);
  };

  const handleSelectType = (id: string) => {
    setSelectedType(id);
    const def = getBrandType(id);
    if (def) setDeliverables([...def.defaultDeliverables]);
  };

  const handleGenerate = async (
    mode: "generate" | "regenerate" | "continue" | "retry" = "generate",
    parentGenerationId?: string,
    overridePrompt?: string,
  ) => {
    const idea = (overridePrompt ?? prompt).trim();
    let brandType = selectedType;
    let brandDeliverables = deliverables;
    let name = brandName.trim();
    if (!brandType) {
      const def = BRAND_TYPES[0];
      brandType = def.id;
      brandDeliverables = [...def.defaultDeliverables];
      setSelectedType(brandType);
      setDeliverables(brandDeliverables);
    }
    if (!name && idea) {
      name = idea.split(/\s+/).slice(0, 3).join(" ").replace(/[^\w\s-]/g, "").trim() || "New Brand";
      setBrandName(name);
    }
    if (mode === "continue") {
      if (!idea) {
        toast.error(p("errors.describeChanges"));
        return;
      }
    } else if (!brandType || !idea || !name) {
      toast.error(p("errors.enterBusinessIdea"));
      return;
    }
    if (overridePrompt) setPrompt(overridePrompt);
    setStep("generating");
    setProgressEvents([
      "[idea] Understanding your brand...",
      "[strategy] Defining positioning and voice...",
    ]);
    try {
      const res = await fetch("/api/brand-identity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: idea, brandName: name, brandType, industry, targetAudience,
          brandPersonality: personality, deliverables: brandDeliverables, mode, parentGenerationId,
          continueInstruction: mode === "continue" ? idea : undefined,
          templateId: selectedTemplate || undefined,
          ...glsGenerationLanguagePayload(language),
        }),
      });
      const d = await res.json();
      if (!res.ok) { toast.error(d.error ?? p("errors.generationFailed")); setStep("config"); return; }
      toast.success(d.message ?? p("toasts.brandCreated"));
      setParentId(null);
      if (d.generation) { setPreviewGen(d.generation); setStep("preview"); } else { setStep("history"); }
    } catch { toast.error(p("errors.requestFailed")); setStep("config"); }
  };

  const handleOnePrompt = (idea: string) => {
    void handleGenerate("generate", undefined, idea);
  };

  const loadGenerationConfig = (gen: BrandIdentityGeneration) => {
    setSelectedType(gen.brand_type);
    setBrandName(gen.brand_name);
    setIndustry(gen.industry);
    setTargetAudience(gen.target_audience);
    setPersonality(gen.brand_personality);
    setDeliverables(gen.deliverables ?? []);
  };

  const handleRegenerate = (gen: BrandIdentityGeneration) => {
    loadGenerationConfig(gen);
    setPrompt(gen.prompt);
    void handleGenerate("regenerate", gen.id);
  };

  const handleContinue = (gen: BrandIdentityGeneration) => {
    loadGenerationConfig(gen);
    setParentId(gen.id);
    setPrompt("");
    setPreviewGen(null);
    setStep("config");
    toast.message(p("errors.editThenImprove"));
  };

  const handleFavorite = async (gen: BrandIdentityGeneration) => {
    const next = !gen.is_favorite;
    setGenerations((p) => p.map((g) => g.id === gen.id ? { ...g, is_favorite: next } : g));
    await fetch(`/api/brand-identity/${gen.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ is_favorite: next }) });
  };

  const handleDelete = async (id: string) => {
    setGenerations((p) => p.filter((g) => g.id !== id));
    await fetch(`/api/brand-identity/${id}`, { method: "DELETE" });
    toast.success(p("toasts.deleted"));
  };

  if (step === "preview" && previewGen) {
    return (
      <BrandPreview
        gen={previewGen}
        onBack={() => { setPreviewGen(null); setStep("history"); fetchGenerations(); }}
        onRegenerate={() => handleRegenerate(previewGen)}
        onContinue={() => handleContinue(previewGen)}
      />
    );
  }

  if (step === "generating") {
    return <GenerationProgress title={p("generating.titleLong")} subtitle={p("generating.subtitleLong")} events={progressEvents} />;
  }

  const deliverablesByCategory = BRAND_DELIVERABLE_OPTIONS.reduce<Record<string, typeof BRAND_DELIVERABLE_OPTIONS>>((acc, d) => {
    const cat = d.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(d);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Navigation tabs */}
      <div className="flex gap-2">
        {([{ key: "type" as const, label: p("nav.newBrand") }, { key: "history" as const, label: p("nav.myBrands") }]).map(({ key, label }) => (
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

      {/* Step 1: Select brand type */}
      {step === "type" && (
        <>
        <DashboardCard>
          <DashboardCardHeader>
            <DashboardCardTitle className="flex items-center gap-2">
              <LayoutTemplate className="size-4" /> {t("products.common.templateGallery")}
            </DashboardCardTitle>
            <DashboardCardDescription>{p("steps.templateGalleryDescription")}</DashboardCardDescription>
          </DashboardCardHeader>
          <DashboardCardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => applyTemplate(template)}
                  className={cn(
                    "rounded-xl border p-4 text-left transition-all",
                    selectedTemplate === template.id
                      ? "border-premium-gold/40 bg-premium-gold/10"
                      : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]",
                  )}
                >
                  <div className="mb-2 flex gap-1">
                    {template.previewColors.map((c) => (
                      <div key={c} className="size-4 rounded-full" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <p className="text-sm font-semibold text-white/80">{template.label}</p>
                  <p className="mt-1 text-[11px] text-white/40">{template.description}</p>
                  {template.recommended ? (
                    <span className="mt-2 inline-block rounded-full bg-premium-gold/15 px-2 py-0.5 text-[10px] text-premium-gold-light">{t("products.common.recommended")}</span>
                  ) : null}
                </button>
              ))}
            </div>
          </DashboardCardContent>
        </DashboardCard>
        <DashboardCard>
          <DashboardCardHeader>
            <DashboardCardTitle>{p("steps.orChooseBrandType")}</DashboardCardTitle>
            <DashboardCardDescription>
              {t("products.common.optionalOnePrompt")}
            </DashboardCardDescription>
          </DashboardCardHeader>
          <DashboardCardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {BRAND_TYPES.map((def) => <TypeSelectorCard key={def.id} def={def} selected={selectedType === def.id} onSelect={() => handleSelectType(def.id)} />)}
            </div>
            {selectedType && (
              <div className="mt-6 flex justify-end">
                <Button onClick={() => setStep("config")} className="btn-gold gap-2 rounded-xl font-bold text-luxury-black">{p("steps.configureBrand")} <ArrowRight className="size-4" /></Button>
              </div>
            )}
          </DashboardCardContent>
        </DashboardCard>
        </>
      )}

      {/* Step 2: Configure brand details */}
      {step === "config" && (
        <DashboardCard>
          <DashboardCardHeader>
            <div className="flex items-center gap-3">
              {(() => { const def = getBrandType(selectedType); const Icon = def?.icon ?? Sparkles; return (<>
                <div className="flex size-10 items-center justify-center rounded-xl bg-premium-gold/15 text-premium-gold-light"><Icon className="size-5" /></div>
                <div><DashboardCardTitle>{p("steps.customBrandIdentity", { type: def?.label ?? t("products.common.custom") })}</DashboardCardTitle><DashboardCardDescription>{p("steps.defineBrandDescription")}</DashboardCardDescription></div>
              </>); })()}
            </div>
          </DashboardCardHeader>
          <DashboardCardContent>
            <div className="space-y-5">
              {/* Brand name + Industry */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">{p("steps.brandName")}</label>
                  <Input value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder={p("placeholders.brandNameExample")} className={dashboardInputClass} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">{p("steps.industry")}</label>
                  <select value={industry} onChange={(e) => setIndustry(e.target.value)} className={dashboardSelectClass}>
                    <option value="">{p("steps.selectIndustry")}</option>
                    {BRAND_INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
              </div>

              <div className="max-w-md">
                <label className="mb-1.5 block text-xs font-medium text-white/60">{t("common.language")}</label>
                <GlsGenerationLanguageSelect serviceId="brand-designer" value={language} onChange={setLanguage} />
              </div>

              {/* Target audience + Personality */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">{p("steps.targetAudience")}</label>
                  <Input value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} placeholder={p("placeholders.targetAudienceExample")} className={dashboardInputClass} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">{p("steps.personality")}</label>
                  <select value={personality} onChange={(e) => setPersonality(e.target.value)} className={dashboardSelectClass}>
                    {BRAND_PERSONALITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              {/* Prompt */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/60">
                  {parentId ? p("steps.describeChanges") : p("steps.brandVision")}
                </label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={
                    parentId
                      ? p("placeholders.brandVisionContinue")
                      : p("placeholders.brandVisionNew")
                  }
                  rows={4}
                  className={cn(dashboardInputClass, "min-h-[100px] resize-none")}
                />
              </div>

              {/* Deliverables by category */}
              <div className="space-y-3">
                <label className="block text-xs font-medium text-white/60">{p("steps.deliverables")}</label>
                {Object.entries(deliverablesByCategory).map(([cat, items]) => (
                  <div key={cat}>
                    <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-white/30">{cat}</p>
                    <div className="flex flex-wrap gap-2">
                      {items.map(({ id, label }) => (
                        <CheckboxToggle key={id} label={label} checked={deliverables.includes(id)} onChange={(c) => setDeliverables((p) => c ? [...p, id] : p.filter((d) => d !== id))} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
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
                  <Button onClick={() => void handleGenerate()} disabled={!prompt.trim() || !brandName.trim()} className="btn-gold gap-2 rounded-xl font-bold text-luxury-black">
                    <Sparkles className="size-4" /> {p("steps.generateBrandIdentity")}
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
            <div className="relative flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/30" /><Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder={p("placeholders.searchBrands")} className={cn(dashboardInputClass, "pl-10")} /></div>
            <span className="text-xs text-white/40">
              {total === 1 ? p("history.count", { count: total }) : p("history.countPlural", { count: total })}
            </span>
          </div>
          {generations.length === 0 ? (
            <EmptyHistory noun={p("history.emptyNoun")} item={p("history.emptyItem")} onNew={() => setStep("type")} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {generations.map((gen) => {
                const def = getBrandType(gen.brand_type);
                return (
                  <div key={gen.id} className="relative">
                    <ProjectHistoryCard item={toHistoryItem(gen)} icon={def?.icon ?? Sparkles}
                      onFavorite={() => handleFavorite(gen)} onDelete={() => handleDelete(gen.id)}
                      onView={() => { setPreviewGen(gen); setStep("preview"); }}
                      onRegenerate={() => handleRegenerate(gen)}
                      onContinue={() => handleContinue(gen)} />
                    <Link href={`/dashboard/brand-studio/${gen.id}`} className="absolute right-3 top-14 text-[10px] text-premium-gold-light hover:underline">
                      {t("products.common.openWorkspace")}
                    </Link>
                  </div>
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

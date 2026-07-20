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
  LayoutTemplate,
  Minus,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
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
  SvgPreview,
  type ProjectHistoryItem,
} from "@/components/dashboard/builder-shared";
import { cn } from "@/lib/utils";
import {
  IMAGE_TYPES,
  IMAGE_STYLES,
  IMAGE_ASPECT_RATIOS,
  IMAGE_MOODS,
  IMAGE_NEGATIVE_PRESETS,
  IMAGE_OPTION_LIST,
  getImageType,
} from "@/lib/constants/image-generator";
import type { ImageGeneration } from "@/types/image-generation";
import type { DesignTemplateDefinition } from "@/lib/ai-core/image-design-platform/types";
import type { ImageRasterAsset } from "@/lib/ai-core/image-design-platform/types";

type Props = { initialGenerations?: ImageGeneration[] };

/* ------------------------------------------------------------------ */
/*  SVG Concept Preview                                                */
/* ------------------------------------------------------------------ */

// SvgPreview imported from builder-shared (centralized with SVG sanitization)

/* ------------------------------------------------------------------ */
/*  Image Preview (full gallery view)                                  */
/* ------------------------------------------------------------------ */

type PreviewTab = "gallery" | "images" | "prompts" | "mood" | "files";

function RasterPreview({ asset }: { asset: ImageRasterAsset }) {
  const src = asset.publicUrl || asset.dataUrl;
  if (!src) return null;
  return (
    <div className="overflow-hidden rounded-lg border border-white/[0.06]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={asset.name} className="max-h-[420px] w-full object-contain bg-black/20" />
    </div>
  );
}

function ImagePreview({
  gen,
  onBack,
  onRegenerate,
  onContinue,
}: {
  gen: ImageGeneration;
  onBack: () => void;
  onRegenerate?: () => void;
  onContinue?: () => void;
}) {
  const bp = gen.blueprint;
  const [tab, setTab] = useState<PreviewTab>("gallery");

  if (!bp) {
    return (
      <DashboardPanel className="py-16 text-center">
        <Sparkles className="mx-auto size-10 text-white/20" />
        <p className="mt-4 text-white/50">No generated concepts to preview</p>
        <Button variant="outline" className="mt-4 rounded-xl border-white/10 text-white/60" onClick={onBack}>Back</Button>
      </DashboardPanel>
    );
  }

  const tabs: { key: PreviewTab; label: string; show: boolean }[] = [
    { key: "images", label: `Images (${bp.rasterAssets?.length ?? 0})`, show: (bp.rasterAssets?.length ?? 0) > 0 },
    { key: "gallery", label: `Concepts (${bp.concepts.length})`, show: bp.concepts.length > 0 },
    { key: "prompts", label: `Prompts (${bp.promptLibrary.length})`, show: bp.promptLibrary.length > 0 },
    { key: "mood", label: "Mood Board", show: bp.moodBoard.length > 0 },
    { key: "files", label: `Files (${bp.files.length})`, show: bp.files.length > 0 },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-xs" onClick={onBack} className="text-white/40 hover:text-white"><ArrowLeft className="size-4" /></Button>
        <div>
          <h3 className="font-bold text-white">{bp.title}</h3>
          <p className="text-xs text-white/40">{bp.style} &middot; {bp.imageType} &middot; {gen.aspect_ratio} &middot; {gen.provider ?? "deepseek"} &middot; {gen.generation_time_ms ? `${(gen.generation_time_ms / 1000).toFixed(1)}s` : ""}</p>
        </div>
        <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
          <Link href={`/dashboard/image-generator/${gen.id}/editor`}>
            <Button variant="outline" size="sm" className="gap-1.5 rounded-lg border-premium-gold/25 text-xs text-premium-gold-light hover:border-premium-gold/40">
              <Pencil className="size-3" /> Open Editor
            </Button>
          </Link>
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
          <Button variant="outline" size="sm" className="gap-1.5 rounded-lg border-white/10 text-xs text-white/60 hover:border-premium-gold/25 hover:text-premium-gold-light"
            onClick={() => window.open(`/api/image-generator/${gen.id}/export?format=zip`, "_blank")}>
            <Download className="size-3" /> Export ZIP
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 rounded-lg border-white/10 text-xs text-white/60"
            onClick={async () => {
              const JSZip = (await import("jszip")).default; const zip = new JSZip();
              for (const f of bp.files) zip.file(f.path, f.content);
              const blob = await zip.generateAsync({ type: "blob" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a"); a.href = url;
              a.download = `${bp.title.replace(/\s+/g, "-").toLowerCase()}-images.zip`; a.click();
              URL.revokeObjectURL(url); toast.success("Image kit downloaded");
            }}>
            <Download className="size-3" /> Download Kit
          </Button>
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto">
        {tabs.filter((t) => t.show).map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)} className={cn("whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-all", tab === key ? "bg-premium-gold/15 text-premium-gold-light" : "text-white/40 hover:bg-white/5 hover:text-white/60")}>{label}</button>
        ))}
      </div>

      {/* Raster images */}
      {tab === "images" && (
        <div className="grid gap-4 sm:grid-cols-2">
          {(bp.rasterAssets ?? []).map((asset) => (
            <DashboardPanel key={asset.id} className="space-y-3 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white/80">{asset.name}</p>
                  <p className="text-xs text-white/40">{asset.provider} · {asset.format} · {asset.status}</p>
                </div>
                {asset.publicUrl ? (
                  <Button variant="ghost" size="icon-xs" onClick={() => { navigator.clipboard.writeText(asset.publicUrl!); toast.success("URL copied"); }}>
                    <Copy className="size-3" />
                  </Button>
                ) : null}
              </div>
              <RasterPreview asset={asset} />
            </DashboardPanel>
          ))}
        </div>
      )}

      {/* Gallery */}
      {tab === "gallery" && (
        <div className="space-y-6">
          {bp.concepts.map((c, i) => (
            <DashboardPanel key={i} className="space-y-3 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white/80">{c.name}</p>
                  <p className="text-xs text-white/40">{c.style} &middot; {c.aspectRatio}</p>
                </div>
                {c.prompt && (
                  <Button variant="ghost" size="icon-xs" className="text-white/30 hover:text-white" onClick={() => { navigator.clipboard.writeText(c.prompt); toast.success("Prompt copied"); }}>
                    <Copy className="size-3" />
                  </Button>
                )}
              </div>
              <SvgPreview svg={c.svgConcept} />
              <p className="text-xs leading-relaxed text-white/50">{c.description}</p>
              {c.prompt && (
                <div className="rounded-lg bg-white/[0.02] p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-white/30">AI Prompt</p>
                  <p className="mt-1 text-xs text-white/60">{c.prompt}</p>
                  {c.negativePrompt && <p className="mt-1.5 text-[10px] text-red-400/60">Negative: {c.negativePrompt}</p>}
                </div>
              )}
            </DashboardPanel>
          ))}
        </div>
      )}

      {/* Prompt Library */}
      {tab === "prompts" && (
        <div className="space-y-3">
          {bp.promptLibrary.map((p, i) => (
            <DashboardPanel key={i} className="space-y-2 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-white/80">{p.name}</p>
                <Button variant="ghost" size="icon-xs" className="text-white/30 hover:text-white" onClick={() => { navigator.clipboard.writeText(p.prompt); toast.success("Prompt copied"); }}>
                  <Copy className="size-3" />
                </Button>
              </div>
              <div className="rounded-lg bg-white/[0.02] p-3">
                <p className="text-xs leading-relaxed text-white/60">{p.prompt}</p>
              </div>
              {p.negativePrompt && (
                <div className="rounded-lg bg-red-500/5 p-2">
                  <p className="text-[10px] text-red-400/70">Negative: {p.negativePrompt}</p>
                </div>
              )}
              <p className="text-[10px] text-white/30">Style: {p.style}</p>
            </DashboardPanel>
          ))}
        </div>
      )}

      {/* Mood Board */}
      {tab === "mood" && (
        <DashboardPanel className="space-y-4 p-5">
          <div className="flex items-center gap-2 text-premium-gold-light">
            <BookOpen className="size-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Mood Board Keywords</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {bp.moodBoard.map((m, i) => (
              <span key={i} className="rounded-full border border-premium-gold/20 bg-premium-gold/5 px-3 py-1 text-xs font-medium text-premium-gold-light">{m}</span>
            ))}
          </div>
          <div className="pt-2">
            <p className="text-xs text-white/40">Color Direction: {bp.colorDirection}</p>
          </div>
        </DashboardPanel>
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
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function toHistoryItem(gen: ImageGeneration): ProjectHistoryItem {
  const def = getImageType(gen.image_type);
  return {
    id: gen.id,
    name: gen.image_name,
    typeLabel: def?.label ?? gen.image_type,
    description: gen.description || gen.prompt,
    status: gen.status,
    is_favorite: gen.is_favorite,
    created_at: gen.created_at,
    has_blueprint: !!gen.blueprint,
    tags: gen.options,
  };
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export function ImageGeneratorTool({ initialGenerations }: Props) {
  const [step, setStep] = useState<"type" | "config" | "history" | "generating" | "preview">("type");
  const [selectedType, setSelectedType] = useState("");
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [style, setStyle] = useState("Photorealistic");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [mood, setMood] = useState("Professional");
  const [options, setOptions] = useState<string[]>([]);
  const [batchCount, setBatchCount] = useState(2);
  const [quality, setQuality] = useState<"standard" | "hd">("standard");
  const [useBrand, setUseBrand] = useState(false);
  const [brandIdentity, setBrandIdentity] = useState({
    brandName: "", primary: "#D4AF37", secondary: "#1A1A2E", accent: "#C9A227",
    headingFont: "Inter", bodyFont: "Roboto", voiceTone: "Professional", tagline: "",
  });
  const [templates, setTemplates] = useState<DesignTemplateDefinition[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [progressEvents, setProgressEvents] = useState<string[]>([]);

  const [generations, setGenerations] = useState<ImageGeneration[]>(initialGenerations ?? []);
  const [previewGen, setPreviewGen] = useState<ImageGeneration | null>(null);
  const [parentId, setParentId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchGenerations = useCallback(async () => {
    try {
      const p = new URLSearchParams({ page: String(page), limit: "12" });
      if (search) p.set("search", search);
      const res = await fetch(`/api/image-generator?${p}`);
      if (!res.ok) return;
      const d = await res.json();
      setGenerations(d.generations ?? []);
      setTotal(d.total ?? 0);
    } catch { /* ignore */ }
  }, [page, search]);

  useEffect(() => {
    fetch("/api/image-generator/templates")
      .then((r) => r.json())
      .then((d) => setTemplates(d.templates ?? []))
      .catch(() => {});
  }, []);

  const applyTemplate = (t: DesignTemplateDefinition) => {
    setSelectedTemplate(t.id);
    setSelectedType(t.imageType);
    setStyle(t.style);
    setAspectRatio(t.aspectRatio);
    setMood(t.mood);
    setOptions([...t.deliverables]);
    setStep("config");
    toast.message(`Template: ${t.label}`);
  };

  useEffect(() => { if (step === "history") fetchGenerations(); }, [step, fetchGenerations]);

  const handleSelectType = (id: string) => {
    setSelectedType(id);
    const def = getImageType(id);
    if (def) setOptions([...def.defaultOptions]);
  };

  const handleGenerate = async (
    mode: "generate" | "regenerate" | "continue" | "retry" = "generate",
    parentGenerationId?: string,
  ) => {
    if (!selectedType || !prompt.trim()) {
      toast.error(
        mode === "continue"
          ? "Describe the changes you want in natural language."
          : "Select an image type and describe your image.",
      );
      return;
    }
    setStep("generating");
    setProgressEvents(["Sending request..."]);
    try {
      const res = await fetch("/api/image-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt, negativePrompt, imageType: selectedType, style, aspectRatio,
          mood, options, batchCount, brandColors: useBrand ? [brandIdentity.primary, brandIdentity.secondary, brandIdentity.accent].filter(Boolean) : [],
          mode, parentGenerationId,
          continueInstruction: mode === "continue" ? prompt : undefined,
          templateId: selectedTemplate || undefined,
          quality,
          brandIdentity: useBrand ? brandIdentity : undefined,
        }),
      });
      const d = await res.json();
      if (!res.ok) { toast.error(d.error ?? "Generation failed"); setStep("config"); return; }
      toast.success(d.message ?? "Images generated!");
      setParentId(null);
      if (d.generation) { setPreviewGen(d.generation); setStep("preview"); } else { setStep("history"); }
    } catch { toast.error("Request failed."); setStep("config"); }
  };

  const loadGenerationConfig = (gen: ImageGeneration) => {
    setSelectedType(gen.image_type);
    setStyle(gen.style);
    setAspectRatio(gen.aspect_ratio);
    setMood(gen.mood);
    setOptions(gen.options ?? []);
  };

  const handleRegenerate = (gen: ImageGeneration) => {
    loadGenerationConfig(gen);
    setPrompt(gen.prompt);
    void handleGenerate("regenerate", gen.id);
  };

  const handleContinue = (gen: ImageGeneration) => {
    loadGenerationConfig(gen);
    setParentId(gen.id);
    setPrompt("");
    setPreviewGen(null);
    setStep("config");
    toast.message("Describe your changes in natural language, then click Improve with AI.");
  };

  const handleFavorite = async (gen: ImageGeneration) => {
    const next = !gen.is_favorite;
    setGenerations((p) => p.map((g) => g.id === gen.id ? { ...g, is_favorite: next } : g));
    await fetch(`/api/image-generator/${gen.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ is_favorite: next }) });
  };

  const handleDelete = async (id: string) => {
    setGenerations((p) => p.filter((g) => g.id !== id));
    await fetch(`/api/image-generator/${id}`, { method: "DELETE" });
    toast.success("Deleted");
  };

  if (step === "preview" && previewGen) {
    return (
      <ImagePreview
        gen={previewGen}
        onBack={() => { setPreviewGen(null); setStep("history"); fetchGenerations(); }}
        onRegenerate={() => handleRegenerate(previewGen)}
        onContinue={() => handleContinue(previewGen)}
      />
    );
  }

  if (step === "generating") {
    return <GenerationProgress title="Creating your images..." subtitle="AI is generating concepts, raster images, prompts, and mood board" events={progressEvents} />;
  }

  const optionsByCategory = IMAGE_OPTION_LIST.reduce<Record<string, typeof IMAGE_OPTION_LIST>>((acc, o) => {
    if (!acc[o.category]) acc[o.category] = [];
    acc[o.category].push(o);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Navigation tabs */}
      <div className="flex gap-2">
        {([{ key: "type" as const, label: "New Image" }, { key: "history" as const, label: "My Images" }]).map(({ key, label }) => (
          <button key={key} onClick={() => setStep(key)} className={cn("rounded-xl px-4 py-2 text-sm font-medium transition-all", step === key || (step === "config" && key === "type") ? "bg-premium-gold/15 text-premium-gold-light" : "text-white/50 hover:bg-white/5 hover:text-white/70")}>{label}</button>
        ))}
      </div>

      {/* Step 1: Templates + type */}
      {step === "type" && (
        <>
        <DashboardCard>
          <DashboardCardHeader>
            <DashboardCardTitle className="flex items-center gap-2">
              <LayoutTemplate className="size-4" /> Template Gallery
            </DashboardCardTitle>
            <DashboardCardDescription>Start from social, ad, product, or business templates</DashboardCardDescription>
          </DashboardCardHeader>
          <DashboardCardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {templates.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => applyTemplate(t)}
                  className={cn(
                    "rounded-xl border p-4 text-left transition-all",
                    selectedTemplate === t.id ? "border-premium-gold/40 bg-premium-gold/10" : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]",
                  )}
                >
                  <div className="mb-2 flex gap-1">
                    {t.previewColors.map((c) => (
                      <div key={c} className="size-4 rounded-full" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <p className="text-sm font-semibold text-white/80">{t.label}</p>
                  <p className="mt-1 text-[11px] text-white/40">{t.description}</p>
                </button>
              ))}
            </div>
          </DashboardCardContent>
        </DashboardCard>
        <DashboardCard>
          <DashboardCardHeader>
            <DashboardCardTitle>Choose Image Type</DashboardCardTitle>
            <DashboardCardDescription>Select the type of image you want to generate</DashboardCardDescription>
          </DashboardCardHeader>
          <DashboardCardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {IMAGE_TYPES.map((def) => <TypeSelectorCard key={def.id} def={def} selected={selectedType === def.id} onSelect={() => handleSelectType(def.id)} />)}
            </div>
            {selectedType && (
              <div className="mt-6 flex justify-end">
                <Button onClick={() => setStep("config")} className="btn-gold gap-2 rounded-xl font-bold text-luxury-black">Configure Image <ArrowRight className="size-4" /></Button>
              </div>
            )}
          </DashboardCardContent>
        </DashboardCard>
        </>
      )}

      {/* Step 2: Configure image */}
      {step === "config" && (
        <DashboardCard>
          <DashboardCardHeader>
            <div className="flex items-center gap-3">
              {(() => { const def = getImageType(selectedType); const Icon = def?.icon ?? Sparkles; return (<>
                <div className="flex size-10 items-center justify-center rounded-xl bg-premium-gold/15 text-premium-gold-light"><Icon className="size-5" /></div>
                <div><DashboardCardTitle>{def?.label ?? "Custom"} Image</DashboardCardTitle><DashboardCardDescription>Describe your image and configure generation options</DashboardCardDescription></div>
              </>); })()}
            </div>
          </DashboardCardHeader>
          <DashboardCardContent>
            <div className="space-y-5">
              {/* Prompt */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/60">
                  {parentId ? "Describe changes (natural language)" : "Image description *"}
                </label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={
                    parentId
                      ? "Example: Make the lighting warmer, simplify the background, and add more contrast..."
                      : "Describe the image in detail — subject, scene, colors, composition, lighting, mood..."
                  }
                  rows={4}
                  className={cn(dashboardInputClass, "min-h-[100px] resize-none")}
                />
              </div>

              {/* Negative prompt */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/60">Negative prompt <span className="text-white/30">(what to exclude)</span></label>
                <Input value={negativePrompt} onChange={(e) => setNegativePrompt(e.target.value)} placeholder="e.g. blurry, text, watermark, low quality..." className={dashboardInputClass} />
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {IMAGE_NEGATIVE_PRESETS.map((preset) => (
                    <button key={preset.id} type="button" onClick={() => {
                      const terms = preset.terms.split(", ");
                      const current = negativePrompt.split(",").map((t) => t.trim()).filter(Boolean);
                      const missing = terms.filter((t) => !current.includes(t));
                      if (missing.length) setNegativePrompt([negativePrompt, ...missing].filter(Boolean).join(", "));
                    }}
                      className="rounded-md border border-white/[0.06] bg-white/[0.02] px-2 py-0.5 text-[10px] text-white/40 transition-colors hover:border-white/10 hover:text-white/60">
                      + {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Style, Aspect Ratio, Mood */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">Style</label>
                  <select value={style} onChange={(e) => setStyle(e.target.value)} className={dashboardSelectClass}>
                    {IMAGE_STYLES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">Aspect Ratio</label>
                  <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)} className={dashboardSelectClass}>
                    {IMAGE_ASPECT_RATIOS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">Mood</label>
                  <select value={mood} onChange={(e) => setMood(e.target.value)} className={dashboardSelectClass}>
                    {IMAGE_MOODS.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              {/* Quality + brand */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">Quality</label>
                  <select value={quality} onChange={(e) => setQuality(e.target.value as "standard" | "hd")} className={dashboardSelectClass}>
                    <option value="standard">Standard</option>
                    <option value="hd">HD</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <CheckboxToggle
                    label="Use my brand identity"
                    checked={useBrand}
                    onChange={setUseBrand}
                  />
                </div>
              </div>

              {useBrand && (
                <DashboardPanel className="grid gap-3 p-4 sm:grid-cols-2">
                  <Input value={brandIdentity.brandName} onChange={(e) => setBrandIdentity((b) => ({ ...b, brandName: e.target.value }))} placeholder="Brand name" className={dashboardInputClass} />
                  <Input value={brandIdentity.primary} onChange={(e) => setBrandIdentity((b) => ({ ...b, primary: e.target.value }))} placeholder="Primary color" className={dashboardInputClass} />
                  <Input value={brandIdentity.secondary} onChange={(e) => setBrandIdentity((b) => ({ ...b, secondary: e.target.value }))} placeholder="Secondary color" className={dashboardInputClass} />
                  <Input value={brandIdentity.accent} onChange={(e) => setBrandIdentity((b) => ({ ...b, accent: e.target.value }))} placeholder="Accent color" className={dashboardInputClass} />
                </DashboardPanel>
              )}

              {/* Batch count */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/60">Number of variations</label>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="icon-xs" className="border-white/10 text-white/40" onClick={() => setBatchCount((c) => Math.max(1, c - 1))} disabled={batchCount <= 1}><Minus className="size-3" /></Button>
                  <span className="min-w-[2ch] text-center text-sm font-bold text-white">{batchCount}</span>
                  <Button variant="outline" size="icon-xs" className="border-white/10 text-white/40" onClick={() => setBatchCount((c) => Math.min(4, c + 1))} disabled={batchCount >= 4}><Plus className="size-3" /></Button>
                  <span className="text-xs text-white/30">Max 4</span>
                </div>
              </div>

              {/* Options by category */}
              <div className="space-y-3">
                <label className="block text-xs font-medium text-white/60">Options</label>
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
                    <Sparkles className="size-4" /> Generate {batchCount > 1 ? `${batchCount} Images` : "Image"}
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
            <div className="relative flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/30" /><Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search images..." className={cn(dashboardInputClass, "pl-10")} /></div>
            <span className="text-xs text-white/40">{total} image{total !== 1 ? "s" : ""}</span>
          </div>
          {generations.length === 0 ? (
            <EmptyHistory noun="images" onNew={() => setStep("type")} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {generations.map((gen) => {
                const def = getImageType(gen.image_type);
                return (
                  <ProjectHistoryCard key={gen.id} item={toHistoryItem(gen)} icon={def?.icon ?? Sparkles}
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

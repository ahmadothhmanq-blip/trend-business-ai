"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Copy,
  Download,
  RefreshCw,
  Search,
  Sparkles,
  Type,
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
import { useTranslation } from "@/lib/i18n/client";
import { translateOption } from "@/lib/i18n/product-options";
import { resolveLabel } from "@/lib/i18n/resolve-constant-label";
import { useProductT } from "@/lib/i18n/use-scoped-t";
import {
  LOGO_STYLES,
  LOGO_COLOR_PALETTES,
  LOGO_ICON_STYLES,
  LOGO_INDUSTRIES,
  LOGO_TYPOGRAPHY_OPTIONS,
  LOGO_BRAND_PERSONALITIES,
  LOGO_OPTION_LIST,
  getLogoStyle,
} from "@/lib/constants/logo-designer";
import type { LogoGeneration } from "@/types/logo";

type Props = { initialGenerations?: LogoGeneration[] };

/* ------------------------------------------------------------------ */
/*  SVG Preview Component                                              */
/* ------------------------------------------------------------------ */

// SvgPreview imported from builder-shared (centralized with SVG sanitization)

/* ------------------------------------------------------------------ */
/*  Color Swatch                                                       */
/* ------------------------------------------------------------------ */

function ColorSwatch({ color }: { color: { name: string; hex: string; role: string } }) {
  const p = useProductT("logoDesigner");
  return (
    <button
      type="button"
      className="group flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-2 text-left transition-all hover:border-white/[0.12]"
      onClick={() => { navigator.clipboard.writeText(color.hex); toast.success(p("preview.colorCopied", { hex: color.hex })); }}
    >
      <div className="size-10 rounded-lg shadow-inner" style={{ backgroundColor: color.hex }} />
      <div>
        <p className="text-xs font-semibold text-white/80">{color.name}</p>
        <p className="text-[10px] text-white/40">{color.hex} &middot; {color.role}</p>
      </div>
      <Copy className="ml-auto size-3 text-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Logo Preview (full brand kit view)                                 */
/* ------------------------------------------------------------------ */

function LogoPreview({
  gen,
  onBack,
  onRegenerate,
  onContinue,
}: {
  gen: LogoGeneration;
  onBack: () => void;
  onRegenerate?: () => void;
  onContinue?: () => void;
}) {
  const { t } = useTranslation();
  const p = useProductT("logoDesigner");
  const bp = gen.blueprint;
  const [activeTab, setActiveTab] = useState<"concepts" | "variations" | "colors" | "typography" | "guidelines" | "files">("concepts");

  if (!bp) {
    return (
      <DashboardPanel className="py-16 text-center">
        <Sparkles className="mx-auto size-10 text-white/20" />
        <p className="mt-4 text-white/50">{p("preview.noLogo")}</p>
        <Button variant="outline" className="mt-4 rounded-xl border-white/10 text-white/60" onClick={onBack}>{t("common.back")}</Button>
      </DashboardPanel>
    );
  }

  const tabs = [
    { key: "concepts" as const, label: p("preview.concepts") },
    { key: "variations" as const, label: p("preview.variations") },
    { key: "colors" as const, label: p("preview.colors") },
    { key: "typography" as const, label: p("preview.typography") },
    { key: "guidelines" as const, label: p("preview.guidelines") },
    { key: "files" as const, label: p("preview.files") },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-xs" onClick={onBack} className="text-white/40 hover:text-white"><ArrowLeft className="size-4" /></Button>
        <div>
          <h3 className="font-bold text-white">{bp.title}</h3>
          <p className="text-xs text-white/40">{bp.logoStyle} &middot; {gen.provider ?? "deepseek"} &middot; {gen.generation_time_ms ? `${(gen.generation_time_ms / 1000).toFixed(1)}s` : p("preview.notAvailable")}</p>
        </div>
        <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
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
              a.download = `${bp.title.replace(/\s+/g, "-").toLowerCase()}-logo.zip`; a.click();
              URL.revokeObjectURL(url); toast.success(p("toasts.kitDownloaded"));
            }}>
            <Download className="size-3" /> {p("preview.downloadKit")}
          </Button>
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto">
        {tabs.map(({ key, label }) => (
          <button key={key} onClick={() => setActiveTab(key)} className={cn("whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-all", activeTab === key ? "bg-premium-gold/15 text-premium-gold-light" : "text-white/40 hover:bg-white/5 hover:text-white/60")}>{label}</button>
        ))}
      </div>

      {activeTab === "concepts" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bp.concepts.map((c, i) => (
            <div key={i} className="space-y-2">
              <SvgPreview svg={c.svgCode} label={c.name} />
              <p className="px-1 text-xs text-white/50">{c.description}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === "variations" && (
        bp.variations.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {bp.variations.map((v, i) => (
              <div key={i} className="space-y-2">
                <SvgPreview svg={v.svgCode} label={v.name} />
                <p className="px-1 text-[10px] text-white/40">{v.useCase}</p>
              </div>
            ))}
          </div>
        ) : (
          <DashboardPanel className="py-10 text-center"><p className="text-sm text-white/40">{p("preview.noVariations")}</p></DashboardPanel>
        )
      )}

      {activeTab === "colors" && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {bp.colorPalette.map((c, i) => <ColorSwatch key={i} color={c} />)}
        </div>
      )}

      {activeTab === "typography" && (
        <DashboardPanel className="space-y-4 p-6">
          <div className="flex items-center gap-3">
            <Type className="size-5 text-premium-gold-light" />
            <div>
              <p className="text-sm font-semibold text-white">{p("preview.primaryTypography", { font: bp.typography.primary })}</p>
              <p className="text-xs text-white/40">{p("preview.secondaryTypography", { font: bp.typography.secondary })}</p>
            </div>
          </div>
          {bp.typography.notes && <p className="text-xs text-white/50">{bp.typography.notes}</p>}
          <div className="space-y-3 pt-2">
            <p style={{ fontFamily: `"${bp.typography.primary}", sans-serif` }} className="text-3xl font-bold text-white">{bp.title}</p>
            <p style={{ fontFamily: `"${bp.typography.secondary}", serif` }} className="text-lg text-white/60">{p("preview.typeSample")}</p>
          </div>
        </DashboardPanel>
      )}

      {activeTab === "guidelines" && (
        <DashboardPanel className="max-h-[600px] overflow-auto p-6">
          {bp.guidelines ? (
            <div className="prose prose-invert prose-sm max-w-none">
              <pre className="whitespace-pre-wrap text-xs leading-relaxed text-white/70">{bp.guidelines}</pre>
            </div>
          ) : (
            <p className="text-sm text-white/40">{p("preview.noGuidelines")}</p>
          )}
        </DashboardPanel>
      )}

      {activeTab === "files" && (
        <div className="space-y-2">
          {bp.files.map((f, i) => (
            <DashboardPanel key={i} className="flex items-center justify-between gap-3 p-3">
              <div>
                <p className="text-xs font-semibold text-white/80">{f.path}</p>
                <p className="text-[10px] text-white/40">{f.language} &middot; {f.content.length} {p("preview.chars")}</p>
              </div>
              <Button variant="ghost" size="icon-xs" className="text-white/30 hover:text-white" onClick={() => { navigator.clipboard.writeText(f.content); toast.success(p("preview.copied")); }}>
                <Copy className="size-3" />
              </Button>
            </DashboardPanel>
          ))}
          {bp.files.length === 0 && <DashboardPanel className="py-10 text-center"><p className="text-sm text-white/40">{p("preview.noFiles")}</p></DashboardPanel>}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function toHistoryItem(gen: LogoGeneration): ProjectHistoryItem {
  const def = getLogoStyle(gen.logo_style);
  return {
    id: gen.id,
    name: gen.logo_name,
    typeLabel: def?.label ?? gen.logo_style,
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

export function LogoDesignerTool({ initialGenerations }: Props) {
  const { t } = useTranslation();
  const p = useProductT("logoDesigner");
  const [step, setStep] = useState<"style" | "config" | "history" | "generating" | "preview">("style");
  const [selectedStyle, setSelectedStyle] = useState("");
  const [brandName, setBrandName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [industry, setIndustry] = useState("");
  const [colorPalette, setColorPalette] = useState("Auto");
  const [iconStyle, setIconStyle] = useState("Abstract");
  const [typography, setTypography] = useState("Auto");
  const [personality, setPersonality] = useState("Professional");
  const [options, setOptions] = useState<string[]>([]);
  const [progressEvents, setProgressEvents] = useState<string[]>([]);

  const [generations, setGenerations] = useState<LogoGeneration[]>(initialGenerations ?? []);
  const [previewGen, setPreviewGen] = useState<LogoGeneration | null>(null);
  const [parentId, setParentId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchGenerations = useCallback(async () => {
    try {
      const p = new URLSearchParams({ page: String(page), limit: "12" });
      if (search) p.set("search", search);
      const res = await fetch(`/api/logo-designer?${p}`);
      if (!res.ok) return;
      const d = await res.json();
      setGenerations(d.generations ?? []);
      setTotal(d.total ?? 0);
    } catch { /* ignore */ }
  }, [page, search]);

  useEffect(() => { if (step === "history") fetchGenerations(); }, [step, fetchGenerations]);

  const handleSelectStyle = (id: string) => {
    setSelectedStyle(id);
    const def = getLogoStyle(id);
    if (def) setOptions([...def.defaultOptions]);
  };

  const handleGenerate = async (
    mode: "generate" | "regenerate" | "continue" | "retry" = "generate",
    parentGenerationId?: string,
  ) => {
    if (mode === "continue") {
      if (!prompt.trim()) {
        toast.error(p("errors.describeChanges"));
        return;
      }
    } else if (!selectedStyle || !prompt.trim() || !brandName.trim()) {
      toast.error(p("errors.enterBrandDetails"));
      return;
    }
    setStep("generating");
    setProgressEvents([p("generating.sendingRequest")]);
    try {
      const res = await fetch("/api/logo-designer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt, brandName, logoStyle: selectedStyle, industry, colorPalette,
          iconStyle, typography, personality, options, mode, parentGenerationId,
          continueInstruction: mode === "continue" ? prompt : undefined,
        }),
      });
      const d = await res.json();
      if (!res.ok) { toast.error(d.error ?? p("errors.generationFailed")); setStep("config"); return; }
      toast.success(d.message ?? p("toasts.logoDesigned"));
      setParentId(null);
      if (d.generation) { setPreviewGen(d.generation); setStep("preview"); } else { setStep("history"); }
    } catch { toast.error(p("errors.requestFailed")); setStep("config"); }
  };

  const loadGenerationConfig = (gen: LogoGeneration) => {
    setSelectedStyle(gen.logo_style);
    setBrandName(gen.logo_name);
    setIndustry(gen.industry);
    setColorPalette(gen.color_palette);
    setIconStyle(gen.icon_style);
    setOptions(gen.options ?? []);
  };

  const handleRegenerate = (gen: LogoGeneration) => {
    loadGenerationConfig(gen);
    setPrompt(gen.prompt);
    void handleGenerate("regenerate", gen.id);
  };

  const handleContinue = (gen: LogoGeneration) => {
    loadGenerationConfig(gen);
    setParentId(gen.id);
    setPrompt("");
    setPreviewGen(null);
    setStep("config");
    toast.message(p("errors.editThenImprove"));
  };

  const handleFavorite = async (gen: LogoGeneration) => {
    const next = !gen.is_favorite;
    setGenerations((p) => p.map((g) => g.id === gen.id ? { ...g, is_favorite: next } : g));
    await fetch(`/api/logo-designer/${gen.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ is_favorite: next }) });
  };

  const handleDelete = async (id: string) => {
    setGenerations((p) => p.filter((g) => g.id !== id));
    await fetch(`/api/logo-designer/${id}`, { method: "DELETE" });
    toast.success(p("toasts.deleted"));
  };

  if (step === "preview" && previewGen) {
    return (
      <LogoPreview
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

  return (
    <div className="space-y-6">
      {/* Navigation tabs */}
      <div className="flex gap-2">
        {([{ key: "style" as const, label: p("nav.newLogo") }, { key: "history" as const, label: p("nav.myLogos") }]).map(({ key, label }) => (
          <button key={key} onClick={() => setStep(key)} className={cn("rounded-xl px-4 py-2 text-sm font-medium transition-all", step === key || (step === "config" && key === "style") ? "bg-premium-gold/15 text-premium-gold-light" : "text-white/50 hover:bg-white/5 hover:text-white/70")}>{label}</button>
        ))}
      </div>

      {/* Step 1: Select logo style */}
      {step === "style" && (
        <DashboardCard>
          <DashboardCardHeader>
            <DashboardCardTitle>{p("steps.chooseLogoStyle")}</DashboardCardTitle>
            <DashboardCardDescription>{p("steps.chooseLogoStyleDescription")}</DashboardCardDescription>
          </DashboardCardHeader>
          <DashboardCardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {LOGO_STYLES.map((def) => <TypeSelectorCard key={def.id} def={def} selected={selectedStyle === def.id} onSelect={() => handleSelectStyle(def.id)} />)}
            </div>
            {selectedStyle && (
              <div className="mt-6 flex justify-end">
                <Button onClick={() => setStep("config")} className="btn-gold gap-2 rounded-xl font-bold text-luxury-black">{p("steps.configureLogo")} <ArrowRight className="size-4" /></Button>
              </div>
            )}
          </DashboardCardContent>
        </DashboardCard>
      )}

      {/* Step 2: Configure logo details */}
      {step === "config" && (
        <DashboardCard>
          <DashboardCardHeader>
            <div className="flex items-center gap-3">
              {(() => { const def = getLogoStyle(selectedStyle); const Icon = def?.icon ?? Sparkles; return (<>
                <div className="flex size-10 items-center justify-center rounded-xl bg-premium-gold/15 text-premium-gold-light"><Icon className="size-5" /></div>
                <div><DashboardCardTitle>{p("steps.customLogo", { type: def?.label ?? t("common.create") })}</DashboardCardTitle><DashboardCardDescription>{p("steps.configureDescription")}</DashboardCardDescription></div>
              </>); })()}
            </div>
          </DashboardCardHeader>
          <DashboardCardContent>
            <div className="space-y-5">
              {/* Brand name + Industry */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">{p("steps.brandName")}</label>
                  <Input value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder={p("placeholders.brandName")} className={dashboardInputClass} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">{p("steps.industry")}</label>
                  <select value={industry} onChange={(e) => setIndustry(e.target.value)} className={dashboardSelectClass}>
                    <option value="">{p("steps.selectIndustry")}</option>
                    {LOGO_INDUSTRIES.map((i) => <option key={i} value={i}>{translateOption(t, "constants.logoDesigner.industries", i)}</option>)}
                  </select>
                </div>
              </div>

              {/* Prompt */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/60">
                  {parentId ? p("steps.describeChanges") : p("steps.describeVision")}
                </label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={parentId ? p("placeholders.editExample") : p("placeholders.logoBrief")}
                  rows={4}
                  className={cn(dashboardInputClass, "min-h-[100px] resize-none")}
                />
              </div>

              {/* Style selectors */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">{p("steps.colorPalette")}</label>
                  <select value={colorPalette} onChange={(e) => setColorPalette(e.target.value)} className={dashboardSelectClass}>
                    {LOGO_COLOR_PALETTES.map((c) => <option key={c} value={c}>{translateOption(t, "constants.logoDesigner.colorPalettes", c)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">{p("steps.iconStyle")}</label>
                  <select value={iconStyle} onChange={(e) => setIconStyle(e.target.value)} className={dashboardSelectClass}>
                    {LOGO_ICON_STYLES.map((s) => <option key={s} value={s}>{translateOption(t, "constants.logoDesigner.iconStyles", s)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">{p("steps.typography")}</label>
                  <select value={typography} onChange={(e) => setTypography(e.target.value)} className={dashboardSelectClass}>
                    {LOGO_TYPOGRAPHY_OPTIONS.map((opt) => <option key={opt} value={opt}>{translateOption(t, "constants.logoDesigner.typography", opt)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">{p("steps.brandPersonality")}</label>
                  <select value={personality} onChange={(e) => setPersonality(e.target.value)} className={dashboardSelectClass}>
                    {LOGO_BRAND_PERSONALITIES.map((pers) => <option key={pers} value={pers}>{translateOption(t, "constants.logoDesigner.personalities", pers)}</option>)}
                  </select>
                </div>
              </div>

              {/* Deliverables */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/60">{p("steps.deliverables")}</label>
                <div className="flex flex-wrap gap-2">{LOGO_OPTION_LIST.map((opt) => <CheckboxToggle key={opt.id} label={resolveLabel(t, opt)} checked={options.includes(opt.id)} onChange={(c) => setOptions((p) => c ? [...p, opt.id] : p.filter((o) => o !== opt.id))} />)}</div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-2">
                <Button
                  variant="outline"
                  className="rounded-xl border-white/10 text-white/60 hover:border-white/20"
                  onClick={() => {
                    setParentId(null);
                    setStep("style");
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
                    <Sparkles className="size-4" /> {p("steps.generateLogo")}
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
            <div className="relative flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/30" /><Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder={p("placeholders.searchLogos")} className={cn(dashboardInputClass, "pl-10")} /></div>
            <span className="text-xs text-white/40">{total === 1 ? p("history.count", { count: total }) : p("history.countPlural", { count: total })}</span>
          </div>
          {generations.length === 0 ? (
            <EmptyHistory noun={p("history.emptyNoun")} onNew={() => setStep("style")} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {generations.map((gen) => {
                const def = getLogoStyle(gen.logo_style);
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

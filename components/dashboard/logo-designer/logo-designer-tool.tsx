"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Copy,
  Download,
  Search,
  Sparkles,
  Type,
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
  return (
    <button
      type="button"
      className="group flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-2 text-left transition-all hover:border-white/[0.12]"
      onClick={() => { navigator.clipboard.writeText(color.hex); toast.success(`Copied ${color.hex}`); }}
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

function LogoPreview({ gen, onBack }: { gen: LogoGeneration; onBack: () => void }) {
  const bp = gen.blueprint;
  const [activeTab, setActiveTab] = useState<"concepts" | "variations" | "colors" | "typography" | "guidelines" | "files">("concepts");

  if (!bp) {
    return (
      <DashboardPanel className="py-16 text-center">
        <Sparkles className="mx-auto size-10 text-white/20" />
        <p className="mt-4 text-white/50">No generated logo to preview</p>
        <Button variant="outline" className="mt-4 rounded-xl border-white/10 text-white/60" onClick={onBack}>Back</Button>
      </DashboardPanel>
    );
  }

  const tabs = [
    { key: "concepts" as const, label: "Concepts" },
    { key: "variations" as const, label: "Variations" },
    { key: "colors" as const, label: "Colors" },
    { key: "typography" as const, label: "Typography" },
    { key: "guidelines" as const, label: "Guidelines" },
    { key: "files" as const, label: "Files" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-xs" onClick={onBack} className="text-white/40 hover:text-white"><ArrowLeft className="size-4" /></Button>
        <div>
          <h3 className="font-bold text-white">{bp.title}</h3>
          <p className="text-xs text-white/40">{bp.logoStyle} &middot; {gen.provider ?? "deepseek"} &middot; {gen.generation_time_ms ? `${(gen.generation_time_ms / 1000).toFixed(1)}s` : "N/A"}</p>
        </div>
        <div className="ml-auto">
          <Button variant="outline" size="sm" className="gap-1.5 rounded-lg border-white/10 text-xs text-white/60 hover:border-premium-gold/25 hover:text-premium-gold-light"
            onClick={async () => {
              const JSZip = (await import("jszip")).default; const zip = new JSZip();
              for (const f of bp.files) zip.file(f.path, f.content);
              const blob = await zip.generateAsync({ type: "blob" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a"); a.href = url;
              a.download = `${bp.title.replace(/\s+/g, "-").toLowerCase()}-logo.zip`; a.click();
              URL.revokeObjectURL(url); toast.success("Logo kit downloaded");
            }}>
            <Download className="size-3" /> Download Kit
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
          <DashboardPanel className="py-10 text-center"><p className="text-sm text-white/40">No variations were requested</p></DashboardPanel>
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
              <p className="text-sm font-semibold text-white">Primary: {bp.typography.primary}</p>
              <p className="text-xs text-white/40">Secondary: {bp.typography.secondary}</p>
            </div>
          </div>
          {bp.typography.notes && <p className="text-xs text-white/50">{bp.typography.notes}</p>}
          <div className="space-y-3 pt-2">
            <p style={{ fontFamily: `"${bp.typography.primary}", sans-serif` }} className="text-3xl font-bold text-white">{bp.title}</p>
            <p style={{ fontFamily: `"${bp.typography.secondary}", serif` }} className="text-lg text-white/60">The quick brown fox jumps over the lazy dog</p>
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
            <p className="text-sm text-white/40">No guidelines were generated</p>
          )}
        </DashboardPanel>
      )}

      {activeTab === "files" && (
        <div className="space-y-2">
          {bp.files.map((f, i) => (
            <DashboardPanel key={i} className="flex items-center justify-between gap-3 p-3">
              <div>
                <p className="text-xs font-semibold text-white/80">{f.path}</p>
                <p className="text-[10px] text-white/40">{f.language} &middot; {f.content.length} chars</p>
              </div>
              <Button variant="ghost" size="icon-xs" className="text-white/30 hover:text-white" onClick={() => { navigator.clipboard.writeText(f.content); toast.success("Copied"); }}>
                <Copy className="size-3" />
              </Button>
            </DashboardPanel>
          ))}
          {bp.files.length === 0 && <DashboardPanel className="py-10 text-center"><p className="text-sm text-white/40">No files generated</p></DashboardPanel>}
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

  const handleGenerate = async (mode: "generate" | "regenerate" | "retry" = "generate", parentId?: string) => {
    if (!selectedStyle || !prompt.trim() || !brandName.trim()) {
      toast.error("Enter your brand name, select a style, and describe your logo.");
      return;
    }
    setStep("generating");
    setProgressEvents(["Sending request..."]);
    try {
      const res = await fetch("/api/logo-designer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt, brandName, logoStyle: selectedStyle, industry, colorPalette,
          iconStyle, typography, personality, options, mode, parentGenerationId: parentId,
        }),
      });
      const d = await res.json();
      if (!res.ok) { toast.error(d.error ?? "Generation failed"); setStep("config"); return; }
      toast.success(d.message ?? "Logo designed!");
      if (d.generation) { setPreviewGen(d.generation); setStep("preview"); } else { setStep("history"); }
    } catch { toast.error("Request failed."); setStep("config"); }
  };

  const handleRegenerate = (gen: LogoGeneration) => {
    setSelectedStyle(gen.logo_style);
    setPrompt(gen.prompt);
    setBrandName(gen.logo_name);
    setIndustry(gen.industry);
    setColorPalette(gen.color_palette);
    setIconStyle(gen.icon_style);
    setOptions(gen.options ?? []);
    handleGenerate("regenerate", gen.id);
  };

  const handleFavorite = async (gen: LogoGeneration) => {
    const next = !gen.is_favorite;
    setGenerations((p) => p.map((g) => g.id === gen.id ? { ...g, is_favorite: next } : g));
    await fetch(`/api/logo-designer/${gen.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ is_favorite: next }) });
  };

  const handleDelete = async (id: string) => {
    setGenerations((p) => p.filter((g) => g.id !== id));
    await fetch(`/api/logo-designer/${id}`, { method: "DELETE" });
    toast.success("Deleted");
  };

  if (step === "preview" && previewGen) {
    return <LogoPreview gen={previewGen} onBack={() => { setPreviewGen(null); setStep("history"); fetchGenerations(); }} />;
  }

  if (step === "generating") {
    return <GenerationProgress title="Designing your logo..." subtitle="AI is creating concepts, variations, and brand guidelines" events={progressEvents} />;
  }

  return (
    <div className="space-y-6">
      {/* Navigation tabs */}
      <div className="flex gap-2">
        {([{ key: "style" as const, label: "New Logo" }, { key: "history" as const, label: "My Logos" }]).map(({ key, label }) => (
          <button key={key} onClick={() => setStep(key)} className={cn("rounded-xl px-4 py-2 text-sm font-medium transition-all", step === key || (step === "config" && key === "style") ? "bg-premium-gold/15 text-premium-gold-light" : "text-white/50 hover:bg-white/5 hover:text-white/70")}>{label}</button>
        ))}
      </div>

      {/* Step 1: Select logo style */}
      {step === "style" && (
        <DashboardCard>
          <DashboardCardHeader>
            <DashboardCardTitle>Choose Logo Style</DashboardCardTitle>
            <DashboardCardDescription>Select the visual direction for your logo design</DashboardCardDescription>
          </DashboardCardHeader>
          <DashboardCardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {LOGO_STYLES.map((def) => <TypeSelectorCard key={def.id} def={def} selected={selectedStyle === def.id} onSelect={() => handleSelectStyle(def.id)} />)}
            </div>
            {selectedStyle && (
              <div className="mt-6 flex justify-end">
                <Button onClick={() => setStep("config")} className="btn-gold gap-2 rounded-xl font-bold text-luxury-black">Configure Logo <ArrowRight className="size-4" /></Button>
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
                <div><DashboardCardTitle>{def?.label ?? "Custom"} Logo</DashboardCardTitle><DashboardCardDescription>Configure your brand details and logo preferences</DashboardCardDescription></div>
              </>); })()}
            </div>
          </DashboardCardHeader>
          <DashboardCardContent>
            <div className="space-y-5">
              {/* Brand name + Industry */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">Brand Name *</label>
                  <Input value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="e.g. Trend Business" className={dashboardInputClass} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">Industry</label>
                  <select value={industry} onChange={(e) => setIndustry(e.target.value)} className={dashboardSelectClass}>
                    <option value="">Select industry</option>
                    {LOGO_INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
              </div>

              {/* Prompt */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/60">Describe your vision *</label>
                <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Describe what your brand does, the feeling the logo should convey, any symbols or imagery you envision..." rows={4} className={cn(dashboardInputClass, "min-h-[100px] resize-none")} />
              </div>

              {/* Style selectors */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">Color Palette</label>
                  <select value={colorPalette} onChange={(e) => setColorPalette(e.target.value)} className={dashboardSelectClass}>
                    {LOGO_COLOR_PALETTES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">Icon Style</label>
                  <select value={iconStyle} onChange={(e) => setIconStyle(e.target.value)} className={dashboardSelectClass}>
                    {LOGO_ICON_STYLES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">Typography</label>
                  <select value={typography} onChange={(e) => setTypography(e.target.value)} className={dashboardSelectClass}>
                    {LOGO_TYPOGRAPHY_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">Brand Personality</label>
                  <select value={personality} onChange={(e) => setPersonality(e.target.value)} className={dashboardSelectClass}>
                    {LOGO_BRAND_PERSONALITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              {/* Deliverables */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/60">Deliverables &amp; Variations</label>
                <div className="flex flex-wrap gap-2">{LOGO_OPTION_LIST.map(({ id, label }) => <CheckboxToggle key={id} label={label} checked={options.includes(id)} onChange={(c) => setOptions((p) => c ? [...p, id] : p.filter((o) => o !== id))} />)}</div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="rounded-xl border-white/10 text-white/60 hover:border-white/20" onClick={() => setStep("style")}>Back</Button>
                <Button onClick={() => handleGenerate()} disabled={!prompt.trim() || !brandName.trim()} className="btn-gold gap-2 rounded-xl font-bold text-luxury-black">
                  <Sparkles className="size-4" /> Generate Logo
                </Button>
              </div>
            </div>
          </DashboardCardContent>
        </DashboardCard>
      )}

      {/* History */}
      {step === "history" && (
        <>
          <div className="flex items-center gap-3">
            <div className="relative flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/30" /><Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search logos..." className={cn(dashboardInputClass, "pl-10")} /></div>
            <span className="text-xs text-white/40">{total} logo{total !== 1 ? "s" : ""}</span>
          </div>
          {generations.length === 0 ? (
            <EmptyHistory noun="logos" onNew={() => setStep("style")} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {generations.map((gen) => {
                const def = getLogoStyle(gen.logo_style);
                return (
                  <ProjectHistoryCard key={gen.id} item={toHistoryItem(gen)} icon={def?.icon ?? Sparkles}
                    onFavorite={() => handleFavorite(gen)} onDelete={() => handleDelete(gen.id)}
                    onView={() => { setPreviewGen(gen); setStep("preview"); }}
                    onRegenerate={() => handleRegenerate(gen)} />
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

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpen,
  Check,
  ChevronDown,
  ChevronUp,
  ClipboardCopy,
  Copy,
  Download,
  Eye,
  FileText,
  Lightbulb,
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
  type ProjectHistoryItem,
} from "@/components/dashboard/builder-shared";
import { cn } from "@/lib/utils";
import { safeMarkdownToHtml } from "@/lib/ai/sanitize";
import {
  CONTENT_TOOLS,
  CONTENT_TONES,
  CONTENT_AUDIENCES,
  CONTENT_LANGUAGES,
  WRITING_STYLES,
  CREATIVITY_LEVELS,
  CONTENT_OPTION_LIST,
  getContentTool,
  getContentTypesForTool,
  getContentTypeLabel,
} from "@/lib/constants/content-studio";
import type { ContentGeneration, ContentBlueprint } from "@/types/content";

type Props = { initialGenerations?: ContentGeneration[] };

/* ------------------------------------------------------------------ */
/*  CONTENT PREVIEW                                                    */
/* ------------------------------------------------------------------ */

type PreviewTab = "content" | "seo" | "headlines" | "review" | "files";

function ContentPreview({ gen, onBack }: { gen: ContentGeneration; onBack: () => void }) {
  const bp = gen.blueprint;
  const [tab, setTab] = useState<PreviewTab>("content");
  const [copied, setCopied] = useState(false);

  if (!bp) {
    return (
      <DashboardPanel className="py-16 text-center">
        <FileText className="mx-auto size-10 text-white/20" />
        <p className="mt-4 text-white/50">No content to preview</p>
        <Button variant="outline" className="mt-4 rounded-xl border-white/10 text-white/60" onClick={onBack}>Back</Button>
      </DashboardPanel>
    );
  }

  const wordCount = bp.body.split(/\s+/).filter(Boolean).length;

  const tabs: { key: PreviewTab; label: string; show: boolean }[] = [
    { key: "content", label: "Content", show: true },
    { key: "seo", label: `SEO ${bp.seo ? `(${bp.seo.score}/100)` : ""}`, show: !!bp.seo },
    { key: "headlines", label: `Headlines (${bp.headlines.length})`, show: bp.headlines.length > 1 },
    { key: "review", label: "Review", show: bp.suggestions.length > 0 || bp.improvements.length > 0 },
    { key: "files", label: `Files (${bp.files.length})`, show: bp.files.length > 0 },
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(bp.body);
    setCopied(true);
    toast.success("Content copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-xs" onClick={onBack} className="text-white/40 hover:text-white"><ArrowLeft className="size-4" /></Button>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-bold text-white">{bp.title}</h3>
          <p className="text-xs text-white/40">{getContentTypeLabel(bp.contentType)} &middot; {bp.tone} &middot; {bp.language} &middot; {wordCount} words &middot; {gen.provider ?? "deepseek"}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 rounded-lg border-white/10 text-xs text-white/60 hover:text-white" onClick={handleCopy}>
            {copied ? <Check className="size-3" /> : <ClipboardCopy className="size-3" />} {copied ? "Copied" : "Copy"}
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 rounded-lg border-white/10 text-xs text-white/60 hover:border-premium-gold/25 hover:text-premium-gold-light"
            onClick={async () => {
              const JSZip = (await import("jszip")).default; const zip = new JSZip();
              for (const f of bp.files) zip.file(f.path, f.content);
              const blob = await zip.generateAsync({ type: "blob" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a"); a.href = url;
              a.download = `${bp.title.replace(/\s+/g, "-").toLowerCase()}-content.zip`; a.click();
              URL.revokeObjectURL(url); toast.success("Content exported");
            }}>
            <Download className="size-3" /> Export ZIP
          </Button>
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto">
        {tabs.filter((t) => t.show).map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)} className={cn("whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-all", tab === key ? "bg-premium-gold/15 text-premium-gold-light" : "text-white/40 hover:bg-white/5 hover:text-white/60")}>{label}</button>
        ))}
      </div>

      {tab === "content" && (
        <DashboardPanel className="p-5 sm:p-8">
          <article className="prose prose-invert prose-sm max-w-none prose-headings:text-white/90 prose-p:text-white/70 prose-li:text-white/60 prose-strong:text-white/80 prose-a:text-premium-gold-light">
            <div dangerouslySetInnerHTML={{ __html: safeMarkdownToHtml(bp.body) }} />
          </article>
        </DashboardPanel>
      )}

      {tab === "seo" && bp.seo && (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <SeoScoreCard label="SEO Score" value={bp.seo.score} max={100} />
            <SeoScoreCard label="Readability" value={bp.seo.readabilityScore} max={100} />
            <SeoScoreCard label="Word Count" value={bp.seo.wordCount || wordCount} />
          </div>

          <DashboardPanel className="space-y-4 p-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/30">Meta Title</p>
              <p className="mt-1 text-sm text-white/80">{bp.seo.metaTitle}</p>
              <p className="mt-0.5 text-[10px] text-white/30">{bp.seo.metaTitle.length}/60 chars</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/30">Meta Description</p>
              <p className="mt-1 text-sm text-white/60">{bp.seo.metaDescription}</p>
              <p className="mt-0.5 text-[10px] text-white/30">{bp.seo.metaDescription.length}/160 chars</p>
            </div>
          </DashboardPanel>

          {Object.keys(bp.seo.keywordDensity).length > 0 && (
            <DashboardPanel className="p-5">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-white/30">Keyword Density</p>
              <div className="space-y-2">
                {Object.entries(bp.seo.keywordDensity).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between">
                    <span className="text-xs text-white/60">{k}</span>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-white/5">
                        <div className="h-full rounded-full bg-premium-gold/50" style={{ width: `${Math.min(Number(v) * 20, 100)}%` }} />
                      </div>
                      <span className="min-w-[3ch] text-right text-xs font-mono text-premium-gold-light">{v}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </DashboardPanel>
          )}

          {bp.seo.faqItems.length > 0 && (
            <DashboardPanel className="p-5">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-white/30">Generated FAQ</p>
              <div className="space-y-3">
                {bp.seo.faqItems.map((faq, i) => (
                  <FaqItem key={i} question={faq.question} answer={faq.answer} />
                ))}
              </div>
            </DashboardPanel>
          )}

          {bp.seo.headingStructure.length > 0 && (
            <DashboardPanel className="p-5">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-white/30">Heading Structure</p>
              <ul className="space-y-1">{bp.seo.headingStructure.map((h, i) => <li key={i} className="text-xs text-white/50">{h}</li>)}</ul>
            </DashboardPanel>
          )}

          {bp.seo.internalLinkingSuggestions.length > 0 && (
            <DashboardPanel className="p-5">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-white/30">Internal Linking Suggestions</p>
              <ul className="space-y-1">{bp.seo.internalLinkingSuggestions.map((l, i) => <li key={i} className="text-xs text-white/50">→ {l}</li>)}</ul>
            </DashboardPanel>
          )}

          {bp.seo.schemaSuggestions.length > 0 && (
            <DashboardPanel className="p-5">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-white/30">Schema Suggestions</p>
              <div className="flex flex-wrap gap-2">
                {bp.seo.schemaSuggestions.map((s) => <span key={s} className="rounded-md bg-premium-gold/10 px-2 py-0.5 text-[10px] text-premium-gold-light">{s}</span>)}
              </div>
            </DashboardPanel>
          )}
        </div>
      )}

      {tab === "headlines" && (
        <DashboardPanel className="space-y-2 p-5">
          {bp.headlines.map((h, i) => (
            <div key={i} className="flex items-center justify-between gap-3 rounded-lg bg-white/[0.02] p-3">
              <span className="min-w-[1.5rem] text-center text-xs font-bold text-premium-gold-light">{i + 1}</span>
              <span className="flex-1 text-sm text-white/70">{h}</span>
              <Button variant="ghost" size="icon-xs" className="text-white/30 hover:text-white" onClick={() => { navigator.clipboard.writeText(h); toast.success("Copied"); }}>
                <Copy className="size-3" />
              </Button>
            </div>
          ))}
        </DashboardPanel>
      )}

      {tab === "review" && (
        <div className="space-y-4">
          {bp.suggestions.length > 0 && (
            <DashboardPanel className="p-5">
              <div className="mb-3 flex items-center gap-2 text-premium-gold-light"><Lightbulb className="size-4" /><span className="text-xs font-bold uppercase tracking-wider">Suggestions</span></div>
              <ul className="space-y-2">{bp.suggestions.map((s, i) => <li key={i} className="text-xs text-white/60">• {s}</li>)}</ul>
            </DashboardPanel>
          )}
          {bp.improvements.length > 0 && (
            <DashboardPanel className="p-5">
              <div className="mb-3 flex items-center gap-2 text-premium-gold-light"><Wand2 className="size-4" /><span className="text-xs font-bold uppercase tracking-wider">Improvements</span></div>
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
/*  HELPER COMPONENTS                                                  */
/* ------------------------------------------------------------------ */

function SeoScoreCard({ label, value, max }: { label: string; value: number; max?: number }) {
  const pct = max ? Math.round((value / max) * 100) : 0;
  const color = max ? (pct >= 80 ? "text-green-400" : pct >= 50 ? "text-yellow-400" : "text-red-400") : "text-white/80";
  return (
    <DashboardPanel className="flex flex-col items-center justify-center p-4 text-center">
      <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">{label}</span>
      <span className={cn("mt-1 text-2xl font-black", color)}>{value}{max ? <span className="text-sm text-white/20">/{max}</span> : ""}</span>
    </DashboardPanel>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg bg-white/[0.02]">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between gap-2 p-3 text-left">
        <span className="text-xs font-medium text-white/70">{question}</span>
        {open ? <ChevronUp className="size-3 text-white/30" /> : <ChevronDown className="size-3 text-white/30" />}
      </button>
      {open && <div className="border-t border-white/5 p-3 text-xs text-white/50">{answer}</div>}
    </div>
  );
}

// markdownToHtml replaced by safeMarkdownToHtml from @/lib/ai/sanitize

/* ------------------------------------------------------------------ */
/*  HISTORY HELPER                                                     */
/* ------------------------------------------------------------------ */

function toHistoryItem(gen: ContentGeneration): ProjectHistoryItem {
  const tool = getContentTool(gen.content_tool);
  return {
    id: gen.id,
    name: gen.title,
    typeLabel: getContentTypeLabel(gen.content_type),
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

export function ContentStudioTool({ initialGenerations }: Props) {
  type Step = "tool" | "type" | "config" | "generating" | "preview" | "history";

  const [step, setStep] = useState<Step>("tool");
  const [selectedTool, setSelectedTool] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [prompt, setPrompt] = useState("");
  const [tone, setTone] = useState("Professional");
  const [audience, setAudience] = useState("General");
  const [language, setLanguage] = useState("English");
  const [brandVoice, setBrandVoice] = useState("");
  const [writingStyle, setWritingStyle] = useState("Standard");
  const [creativityLevel, setCreativityLevel] = useState("balanced");
  const [options, setOptions] = useState<string[]>([]);
  const [seoKeywords, setSeoKeywords] = useState("");
  const [progressEvents, setProgressEvents] = useState<string[]>([]);

  const [generations, setGenerations] = useState<ContentGeneration[]>(initialGenerations ?? []);
  const [previewGen, setPreviewGen] = useState<ContentGeneration | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const availableTypes = useMemo(() => selectedTool ? getContentTypesForTool(selectedTool) : [], [selectedTool]);

  const fetchGenerations = useCallback(async () => {
    try {
      const p = new URLSearchParams({ page: String(page), limit: "12" });
      if (search) p.set("search", search);
      const res = await fetch(`/api/content-studio?${p}`);
      if (!res.ok) return;
      const d = await res.json();
      setGenerations(d.generations ?? []);
      setTotal(d.total ?? 0);
    } catch { /* ignore */ }
  }, [page, search]);

  useEffect(() => { if (step === "history") fetchGenerations(); }, [step, fetchGenerations]);

  const handleSelectTool = (id: string) => {
    setSelectedTool(id);
    const tool = getContentTool(id);
    if (tool) {
      setOptions([...tool.defaultOptions]);
      setSelectedType(tool.defaultType);
      if (id === "content-calendar" || id === "campaign-planner") {
        setStep("config");
      } else {
        setStep("type");
      }
    }
  };

  const handleGenerate = async (mode: ContentGeneration["mode"] = "generate", parentId?: string) => {
    if (!selectedTool || !prompt.trim()) { toast.error("Select a tool and describe your content."); return; }
    setStep("generating");
    setProgressEvents(["Sending request..."]);
    try {
      const res = await fetch("/api/content-studio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt, contentTool: selectedTool, contentType: selectedType,
          tone, audience, language, brandVoice, writingStyle,
          creativityLevel, options, seoKeywords, mode, parentGenerationId: parentId,
        }),
      });
      const d = await res.json();
      if (!res.ok) { toast.error(d.error ?? "Generation failed"); setStep("config"); return; }
      toast.success(d.message ?? "Content created!");
      if (d.generation) { setPreviewGen(d.generation); setStep("preview"); } else { setStep("history"); }
    } catch { toast.error("Request failed."); setStep("config"); }
  };

  const handleRegenerate = (gen: ContentGeneration) => {
    setSelectedTool(gen.content_tool); setSelectedType(gen.content_type);
    setPrompt(gen.prompt); setTone(gen.tone); setAudience(gen.audience);
    setLanguage(gen.language); setBrandVoice(gen.brand_voice);
    setWritingStyle(gen.writing_style); setCreativityLevel(gen.creativity_level);
    setOptions(gen.options ?? []); setSeoKeywords(gen.seo_keywords);
    handleGenerate("regenerate", gen.id);
  };

  const handleFavorite = async (gen: ContentGeneration) => {
    const next = !gen.is_favorite;
    setGenerations((p) => p.map((g) => g.id === gen.id ? { ...g, is_favorite: next } : g));
    await fetch(`/api/content-studio/${gen.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ is_favorite: next }) });
  };

  const handleDelete = async (id: string) => {
    setGenerations((p) => p.filter((g) => g.id !== id));
    await fetch(`/api/content-studio/${id}`, { method: "DELETE" });
    toast.success("Deleted");
  };

  if (step === "preview" && previewGen) {
    return <ContentPreview gen={previewGen} onBack={() => { setPreviewGen(null); setStep("history"); fetchGenerations(); }} />;
  }

  if (step === "generating") {
    return <GenerationProgress title="Creating your content..." subtitle="AI is writing, analyzing, and optimizing your content" events={progressEvents} />;
  }

  const optionsByCategory = CONTENT_OPTION_LIST.reduce<Record<string, typeof CONTENT_OPTION_LIST>>((acc, o) => {
    if (!acc[o.category]) acc[o.category] = [];
    acc[o.category].push(o);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex gap-2 overflow-x-auto">
        {([
          { key: "tool" as const, label: "New Content" },
          { key: "history" as const, label: "My Content" },
        ]).map(({ key, label }) => (
          <button key={key} onClick={() => setStep(key)} className={cn("whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition-all", step === key || step === "type" || step === "config" ? (key === "tool" ? "bg-premium-gold/15 text-premium-gold-light" : "text-white/50 hover:bg-white/5 hover:text-white/70") : step === "history" ? (key === "history" ? "bg-premium-gold/15 text-premium-gold-light" : "text-white/50 hover:bg-white/5 hover:text-white/70") : "text-white/50 hover:bg-white/5 hover:text-white/70")}>{label}</button>
        ))}
      </div>

      {/* Step 1: Tool Selection */}
      {step === "tool" && (
        <DashboardCard>
          <DashboardCardHeader>
            <DashboardCardTitle>Content Studio</DashboardCardTitle>
            <DashboardCardDescription>Choose a content tool to get started</DashboardCardDescription>
          </DashboardCardHeader>
          <DashboardCardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {CONTENT_TOOLS.map((def) => <TypeSelectorCard key={def.id} def={def} selected={selectedTool === def.id} onSelect={() => handleSelectTool(def.id)} />)}
            </div>
          </DashboardCardContent>
        </DashboardCard>
      )}

      {/* Step 2: Content Type Selection */}
      {step === "type" && (
        <DashboardCard>
          <DashboardCardHeader>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon-xs" onClick={() => { setStep("tool"); setSelectedTool(""); }} className="text-white/40 hover:text-white"><ArrowLeft className="size-4" /></Button>
              {(() => { const tool = getContentTool(selectedTool); const Icon = tool?.icon ?? FileText; return (
                <><div className="flex size-10 items-center justify-center rounded-xl bg-premium-gold/15 text-premium-gold-light"><Icon className="size-5" /></div>
                <div><DashboardCardTitle>{tool?.label ?? "Content"}</DashboardCardTitle><DashboardCardDescription>Choose a content type</DashboardCardDescription></div></>
              ); })()}
            </div>
          </DashboardCardHeader>
          <DashboardCardContent>
            {(() => {
              const byCategory = availableTypes.reduce<Record<string, typeof availableTypes>>((acc, t) => {
                if (!acc[t.category]) acc[t.category] = [];
                acc[t.category].push(t);
                return acc;
              }, {});
              return Object.entries(byCategory).map(([cat, types]) => (
                <div key={cat} className="mb-4">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-white/30">{cat}</p>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {types.map((def) => <TypeSelectorCard key={def.id} def={def} selected={selectedType === def.id} onSelect={() => setSelectedType(def.id)} />)}
                  </div>
                </div>
              ));
            })()}
            {selectedType && (
              <div className="mt-4 flex justify-end">
                <Button onClick={() => setStep("config")} className="btn-gold gap-2 rounded-xl font-bold text-luxury-black">Configure <ArrowRight className="size-4" /></Button>
              </div>
            )}
          </DashboardCardContent>
        </DashboardCard>
      )}

      {/* Step 3: Configuration */}
      {step === "config" && (
        <DashboardCard>
          <DashboardCardHeader>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon-xs" onClick={() => setStep(selectedTool === "content-calendar" || selectedTool === "campaign-planner" ? "tool" : "type")} className="text-white/40 hover:text-white"><ArrowLeft className="size-4" /></Button>
              {(() => { const tool = getContentTool(selectedTool); const Icon = tool?.icon ?? Sparkles; return (
                <><div className="flex size-10 items-center justify-center rounded-xl bg-premium-gold/15 text-premium-gold-light"><Icon className="size-5" /></div>
                <div><DashboardCardTitle>{tool?.label ?? "Content"}: {getContentTypeLabel(selectedType)}</DashboardCardTitle><DashboardCardDescription>Configure your content generation</DashboardCardDescription></div></>
              ); })()}
            </div>
          </DashboardCardHeader>
          <DashboardCardContent>
            <div className="space-y-5">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/60">Content brief *</label>
                <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Describe the content you want to create — topic, key points, goals, target audience, any specific requirements..." rows={4} className={cn(dashboardInputClass, "min-h-[100px] resize-none")} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">Tone</label>
                  <select value={tone} onChange={(e) => setTone(e.target.value)} className={dashboardSelectClass}>
                    {CONTENT_TONES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">Audience</label>
                  <select value={audience} onChange={(e) => setAudience(e.target.value)} className={dashboardSelectClass}>
                    {CONTENT_AUDIENCES.map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">Language</label>
                  <select value={language} onChange={(e) => setLanguage(e.target.value)} className={dashboardSelectClass}>
                    {CONTENT_LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">Writing Style</label>
                  <select value={writingStyle} onChange={(e) => setWritingStyle(e.target.value)} className={dashboardSelectClass}>
                    {WRITING_STYLES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">Creativity Level</label>
                  <select value={creativityLevel} onChange={(e) => setCreativityLevel(e.target.value)} className={dashboardSelectClass}>
                    {CREATIVITY_LEVELS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/60">Brand Voice <span className="text-white/20">(optional)</span></label>
                <Input value={brandVoice} onChange={(e) => setBrandVoice(e.target.value)} placeholder="Describe your brand's voice — e.g. 'Tech-savvy, friendly, authoritative'" className={dashboardInputClass} />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/60">SEO Keywords <span className="text-white/20">(optional, comma-separated)</span></label>
                <Input value={seoKeywords} onChange={(e) => setSeoKeywords(e.target.value)} placeholder="e.g. AI business tools, content automation, marketing AI" className={dashboardInputClass} />
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-medium text-white/60">Content Options</label>
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

              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="rounded-xl border-white/10 text-white/60 hover:border-white/20" onClick={() => setStep(selectedTool === "content-calendar" || selectedTool === "campaign-planner" ? "tool" : "type")}>Back</Button>
                <Button onClick={() => handleGenerate()} disabled={!prompt.trim()} className="btn-gold gap-2 rounded-xl font-bold text-luxury-black">
                  <Sparkles className="size-4" /> Generate Content
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
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/30" />
              <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search content..." className={cn(dashboardInputClass, "pl-10")} />
            </div>
            <span className="text-xs text-white/40">{total} item{total !== 1 ? "s" : ""}</span>
          </div>
          {generations.length === 0 ? (
            <EmptyHistory noun="content" onNew={() => setStep("tool")} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {generations.map((gen) => {
                const tool = getContentTool(gen.content_tool);
                return (
                  <ProjectHistoryCard key={gen.id} item={toHistoryItem(gen)} icon={tool?.icon ?? FileText}
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

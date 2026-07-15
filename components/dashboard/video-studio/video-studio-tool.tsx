"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Copy,
  Download,
  FileText,
  Film,
  Minus,
  Music,
  Plus,
  Search,
  Sparkles,
  Subtitles,
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
  VIDEO_TYPES,
  VIDEO_STYLES,
  VIDEO_ASPECT_RATIOS,
  VIDEO_DURATIONS,
  VIDEO_CAMERA_MOVES,
  VIDEO_MOODS,
  VIDEO_OPTION_LIST,
  getVideoType,
} from "@/lib/constants/video-studio";
import type { VideoGeneration, VideoBlueprint } from "@/types/video";

type Props = { initialGenerations?: VideoGeneration[] };

// SvgPreview imported from builder-shared (centralized with SVG sanitization)

type PreviewTab = "storyboard" | "script" | "audio" | "subtitles" | "thumbnail" | "files";

function VideoPreview({ gen, onBack }: { gen: VideoGeneration; onBack: () => void }) {
  const bp = gen.blueprint;
  const [tab, setTab] = useState<PreviewTab>("storyboard");

  if (!bp) {
    return (
      <DashboardPanel className="py-16 text-center">
        <Film className="mx-auto size-10 text-white/20" />
        <p className="mt-4 text-white/50">No video project to preview</p>
        <Button variant="outline" className="mt-4 rounded-xl border-white/10 text-white/60" onClick={onBack}>Back</Button>
      </DashboardPanel>
    );
  }

  const tabs: { key: PreviewTab; label: string; show: boolean }[] = [
    { key: "storyboard", label: `Storyboard (${bp.scenes.length})`, show: bp.scenes.length > 0 },
    { key: "script", label: "Script", show: !!bp.script || !!bp.voiceoverScript },
    { key: "audio", label: "Audio", show: bp.musicSuggestions.length > 0 },
    { key: "subtitles", label: "Subtitles", show: bp.subtitles.length > 0 },
    { key: "thumbnail", label: "Thumbnail", show: !!bp.thumbnailSvg },
    { key: "files", label: `Files (${bp.files.length})`, show: bp.files.length > 0 },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-xs" onClick={onBack} className="text-white/40 hover:text-white"><ArrowLeft className="size-4" /></Button>
        <div>
          <h3 className="font-bold text-white">{bp.title}</h3>
          <p className="text-xs text-white/40">{bp.style} &middot; {bp.aspectRatio} &middot; {bp.totalDuration} &middot; {bp.scenes.length} scenes &middot; {gen.provider ?? "deepseek"}</p>
        </div>
        <div className="ml-auto">
          <Button variant="outline" size="sm" className="gap-1.5 rounded-lg border-white/10 text-xs text-white/60 hover:border-premium-gold/25 hover:text-premium-gold-light"
            onClick={async () => {
              const JSZip = (await import("jszip")).default; const zip = new JSZip();
              for (const f of bp.files) zip.file(f.path, f.content);
              const blob = await zip.generateAsync({ type: "blob" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a"); a.href = url;
              a.download = `${bp.title.replace(/\s+/g, "-").toLowerCase()}-video.zip`; a.click();
              URL.revokeObjectURL(url); toast.success("Video project downloaded");
            }}>
            <Download className="size-3" /> Download Project
          </Button>
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto">
        {tabs.filter((t) => t.show).map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)} className={cn("whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-all", tab === key ? "bg-premium-gold/15 text-premium-gold-light" : "text-white/40 hover:bg-white/5 hover:text-white/60")}>{label}</button>
        ))}
      </div>

      {tab === "storyboard" && (
        <div className="space-y-4">
          {bp.scenes.map((scene, i) => (
            <DashboardPanel key={scene.id} className="space-y-3 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white/80">Scene {i + 1}: {scene.name}</p>
                  <p className="text-[10px] text-white/40">{scene.duration} &middot; {scene.cameraMove} &middot; {scene.mood} &middot; → {scene.transition}</p>
                </div>
                {scene.visualPrompt && (
                  <Button variant="ghost" size="icon-xs" className="text-white/30 hover:text-white" onClick={() => { navigator.clipboard.writeText(scene.visualPrompt); toast.success("Prompt copied"); }}>
                    <Copy className="size-3" />
                  </Button>
                )}
              </div>
              <SvgPreview svg={scene.svgStoryboard} label={`Scene ${i + 1}`} />
              <p className="text-xs text-white/50">{scene.description}</p>
              {scene.narration && (
                <div className="rounded-lg bg-white/[0.02] p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-white/30">Narration</p>
                  <p className="mt-1 text-xs italic text-white/60">&ldquo;{scene.narration}&rdquo;</p>
                </div>
              )}
              {scene.visualPrompt && (
                <div className="rounded-lg bg-white/[0.02] p-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-white/30">Video AI Prompt</p>
                  <p className="mt-1 text-[11px] text-white/50">{scene.visualPrompt}</p>
                </div>
              )}
              {(scene.musicDirection || scene.sfxNotes) && (
                <div className="flex gap-4 text-[10px] text-white/30">
                  {scene.musicDirection && <span>🎵 {scene.musicDirection}</span>}
                  {scene.sfxNotes && <span>🔊 {scene.sfxNotes}</span>}
                </div>
              )}
            </DashboardPanel>
          ))}
        </div>
      )}

      {tab === "script" && (
        <div className="space-y-4">
          {bp.script && (
            <DashboardPanel className="space-y-2 p-5">
              <div className="flex items-center gap-2 text-premium-gold-light"><FileText className="size-4" /><span className="text-xs font-bold uppercase tracking-wider">Full Script</span></div>
              <pre className="max-h-[500px] overflow-auto whitespace-pre-wrap text-xs leading-relaxed text-white/70">{bp.script}</pre>
            </DashboardPanel>
          )}
          {bp.voiceoverScript && (
            <DashboardPanel className="space-y-2 p-5">
              <div className="flex items-center gap-2 text-premium-gold-light"><Subtitles className="size-4" /><span className="text-xs font-bold uppercase tracking-wider">Voice-over Script</span></div>
              <pre className="max-h-[400px] overflow-auto whitespace-pre-wrap text-xs leading-relaxed text-white/70">{bp.voiceoverScript}</pre>
            </DashboardPanel>
          )}
        </div>
      )}

      {tab === "audio" && (
        <div className="space-y-3">
          {bp.musicSuggestions.map((m, i) => (
            <DashboardPanel key={i} className="flex items-center gap-4 p-4">
              <Music className="size-5 text-premium-gold-light" />
              <div>
                <p className="text-sm font-semibold text-white/80">{m.name}</p>
                <p className="text-xs text-white/40">{m.genre} &middot; {m.mood} &middot; {m.bpm} BPM</p>
              </div>
            </DashboardPanel>
          ))}
        </div>
      )}

      {tab === "subtitles" && (
        <DashboardPanel className="space-y-1 p-4">
          {bp.subtitles.map((s, i) => (
            <div key={i} className="flex gap-3 py-1">
              <span className="min-w-[3rem] text-right text-xs font-mono text-premium-gold-light">{s.timestamp}</span>
              <span className="text-xs text-white/60">{s.text}</span>
            </div>
          ))}
        </DashboardPanel>
      )}

      {tab === "thumbnail" && (
        <SvgPreview svg={bp.thumbnailSvg} label="Thumbnail" />
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

function toHistoryItem(gen: VideoGeneration): ProjectHistoryItem {
  const def = getVideoType(gen.video_type);
  return {
    id: gen.id,
    name: gen.video_name,
    typeLabel: def?.label ?? gen.video_type,
    description: gen.description || gen.prompt,
    status: gen.status,
    is_favorite: gen.is_favorite,
    created_at: gen.created_at,
    has_blueprint: !!gen.blueprint,
    tags: gen.options,
  };
}

export function VideoStudioTool({ initialGenerations }: Props) {
  const [step, setStep] = useState<"type" | "config" | "history" | "generating" | "preview">("type");
  const [selectedType, setSelectedType] = useState("");
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("Cinematic");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [duration, setDuration] = useState("10s");
  const [mood, setMood] = useState("Professional");
  const [cameraMove, setCameraMove] = useState("Static");
  const [options, setOptions] = useState<string[]>([]);
  const [sceneCount, setSceneCount] = useState(3);
  const [progressEvents, setProgressEvents] = useState<string[]>([]);

  const [generations, setGenerations] = useState<VideoGeneration[]>(initialGenerations ?? []);
  const [previewGen, setPreviewGen] = useState<VideoGeneration | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchGenerations = useCallback(async () => {
    try {
      const p = new URLSearchParams({ page: String(page), limit: "12" });
      if (search) p.set("search", search);
      const res = await fetch(`/api/video-studio?${p}`);
      if (!res.ok) return;
      const d = await res.json();
      setGenerations(d.generations ?? []);
      setTotal(d.total ?? 0);
    } catch { /* ignore */ }
  }, [page, search]);

  useEffect(() => { if (step === "history") fetchGenerations(); }, [step, fetchGenerations]);

  const handleSelectType = (id: string) => {
    setSelectedType(id);
    const def = getVideoType(id);
    if (def) setOptions([...def.defaultOptions]);
  };

  const handleGenerate = async (mode: "generate" | "regenerate" | "retry" = "generate", parentId?: string) => {
    if (!selectedType || !prompt.trim()) { toast.error("Select a video type and describe your video."); return; }
    setStep("generating");
    setProgressEvents(["Sending request..."]);
    try {
      const res = await fetch("/api/video-studio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt, videoType: selectedType, style, aspectRatio, duration,
          mood, cameraMove, options, sceneCount, mode, parentGenerationId: parentId,
        }),
      });
      const d = await res.json();
      if (!res.ok) { toast.error(d.error ?? "Generation failed"); setStep("config"); return; }
      toast.success(d.message ?? "Video project created!");
      if (d.generation) { setPreviewGen(d.generation); setStep("preview"); } else { setStep("history"); }
    } catch { toast.error("Request failed."); setStep("config"); }
  };

  const handleRegenerate = (gen: VideoGeneration) => {
    setSelectedType(gen.video_type); setPrompt(gen.prompt); setStyle(gen.style);
    setAspectRatio(gen.aspect_ratio); setDuration(gen.duration); setMood("Professional");
    setOptions(gen.options ?? []);
    handleGenerate("regenerate", gen.id);
  };

  const handleFavorite = async (gen: VideoGeneration) => {
    const next = !gen.is_favorite;
    setGenerations((p) => p.map((g) => g.id === gen.id ? { ...g, is_favorite: next } : g));
    await fetch(`/api/video-studio/${gen.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ is_favorite: next }) });
  };

  const handleDelete = async (id: string) => {
    setGenerations((p) => p.filter((g) => g.id !== id));
    await fetch(`/api/video-studio/${id}`, { method: "DELETE" });
    toast.success("Deleted");
  };

  if (step === "preview" && previewGen) {
    return <VideoPreview gen={previewGen} onBack={() => { setPreviewGen(null); setStep("history"); fetchGenerations(); }} />;
  }

  if (step === "generating") {
    return <GenerationProgress title="Creating your video project..." subtitle="AI is building storyboard, script, scenes, and audio direction" events={progressEvents} />;
  }

  const optionsByCategory = VIDEO_OPTION_LIST.reduce<Record<string, typeof VIDEO_OPTION_LIST>>((acc, o) => {
    if (!acc[o.category]) acc[o.category] = [];
    acc[o.category].push(o);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {([{ key: "type" as const, label: "New Video" }, { key: "history" as const, label: "My Videos" }]).map(({ key, label }) => (
          <button key={key} onClick={() => setStep(key)} className={cn("rounded-xl px-4 py-2 text-sm font-medium transition-all", step === key || (step === "config" && key === "type") ? "bg-premium-gold/15 text-premium-gold-light" : "text-white/50 hover:bg-white/5 hover:text-white/70")}>{label}</button>
        ))}
      </div>

      {step === "type" && (
        <DashboardCard>
          <DashboardCardHeader>
            <DashboardCardTitle>Choose Video Type</DashboardCardTitle>
            <DashboardCardDescription>Select the type of video you want to produce</DashboardCardDescription>
          </DashboardCardHeader>
          <DashboardCardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {VIDEO_TYPES.map((def) => <TypeSelectorCard key={def.id} def={def} selected={selectedType === def.id} onSelect={() => handleSelectType(def.id)} />)}
            </div>
            {selectedType && (
              <div className="mt-6 flex justify-end">
                <Button onClick={() => setStep("config")} className="btn-gold gap-2 rounded-xl font-bold text-luxury-black">Configure Video <ArrowRight className="size-4" /></Button>
              </div>
            )}
          </DashboardCardContent>
        </DashboardCard>
      )}

      {step === "config" && (
        <DashboardCard>
          <DashboardCardHeader>
            <div className="flex items-center gap-3">
              {(() => { const def = getVideoType(selectedType); const Icon = def?.icon ?? Sparkles; return (<>
                <div className="flex size-10 items-center justify-center rounded-xl bg-premium-gold/15 text-premium-gold-light"><Icon className="size-5" /></div>
                <div><DashboardCardTitle>{def?.label ?? "Custom"} Video</DashboardCardTitle><DashboardCardDescription>Describe your video and configure production settings</DashboardCardDescription></div>
              </>); })()}
            </div>
          </DashboardCardHeader>
          <DashboardCardContent>
            <div className="space-y-5">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/60">Video description *</label>
                <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Describe your video — concept, story, key scenes, messaging, visual direction..." rows={4} className={cn(dashboardInputClass, "min-h-[100px] resize-none")} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">Style</label>
                  <select value={style} onChange={(e) => setStyle(e.target.value)} className={dashboardSelectClass}>
                    {VIDEO_STYLES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">Aspect Ratio</label>
                  <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)} className={dashboardSelectClass}>
                    {VIDEO_ASPECT_RATIOS.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">Duration</label>
                  <select value={duration} onChange={(e) => setDuration(e.target.value)} className={dashboardSelectClass}>
                    {VIDEO_DURATIONS.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">Mood</label>
                  <select value={mood} onChange={(e) => setMood(e.target.value)} className={dashboardSelectClass}>
                    {VIDEO_MOODS.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">Camera Movement</label>
                  <select value={cameraMove} onChange={(e) => setCameraMove(e.target.value)} className={dashboardSelectClass}>
                    {VIDEO_CAMERA_MOVES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">Number of scenes</label>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon-xs" className="border-white/10 text-white/40" onClick={() => setSceneCount((c) => Math.max(1, c - 1))} disabled={sceneCount <= 1}><Minus className="size-3" /></Button>
                    <span className="min-w-[2ch] text-center text-sm font-bold text-white">{sceneCount}</span>
                    <Button variant="outline" size="icon-xs" className="border-white/10 text-white/40" onClick={() => setSceneCount((c) => Math.min(8, c + 1))} disabled={sceneCount >= 8}><Plus className="size-3" /></Button>
                    <span className="text-xs text-white/30">Max 8</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-medium text-white/60">Production Options</label>
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
                <Button variant="outline" className="rounded-xl border-white/10 text-white/60 hover:border-white/20" onClick={() => setStep("type")}>Back</Button>
                <Button onClick={() => handleGenerate()} disabled={!prompt.trim()} className="btn-gold gap-2 rounded-xl font-bold text-luxury-black">
                  <Sparkles className="size-4" /> Generate Video Project
                </Button>
              </div>
            </div>
          </DashboardCardContent>
        </DashboardCard>
      )}

      {step === "history" && (
        <>
          <div className="flex items-center gap-3">
            <div className="relative flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/30" /><Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search videos..." className={cn(dashboardInputClass, "pl-10")} /></div>
            <span className="text-xs text-white/40">{total} video{total !== 1 ? "s" : ""}</span>
          </div>
          {generations.length === 0 ? (
            <EmptyHistory noun="video projects" onNew={() => setStep("type")} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {generations.map((gen) => {
                const def = getVideoType(gen.video_type);
                return (
                  <ProjectHistoryCard key={gen.id} item={toHistoryItem(gen)} icon={def?.icon ?? Film}
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

"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Film,
  Play,
  RefreshCw,
  Save,
  Sparkles,
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
} from "@/components/dashboard/ui/dashboard-card";
import { dashboardInputClass } from "@/components/dashboard/ui/dashboard-styles";
import { cn } from "@/lib/utils";
import type { VideoProductionModel } from "@/lib/ai-core/video-production-platform/types";
import type { VideoVersionHistory } from "@/lib/ai-core/video-production-platform/versions";
import type { VideoQualityReport } from "@/lib/ai-core/video-production-platform/types";

type Tab =
  | "overview"
  | "timeline"
  | "preview"
  | "presenter"
  | "brand"
  | "audio"
  | "export"
  | "media"
  | "quality"
  | "versions";

type ManagePayload = {
  model: VideoProductionModel;
  history: VideoVersionHistory;
  quality: VideoQualityReport;
  timeline: Array<{
    id: string;
    name: string;
    startSec: number;
    endSec: number;
    hasClip: boolean;
    durationSec?: number;
  }>;
  visualTimeline?: {
    totalSec: number;
    tracks: Array<{
      id: string;
      name: string;
      startSec: number;
      endSec: number;
      widthPct: number;
      offsetPct: number;
      hasClip: boolean;
      color: string;
    }>;
  };
  assembly: { totalSec: number; chapters: number; scenes: number; steps: string[] };
  latestJob: {
    status: string;
    completedClips: number;
    totalClips: number;
    hasPreview: boolean;
  } | null;
  job?: {
    id: string;
    message: string;
    status?: string;
    progress?: number;
    costCreditsSpent?: number;
    costCreditsEstimate?: number;
    attemptCount?: number;
    assemblyManifest?: { method: string; note: string };
    compositeAsset?: { url: string; posterUrl?: string; mimeType?: string };
    clips: Array<{
      id: string;
      sceneId: string;
      status: string;
      asset?: { url: string; posterUrl?: string; mimeType?: string };
    }>;
  };
};

export function VideoManagementDashboard({ generationId }: { generationId: string }) {
  const [tab, setTab] = useState<Tab>("overview");
  const [data, setData] = useState<ManagePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [brandName, setBrandName] = useState("");
  const [primary, setPrimary] = useState("#D4AF37");
  const [scriptSceneId, setScriptSceneId] = useState<string | null>(null);
  const [scriptText, setScriptText] = useState("");
  const [media, setMedia] = useState<
    Array<{
      id: string;
      kind: string;
      mime_type: string;
      public_url: string | null;
      storage_path: string;
      provider: string;
      created_at: string;
    }>
  >([]);
  const [socialExport, setSocialExport] = useState<{
    preset: { id: string; label: string; aspectRatio: string; quality: string };
    videoUrl: string | null;
    captionsVtt: string;
    checklist: string[];
    publishReady?: boolean;
    warnings?: string[];
    hashtags?: string[];
  } | null>(null);
  const [dragSceneId, setDragSceneId] = useState<string | null>(null);
  const [ffmpegStatus, setFfmpegStatus] = useState<string | null>(null);
  const [healthSummary, setHealthSummary] = useState<string | null>(null);

  const processQueue = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/video-studio/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullQueue: true, retryFailed: true, limit: 10 }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Queue processing failed");
        return;
      }
      toast.success(json.message ?? "Queue processed");
      await load();
    } catch {
      toast.error("Queue processing failed");
    } finally {
      setBusy(false);
    }
  };
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [res, mediaRes] = await Promise.all([
        fetch(`/api/video-studio/${generationId}/manage`),
        fetch(`/api/video-studio/${generationId}/media`),
      ]);
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Failed to load");
        return;
      }
      setData(json);
      setBrandName(json.model.brand?.businessName || json.model.title);
      setPrimary(json.model.brand?.primary || "#D4AF37");
      if (json.model.scenes[0]) {
        setScriptSceneId(json.model.scenes[0].id);
        setScriptText(json.model.scenes[0].script);
      }
      if (mediaRes.ok) {
        const mediaJson = await mediaRes.json();
        setMedia(mediaJson.media ?? []);
      }
    } catch {
      toast.error("Failed to load video management");
    } finally {
      setLoading(false);
    }
  }, [generationId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/video-studio/health");
        if (!res.ok) return;
        const json = await res.json();
        setFfmpegStatus(
          json.ffmpeg?.available
            ? `FFmpeg ready · ${json.ffmpeg.version || "ok"}`
            : "FFmpeg missing — multi-scene merge limited",
        );
        const dbOk = json.database?.videoMedia && json.database?.videoRenderJobs;
        const providerOk = json.videoProviderConfigured;
        const ttsOk = json.tts?.configured;
        setHealthSummary(
          [
            dbOk ? "DB ok" : "DB: apply 044",
            providerOk ? `Provider: ${json.preferredProvider}` : "No video API key",
            ttsOk ? `TTS: ${json.tts?.provider}` : "TTS preview",
            json.strictMode ? "Strict" : "Stub allowed",
          ].join(" · "),
        );
      } catch {
        /* ignore */
      }
    })();
  }, []);

  const post = async (body: Record<string, unknown>) => {
    setBusy(true);
    try {
      const res = await fetch(`/api/video-studio/${generationId}/manage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Action failed");
        return;
      }
      toast.success(json.message ?? "Updated");
      if (json.socialExport) setSocialExport(json.socialExport);
      setData((prev) =>
        prev
          ? {
              ...prev,
              model: json.model,
              history: json.history ?? prev.history,
              quality: json.quality ?? prev.quality,
              timeline: json.timeline ?? prev.timeline,
              visualTimeline: json.visualTimeline ?? prev.visualTimeline,
              assembly: json.assembly ?? prev.assembly,
              latestJob: json.latestJob ?? prev.latestJob,
              job: json.job ?? prev.job,
            }
          : prev,
      );
      // Refresh media library after render / TTS
      if (
        body.action === "render" ||
        body.action === "synthesize_voice" ||
        body.action === "generate_avatar"
      ) {
        const mediaRes = await fetch(`/api/video-studio/${generationId}/media`);
        if (mediaRes.ok) {
          const mediaJson = await mediaRes.json();
          setMedia(mediaJson.media ?? []);
        }
      }
    } catch {
      toast.error("Request failed");
    } finally {
      setBusy(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-white/50">
        Loading video production studio…
      </div>
    );
  }

  const { model, quality, timeline, assembly, latestJob, job, history } = data;
  const tabs: Array<{ id: Tab; label: string }> = [
    { id: "overview", label: "Overview" },
    { id: "timeline", label: "Timeline" },
    { id: "preview", label: "Preview / Render" },
    { id: "presenter", label: "Presenter" },
    { id: "brand", label: "Brand" },
    { id: "audio", label: "Voice & Audio" },
    { id: "export", label: "Social Export" },
    { id: "media", label: "Media" },
    { id: "quality", label: "Quality" },
    { id: "versions", label: "Versions" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" className="rounded-xl border-white/10 text-white/70">
            <Link href="/dashboard/video-studio">
              <ArrowLeft className="mr-2 size-4" /> Back
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-white">{model.title}</h1>
            <p className="text-xs text-white/45">
              {model.templateId || model.videoType} · {model.durationTier} ·{" "}
              {model.targetDurationSec}s · v{model.version}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="rounded-xl border-white/10" onClick={() => void load()} disabled={busy}>
            <RefreshCw className="mr-2 size-4" /> Refresh
          </Button>
          <Button
            className="btn-gold rounded-xl font-bold text-luxury-black"
            disabled={busy}
            onClick={() => void post({ action: "render", mode: "preview" })}
          >
            <Play className="mr-2 size-4" /> Preview render
          </Button>
          <Button
            className="rounded-xl bg-white/10 font-semibold text-white hover:bg-white/15"
            disabled={busy}
            onClick={() => void post({ action: "render", mode: "full" })}
          >
            <Film className="mr-2 size-4" /> Full MP4 render
          </Button>
          <Button
            variant="outline"
            className="rounded-xl border-white/10"
            disabled={busy}
            onClick={() => void processQueue()}
          >
            Process queue
          </Button>
          <Button
            variant="outline"
            className="rounded-xl border-white/10"
            disabled={busy}
            onClick={() => void post({ action: "resume_render" })}
          >
            Resume job
          </Button>
          <Button
            variant="outline"
            className="rounded-xl border-white/10"
            disabled={busy}
            onClick={() => void post({ action: "retry_clips" })}
          >
            Retry failed
          </Button>
          <Button
            variant="outline"
            className="rounded-xl border-white/10"
            disabled={busy}
            onClick={() => void post({ action: "synthesize_voice", real: true })}
          >
            <Sparkles className="mr-2 size-4" /> Real TTS
          </Button>
          <Button
            variant="outline"
            className="rounded-xl border-white/10"
            disabled={busy}
            onClick={() => void post({ action: "export_social", presetId: "tiktok" })}
          >
            Export TikTok
          </Button>
          <Button
            variant="outline"
            className="rounded-xl border-white/10"
            disabled={busy}
            onClick={() => void post({ action: "save_version", note: "Manual checkpoint" })}
          >
            <Save className="mr-2 size-4" /> Save version
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "rounded-xl px-3 py-1.5 text-xs font-medium transition-all",
              tab === t.id
                ? "bg-premium-gold/15 text-premium-gold-light"
                : "text-white/45 hover:bg-white/5 hover:text-white/70",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid gap-4 lg:grid-cols-3">
          <DashboardCard className="lg:col-span-2">
            <DashboardCardHeader>
              <DashboardCardTitle>Production model</DashboardCardTitle>
              <DashboardCardDescription>
                Structured video project — editable without regenerating from scratch
              </DashboardCardDescription>
            </DashboardCardHeader>
            <DashboardCardContent className="grid gap-2 sm:grid-cols-4 text-sm">
              {[
                ["Scenes", model.scenes.length],
                ["Chapters", model.chapters.length],
                ["Assets", model.assets.length],
                ["Jobs", model.jobs.length],
              ].map(([l, v]) => (
                <div key={String(l)} className="rounded-xl bg-white/5 p-3">
                  <div className="text-lg font-semibold text-white">{v}</div>
                  <div className="text-xs text-white/40">{l}</div>
                </div>
              ))}
              <div className="sm:col-span-4 text-xs text-white/50">
                Presenter: {model.presenter?.displayName || "—"} · Location:{" "}
                {model.locationId || "—"} · Content: {model.contentTypeId || "—"}
              </div>
              <div className="sm:col-span-4 text-xs text-white/40">
                Assembly: {assembly.steps.join(" → ")}
              </div>
            </DashboardCardContent>
          </DashboardCard>
          <DashboardCard>
            <DashboardCardHeader>
              <DashboardCardTitle>Quality · {quality.score}</DashboardCardTitle>
            </DashboardCardHeader>
            <DashboardCardContent className="text-sm text-white/60">
              <p>{quality.summary}</p>
              <p className="mt-2 text-xs text-white/40">
                Render: {latestJob?.status || "none"} ·{" "}
                {latestJob
                  ? `${latestJob.completedClips}/${latestJob.totalClips} clips`
                  : "—"}
              </p>
            </DashboardCardContent>
          </DashboardCard>
        </div>
      )}

      {tab === "timeline" && (
        <DashboardCard>
          <DashboardCardHeader>
            <DashboardCardTitle>Professional timeline</DashboardCardTitle>
            <DashboardCardDescription>
              Visual track · trim · reorder · replace scene / voice / music
            </DashboardCardDescription>
          </DashboardCardHeader>
          <DashboardCardContent className="space-y-4">
            {data.visualTimeline && (
              <div className="space-y-2 rounded-xl bg-black/40 p-3">
                <div className="flex justify-between text-[10px] uppercase tracking-wide text-white/40">
                  <span>0s</span>
                  <span>{data.visualTimeline.totalSec}s</span>
                </div>
                <div className="relative h-14 w-full overflow-hidden rounded-lg bg-white/5">
                  {data.visualTimeline.tracks.map((tr) => (
                    <button
                      key={tr.id}
                      type="button"
                      title={`${tr.name} (${tr.startSec}–${tr.endSec}s)`}
                      onClick={() => {
                        const scene = model.scenes.find((s) => s.id === tr.id);
                        setScriptSceneId(tr.id);
                        setScriptText(scene?.script || "");
                      }}
                      className="absolute top-2 h-10 rounded-md border border-white/10 px-1 text-[10px] font-medium text-black/80 transition hover:brightness-110"
                      style={{
                        left: `${tr.offsetPct}%`,
                        width: `${tr.widthPct}%`,
                        background: tr.color,
                        opacity: tr.hasClip ? 1 : 0.55,
                      }}
                    >
                      <span className="block truncate">{tr.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <p className="text-xs text-white/40">
              {ffmpegStatus || "Checking assembly tooling…"}
            </p>
            {healthSummary ? (
              <p className="text-xs text-white/35">{healthSummary}</p>
            ) : null}
            <div className="space-y-2">
              {timeline.map((t) => (
                <div
                  key={t.id}
                  draggable
                  onDragStart={() => setDragSceneId(t.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (!dragSceneId || dragSceneId === t.id) return;
                    const ordered = timeline.map((x) => x.id);
                    const from = ordered.indexOf(dragSceneId);
                    const to = ordered.indexOf(t.id);
                    if (from < 0 || to < 0) return;
                    ordered.splice(from, 1);
                    ordered.splice(to, 0, dragSceneId);
                    setDragSceneId(null);
                    void post({ action: "reorder_scenes", sceneIds: ordered });
                  }}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white/5 px-3 py-2 text-sm cursor-grab active:cursor-grabbing"
                >
                  <div>
                    <div className="font-medium text-white">{t.name}</div>
                    <div className="text-xs text-white/40">
                      {t.startSec}s – {t.endSec}s · {t.hasClip ? "clip ready" : "no clip"}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-lg border-white/10"
                      disabled={busy}
                      onClick={() =>
                        void post({
                          action: "nudge_scene",
                          sceneId: t.id,
                          direction: "left",
                        })
                      }
                    >
                      ←
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-lg border-white/10"
                      disabled={busy}
                      onClick={() =>
                        void post({
                          action: "nudge_scene",
                          sceneId: t.id,
                          direction: "right",
                        })
                      }
                    >
                      →
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-lg border-white/10"
                      onClick={() => {
                        const scene = model.scenes.find((s) => s.id === t.id);
                        setScriptSceneId(t.id);
                        setScriptText(scene?.script || "");
                      }}
                    >
                      Edit script
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-lg border-white/10"
                      disabled={busy}
                      onClick={() =>
                        void post({
                          action: "trim_scene",
                          sceneId: t.id,
                          durationSec: Math.max(2, Math.round((t.endSec - t.startSec) * 0.75)),
                        })
                      }
                    >
                      Trim −25%
                    </Button>
                    <Input
                      type="number"
                      min={1}
                      max={600}
                      defaultValue={Math.round(t.endSec - t.startSec)}
                      className={cn(dashboardInputClass, "h-8 w-16 text-xs")}
                      title="Trim to seconds"
                      onBlur={(e) => {
                        const n = Number(e.target.value);
                        if (!Number.isFinite(n) || n < 1) return;
                        void post({
                          action: "trim_scene",
                          sceneId: t.id,
                          durationSec: n,
                        });
                      }}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-lg border-white/10"
                      disabled={busy}
                      onClick={() => {
                        const scene = model.scenes.find((s) => s.id === t.id);
                        void post({
                          action: "replace_visual",
                          sceneId: t.id,
                          visualPrompt: `${scene?.visualPrompt || t.name} — refreshed camera motion and lighting`,
                        });
                      }}
                    >
                      Replace visual
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            {scriptSceneId && (
              <div className="space-y-2">
                <Textarea
                  value={scriptText}
                  onChange={(e) => setScriptText(e.target.value)}
                  className={cn(dashboardInputClass, "min-h-[100px]")}
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    className="btn-gold rounded-xl font-bold text-luxury-black"
                    disabled={busy}
                    onClick={() =>
                      void post({
                        action: "update_script",
                        sceneId: scriptSceneId,
                        script: scriptText,
                      })
                    }
                  >
                    Save script
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-xl border-white/10"
                    disabled={busy}
                    onClick={() =>
                      void post({
                        action: "replace_music",
                        name: "Cinematic Pulse",
                        genre: "Electronic",
                        mood: "Uplifting",
                        bpm: "110",
                      })
                    }
                  >
                    Replace music
                  </Button>
                </div>
              </div>
            )}
            <Button
              variant="outline"
              className="rounded-xl border-white/10"
              disabled={busy}
              onClick={() =>
                void post({
                  action: "reorder_scenes",
                  sceneIds: [...model.scenes]
                    .sort((a, b) => a.order - b.order)
                    .reverse()
                    .map((s) => s.id),
                })
              }
            >
              Reverse scene order (demo)
            </Button>
          </DashboardCardContent>
        </DashboardCard>
      )}

      {tab === "preview" && (
        <DashboardCard>
          <DashboardCardHeader>
            <DashboardCardTitle>Render preview</DashboardCardTitle>
            <DashboardCardDescription>
              {job?.message || "Run a preview render to generate clip posters from storyboards."}
            </DashboardCardDescription>
          </DashboardCardHeader>
          <DashboardCardContent className="space-y-4">
            <Button
              className="btn-gold rounded-xl font-bold text-luxury-black"
              disabled={busy}
              onClick={() => void post({ action: "render", mode: "preview" })}
            >
              <Film className="mr-2 size-4" /> Preview render
            </Button>
            <Button
              className="rounded-xl bg-white/10 text-white"
              disabled={busy}
              onClick={() => void post({ action: "render", mode: "full" })}
            >
              Full MP4 / WebM render
            </Button>
            <Button
              variant="outline"
              className="rounded-xl border-white/10"
              disabled={busy}
              onClick={() =>
                void post({
                  action: "render",
                  mode: "avatar",
                  useAvatar: true,
                })
              }
            >
              Avatar render
            </Button>
            <Button
              variant="outline"
              className="rounded-xl border-white/10"
              disabled={busy}
              onClick={() => void post({ action: "resume_render" })}
            >
              Resume async jobs
            </Button>
            <Button
              variant="outline"
              className="rounded-xl border-white/10"
              disabled={busy}
              onClick={() => void post({ action: "retry_clips" })}
            >
              Retry failed clips
            </Button>
            {job?.compositeAsset?.url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={job.compositeAsset.posterUrl || job.compositeAsset.url}
                alt="Composite preview"
                className="max-h-72 w-full rounded-xl object-contain bg-black/40"
              />
            )}
            {job?.compositeAsset?.url &&
            (/\.(mp4|webm)(\?|$)/i.test(job.compositeAsset.url) ||
              job.compositeAsset.mimeType?.includes("video")) ? (
              <video
                src={job.compositeAsset.url}
                controls
                className="max-h-72 w-full rounded-xl bg-black"
              />
            ) : null}
            {job && (
              <p className="text-xs text-white/45">
                {job.status || "—"} · {job.progress ?? 0}% · cost {job.costCreditsSpent ?? 0}/
                {job.costCreditsEstimate ?? "?"} · attempts {job.attemptCount ?? 1}
                {job.assemblyManifest
                  ? ` · assembly ${job.assemblyManifest.method}`
                  : ""}
              </p>
            )}
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {(job?.clips || []).map((c) =>
                c.asset?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={c.id}
                    src={c.asset.posterUrl || c.asset.url}
                    alt={c.sceneId}
                    className="h-36 w-full rounded-xl object-cover bg-black/40"
                  />
                ) : (
                  <div
                    key={c.id}
                    className="flex h-36 items-center justify-center rounded-xl bg-white/5 text-xs text-white/40"
                  >
                    {c.status}
                  </div>
                ),
              )}
            </div>
          </DashboardCardContent>
        </DashboardCard>
      )}

      {tab === "presenter" && (
        <DashboardCard>
          <DashboardCardHeader>
            <DashboardCardTitle>AI Human Presenter</DashboardCardTitle>
            <DashboardCardDescription>
              {model.presenter?.appearance}
            </DashboardCardDescription>
          </DashboardCardHeader>
          <DashboardCardContent className="space-y-3 text-sm text-white/60">
            <p>Lip sync: {model.presenter?.lipSyncProfile}</p>
            <p>Body: {model.presenter?.bodyMotionStyle}</p>
            <p>
              Voice: {model.presenter?.voiceStyle} · Languages:{" "}
              {model.presenter?.languages.slice(0, 4).join(", ")}
            </p>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  "teacher",
                  "doctor",
                  "fitness-trainer",
                  "business-expert",
                  "sales-representative",
                  "chef",
                ] as const
              ).map((id) => (
                <Button
                  key={id}
                  size="sm"
                  variant="outline"
                  className="rounded-lg border-white/10"
                  disabled={busy}
                  onClick={() => void post({ action: "change_presenter", personaId: id })}
                >
                  {id}
                </Button>
              ))}
            </div>
            <Button
              className="btn-gold rounded-xl font-bold text-luxury-black"
              disabled={busy}
              onClick={() =>
                void post({
                  action: "generate_avatar",
                  personaId: model.presenter?.personaId || "business-expert",
                })
              }
            >
              Generate real avatar clip
            </Button>
          </DashboardCardContent>
        </DashboardCard>
      )}

      {tab === "export" && (
        <DashboardCard>
          <DashboardCardHeader>
            <DashboardCardTitle>Social media export</DashboardCardTitle>
            <DashboardCardDescription>
              Aspect ratios, quality presets, and caption packages
            </DashboardCardDescription>
          </DashboardCardHeader>
          <DashboardCardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["tiktok", "TikTok"],
                  ["instagram-reels", "Instagram Reels"],
                  ["youtube-shorts", "YouTube Shorts"],
                  ["youtube", "YouTube"],
                  ["linkedin", "LinkedIn"],
                ] as const
              ).map(([id, label]) => (
                <Button
                  key={id}
                  variant="outline"
                  className="rounded-xl border-white/10"
                  disabled={busy}
                  onClick={() => void post({ action: "export_social", presetId: id })}
                >
                  {label}
                </Button>
              ))}
            </div>
            {socialExport && (
              <div className="space-y-2 rounded-xl bg-white/5 p-3 text-sm text-white/70">
                <div className="font-medium text-white">
                  {socialExport.preset.label} · {socialExport.preset.aspectRatio} ·{" "}
                  {socialExport.preset.quality}
                  {socialExport.publishReady ? " · publish-ready" : ""}
                </div>
                <ul className="list-inside list-disc text-xs text-white/50">
                  {socialExport.checklist.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
                {socialExport.warnings && socialExport.warnings.length > 0 && (
                  <ul className="list-inside list-disc text-xs text-amber-200/70">
                    {socialExport.warnings.map((w) => (
                      <li key={w}>{w}</li>
                    ))}
                  </ul>
                )}
                {socialExport.hashtags && (
                  <p className="text-xs text-white/40">{socialExport.hashtags.join(" ")}</p>
                )}
                {socialExport.captionsVtt && (
                  <details className="text-xs text-white/40">
                    <summary className="cursor-pointer text-white/60">Captions VTT</summary>
                    <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap rounded bg-black/30 p-2">
                      {socialExport.captionsVtt.slice(0, 1200)}
                    </pre>
                  </details>
                )}
                {socialExport.videoUrl && (
                  <a
                    href={socialExport.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-premium-gold-light underline"
                  >
                    Open video asset
                  </a>
                )}
              </div>
            )}
          </DashboardCardContent>
        </DashboardCard>
      )}

      {tab === "media" && (
        <DashboardCard>
          <DashboardCardHeader>
            <DashboardCardTitle>Media library</DashboardCardTitle>
            <DashboardCardDescription>
              Stored clips, audio, and thumbnails (not JSONB-only)
            </DashboardCardDescription>
          </DashboardCardHeader>
          <DashboardCardContent className="space-y-2">
            {media.length === 0 ? (
              <p className="text-sm text-white/40">
                No media yet. Run Full MP4 render or Real TTS.
              </p>
            ) : (
              media.map((m) => (
                <div
                  key={m.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white/5 px-3 py-2 text-xs text-white/60"
                >
                  <div>
                    <div className="font-medium text-white">
                      {m.kind} · {m.mime_type}
                    </div>
                    <div className="opacity-70">
                      {m.provider} · {new Date(m.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {m.public_url ? (
                      <a
                        href={m.public_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-premium-gold-light underline"
                      >
                        Preview
                      </a>
                    ) : (
                      <button
                        type="button"
                        className="underline opacity-70"
                        onClick={async () => {
                          const res = await fetch(
                            `/api/video-studio/${generationId}/media?mediaId=${encodeURIComponent(m.id)}`,
                          );
                          const json = await res.json();
                          if (json.previewUrl) window.open(json.previewUrl, "_blank");
                          else toast.error("No preview URL");
                        }}
                      >
                        Sign URL
                      </button>
                    )}
                    <button
                      type="button"
                      className="text-red-300/80 underline"
                      disabled={busy}
                      onClick={async () => {
                        setBusy(true);
                        try {
                          const res = await fetch(
                            `/api/video-studio/${generationId}/media`,
                            {
                              method: "DELETE",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ mediaId: m.id }),
                            },
                          );
                          const json = await res.json();
                          if (!res.ok) {
                            toast.error(json.error ?? "Delete failed");
                            return;
                          }
                          toast.success("Media deleted");
                          setMedia((prev) => prev.filter((x) => x.id !== m.id));
                        } finally {
                          setBusy(false);
                        }
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </DashboardCardContent>
        </DashboardCard>
      )}

      {tab === "brand" && (
        <DashboardCard>
          <DashboardCardHeader>
            <DashboardCardTitle>Brand integration</DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent className="space-y-3">
            <Input
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="Business name"
              className={dashboardInputClass}
            />
            <Input
              value={primary}
              onChange={(e) => setPrimary(e.target.value)}
              placeholder="Primary color"
              className={dashboardInputClass}
            />
            <Button
              className="btn-gold rounded-xl font-bold text-luxury-black"
              disabled={busy}
              onClick={() =>
                void post({
                  action: "apply_brand",
                  businessName: brandName,
                  primary,
                  accent: primary,
                })
              }
            >
              Apply brand
            </Button>
          </DashboardCardContent>
        </DashboardCard>
      )}

      {tab === "audio" && (
        <DashboardCard>
          <DashboardCardHeader>
            <DashboardCardTitle>Voice & audio</DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent className="space-y-3 text-sm text-white/60">
            {model.voiceTracks.map((v) => (
              <div key={v.id} className="rounded-xl bg-white/5 p-3">
                {v.style} · {v.language} · {v.status}
              </div>
            ))}
            {model.audioBeds.map((b) => (
              <div key={b.id} className="rounded-xl bg-white/5 p-3">
                {b.kind}: {b.name} · {b.status}
              </div>
            ))}
            <div className="flex flex-wrap gap-2">
              <Button
                className="btn-gold rounded-xl font-bold text-luxury-black"
                disabled={busy}
                onClick={() => void post({ action: "synthesize_voice" })}
              >
                <Sparkles className="mr-2 size-4" /> Synthesize voice preview
              </Button>
              <Button
                variant="outline"
                className="rounded-xl border-white/10"
                disabled={busy}
                onClick={() => void post({ action: "synthesize_voice", real: true })}
              >
                Real TTS
              </Button>
              <Button
                variant="outline"
                className="rounded-xl border-white/10"
                disabled={busy}
                onClick={() => void post({ action: "rebuild_subtitles" })}
              >
                Rebuild subtitles
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  "Natural conversational",
                  "Motivational energetic",
                  "Calm authoritative",
                  "Clear instructional",
                  "Persuasive warm",
                ] as const
              ).map((style) => (
                <Button
                  key={style}
                  size="sm"
                  variant="outline"
                  className="rounded-lg border-white/10"
                  disabled={busy}
                  onClick={() => void post({ action: "change_voice", style })}
                >
                  {style}
                </Button>
              ))}
            </div>
            {scriptSceneId && (
              <div className="space-y-2">
                <label className="text-xs text-white/45">Subtitle cue editor (one line = one cue)</label>
                <Textarea
                  value={model.subtitles.map((s) => s.text).join("\n")}
                  onChange={(e) => {
                    /* local edit via save button below */
                    setScriptText(e.target.value);
                  }}
                  placeholder="Cue lines…"
                  className={cn(dashboardInputClass, "min-h-[80px]")}
                />
                <Button
                  variant="outline"
                  className="rounded-xl border-white/10"
                  disabled={busy}
                  onClick={() =>
                    void post({
                      action: "update_subtitles",
                      subtitles: scriptText
                        .split("\n")
                        .map((t) => t.trim())
                        .filter(Boolean)
                        .map((text, i) => ({
                          timestamp: `${i * 3}s`,
                          text,
                          startSec: i * 3,
                          endSec: i * 3 + 3,
                        })),
                    })
                  }
                >
                  Save subtitle cues
                </Button>
              </div>
            )}
          </DashboardCardContent>
        </DashboardCard>
      )}

      {tab === "quality" && (
        <DashboardCard>
          <DashboardCardHeader>
            <DashboardCardTitle>Quality system</DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent className="space-y-2">
            {quality.checks.map((c) => (
              <div
                key={c.id}
                className={cn(
                  "rounded-xl px-3 py-2 text-xs",
                  c.passed ? "bg-emerald-500/10 text-emerald-200/80" : "bg-amber-500/10 text-amber-100/80",
                )}
              >
                <div className="font-medium">
                  {c.passed ? "✓" : "!"} {c.label}
                </div>
                <div className="opacity-80">{c.detail}</div>
              </div>
            ))}
          </DashboardCardContent>
        </DashboardCard>
      )}

      {tab === "versions" && (
        <DashboardCard>
          <DashboardCardHeader>
            <DashboardCardTitle>Version control</DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent className="space-y-2">
            {history.versions.length === 0 ? (
              <p className="text-sm text-white/40">No versions yet.</p>
            ) : (
              history.versions.map((v) => (
                <div
                  key={v.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white/5 px-3 py-2"
                >
                  <div>
                    <div className="text-sm text-white">{v.label}</div>
                    <div className="text-xs text-white/40">
                      {new Date(v.createdAt).toLocaleString()} · {v.note || "—"}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-lg border-white/10"
                    disabled={busy}
                    onClick={() => void post({ action: "restore_version", versionId: v.id })}
                  >
                    Restore
                  </Button>
                </div>
              ))
            )}
          </DashboardCardContent>
        </DashboardCard>
      )}
    </div>
  );
}

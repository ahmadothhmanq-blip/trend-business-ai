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
import {
  VideoStudioProviderStatus,
  useVideoStudioFullRenderReady,
} from "@/components/dashboard/video-studio/video-studio-provider-status";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/client";
import { useProductT } from "@/lib/i18n/use-scoped-t";
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
  const { t } = useTranslation();
  const p = useProductT("videoStudio");
  const fullRenderGate = useVideoStudioFullRenderReady();
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
        toast.error(json.error ?? p("management.queueFailed"));
        return;
      }
      toast.success(json.message ?? p("management.queueProcessed"));
      await load();
    } catch {
      toast.error(p("management.queueFailed"));
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
        toast.error(json.error ?? p("errors.loadFailed"));
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
      toast.error(p("management.loadFailed"));
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
            ? p("management.ffmpegReady", { version: json.ffmpeg.version || "ok" })
            : p("management.ffmpegMissing"),
        );
        const dbOk = json.database?.videoMedia && json.database?.videoRenderJobs;
        const providerOk = json.videoProviderConfigured;
        const ttsOk = json.tts?.configured;
        setHealthSummary(
          [
            dbOk ? p("management.dbOk") : p("management.dbApply"),
            providerOk ? p("management.providerOk", { provider: json.preferredProvider }) : p("management.noVideoApiKey"),
            ttsOk ? p("management.ttsProvider", { provider: json.tts?.provider }) : p("management.ttsPreview"),
            json.strictMode ? p("management.strict") : p("management.stubAllowed"),
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
        toast.error(json.error ?? p("management.actionFailed"));
        return;
      }
      toast.success(json.message ?? p("management.updated"));
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
      toast.error(p("errors.requestFailed"));
    } finally {
      setBusy(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-white/50">
        {p("management.loading")}
      </div>
    );
  }

  const { model, quality, timeline, assembly, latestJob, job, history } = data;
  const tabs: Array<{ id: Tab; label: string }> = [
    { id: "overview", label: p("management.tabs.overview") },
    { id: "timeline", label: p("management.tabs.timeline") },
    { id: "preview", label: p("management.tabs.preview") },
    { id: "presenter", label: p("management.tabs.presenter") },
    { id: "brand", label: p("management.tabs.brand") },
    { id: "audio", label: p("management.tabs.audio") },
    { id: "export", label: p("management.tabs.export") },
    { id: "media", label: p("management.tabs.media") },
    { id: "quality", label: p("management.tabs.quality") },
    { id: "versions", label: p("management.tabs.versions") },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" className="rounded-xl border-white/10 text-white/70">
            <Link href="/dashboard/video-studio">
              <ArrowLeft className="mr-2 size-4" /> {t("common.back")}
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
            <RefreshCw className="mr-2 size-4" /> {p("management.refresh")}
          </Button>
          <Button
            className="btn-gold rounded-xl font-bold text-luxury-black"
            disabled={busy}
            onClick={() => void post({ action: "render", mode: "preview" })}
          >
            <Play className="mr-2 size-4" /> {p("management.previewRender")}
          </Button>
          <Button
            className="rounded-xl bg-white/10 font-semibold text-white hover:bg-white/15"
            disabled={busy || fullRenderGate.loading || !fullRenderGate.canFullRender}
            title={fullRenderGate.message || undefined}
            onClick={() => {
              if (!fullRenderGate.canFullRender) {
                toast.error(fullRenderGate.message || p("providerStatus.fullRenderBlocked"));
                return;
              }
              void post({ action: "render", mode: "full" });
            }}
          >
            <Film className="mr-2 size-4" /> {p("management.fullRender")}
          </Button>
          <Button
            variant="outline"
            className="rounded-xl border-white/10"
            disabled={busy}
            onClick={() => void processQueue()}
          >
            {p("management.processQueue")}
          </Button>
          <Button
            variant="outline"
            className="rounded-xl border-white/10"
            disabled={busy}
            onClick={() => void post({ action: "resume_render" })}
          >
            {p("management.resumeJob")}
          </Button>
          <Button
            variant="outline"
            className="rounded-xl border-white/10"
            disabled={busy}
            onClick={() => void post({ action: "retry_clips" })}
          >
            {p("management.retryFailed")}
          </Button>
          <Button
            variant="outline"
            className="rounded-xl border-white/10"
            disabled={busy}
            onClick={() => void post({ action: "synthesize_voice", real: true })}
          >
            <Sparkles className="mr-2 size-4" /> {p("management.realTts")}
          </Button>
          <Button
            variant="outline"
            className="rounded-xl border-white/10"
            disabled={busy}
            onClick={() => void post({ action: "export_social", presetId: "tiktok" })}
          >
            {p("management.exportTiktok")}
          </Button>
          <Button
            variant="outline"
            className="rounded-xl border-white/10"
            disabled={busy}
            onClick={() => void post({ action: "save_version", note: p("management.manualCheckpoint") })}
          >
            <Save className="mr-2 size-4" /> {p("management.saveVersion")}
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
          <div className="lg:col-span-3">
            <VideoStudioProviderStatus />
          </div>
          <DashboardCard className="lg:col-span-2">
            <DashboardCardHeader>
              <DashboardCardTitle>{p("management.productionModel")}</DashboardCardTitle>
              <DashboardCardDescription>
                {p("management.productionDescription")}
              </DashboardCardDescription>
            </DashboardCardHeader>
            <DashboardCardContent className="grid gap-2 sm:grid-cols-4 text-sm">
              {[
                [p("management.scenes"), model.scenes.length],
                [p("management.chapters"), model.chapters.length],
                [p("management.assets"), model.assets.length],
                [p("management.jobs"), model.jobs.length],
              ].map(([l, v]) => (
                <div key={String(l)} className="rounded-xl bg-white/5 p-3">
                  <div className="text-lg font-semibold text-white">{v}</div>
                  <div className="text-xs text-white/40">{l}</div>
                </div>
              ))}
              <div className="sm:col-span-4 text-xs text-white/50">
                {p("management.presenterLabel")}: {model.presenter?.displayName || "—"} · {p("management.locationLabel")}:{" "}
                {model.locationId || "—"} · {p("management.contentLabel")}: {model.contentTypeId || "—"}
              </div>
              <div className="sm:col-span-4 text-xs text-white/40">
                {p("management.assemblyLabel")}: {assembly.steps.join(" → ")}
              </div>
            </DashboardCardContent>
          </DashboardCard>
          <DashboardCard>
            <DashboardCardHeader>
              <DashboardCardTitle>{p("management.qualityTitle", { score: quality.score })}</DashboardCardTitle>
            </DashboardCardHeader>
            <DashboardCardContent className="text-sm text-white/60">
              <p>{quality.summary}</p>
              <p className="mt-2 text-xs text-white/40">
                {p("management.renderLabel")}: {latestJob?.status || "none"} ·{" "}
                {latestJob
                  ? p("management.clipsProgress", {
                      completed: latestJob.completedClips,
                      total: latestJob.totalClips,
                    })
                  : "—"}
              </p>
            </DashboardCardContent>
          </DashboardCard>
        </div>
      )}

      {tab === "timeline" && (
        <DashboardCard>
          <DashboardCardHeader>
            <DashboardCardTitle>{p("management.professionalTimeline")}</DashboardCardTitle>
            <DashboardCardDescription>
              {p("management.timelineDescription")}
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
              {ffmpegStatus || p("management.checkingTooling")}
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
                      {t.startSec}s – {t.endSec}s · {t.hasClip ? p("management.clipReady") : p("management.noClip")}
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
                      {p("management.editScript")}
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
                      {p("management.trim25")}
                    </Button>
                    <Input
                      type="number"
                      min={1}
                      max={600}
                      defaultValue={Math.round(t.endSec - t.startSec)}
                      className={cn(dashboardInputClass, "h-8 w-16 text-xs")}
                      title={p("management.trimToSeconds")}
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
                      {p("management.replaceVisual")}
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
                    {p("management.saveScript")}
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
                    {p("management.replaceMusic")}
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
              {p("management.reverseSceneOrder")}
            </Button>
          </DashboardCardContent>
        </DashboardCard>
      )}

      {tab === "preview" && (
        <DashboardCard>
          <DashboardCardHeader>
            <DashboardCardTitle>{p("management.renderPreview")}</DashboardCardTitle>
            <DashboardCardDescription>
              {job?.message || p("management.previewRenderHint")}
            </DashboardCardDescription>
          </DashboardCardHeader>
          <DashboardCardContent className="space-y-4">
            <Button
              className="btn-gold rounded-xl font-bold text-luxury-black"
              disabled={busy}
              onClick={() => void post({ action: "render", mode: "preview" })}
            >
              <Film className="mr-2 size-4" /> {p("management.previewRenderBtn")}
            </Button>
            <Button
              className="rounded-xl bg-white/10 text-white"
              disabled={busy || fullRenderGate.loading || !fullRenderGate.canFullRender}
              title={fullRenderGate.message || undefined}
              onClick={() => {
                if (!fullRenderGate.canFullRender) {
                  toast.error(fullRenderGate.message || p("providerStatus.fullRenderBlocked"));
                  return;
                }
                void post({ action: "render", mode: "full" });
              }}
            >
              {p("management.fullMp4Render")}
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
              {p("management.avatarRender")}
            </Button>
            <Button
              variant="outline"
              className="rounded-xl border-white/10"
              disabled={busy}
              onClick={() => void post({ action: "resume_render" })}
            >
              {p("management.resumeAsyncJobs")}
            </Button>
            <Button
              variant="outline"
              className="rounded-xl border-white/10"
              disabled={busy}
              onClick={() => void post({ action: "retry_clips" })}
            >
              {p("management.retryFailedClips")}
            </Button>
            {job?.compositeAsset?.url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={job.compositeAsset.posterUrl || job.compositeAsset.url}
                alt={p("management.compositePreview")}
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
            <DashboardCardTitle>{p("management.aiPresenter")}</DashboardCardTitle>
            <DashboardCardDescription>
              {model.presenter?.appearance}
            </DashboardCardDescription>
          </DashboardCardHeader>
          <DashboardCardContent className="space-y-3 text-sm text-white/60">
            <p>{p("management.lipSync")}: {model.presenter?.lipSyncProfile}</p>
            <p>{p("management.bodyLabel")}: {model.presenter?.bodyMotionStyle}</p>
            <p>
              {p("management.voiceLabel")}: {model.presenter?.voiceStyle} · {p("management.languagesLabel")}:{" "}
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
              {p("management.generateAvatarClip")}
            </Button>
          </DashboardCardContent>
        </DashboardCard>
      )}

      {tab === "export" && (
        <DashboardCard>
          <DashboardCardHeader>
            <DashboardCardTitle>{p("management.socialExportTitle")}</DashboardCardTitle>
            <DashboardCardDescription>
              {p("management.socialExportDescription")}
            </DashboardCardDescription>
          </DashboardCardHeader>
          <DashboardCardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["tiktok", p("management.platforms.tiktok")],
                  ["instagram-reels", p("management.platforms.instagramReels")],
                  ["youtube-shorts", p("management.platforms.youtubeShorts")],
                  ["youtube", p("management.platforms.youtube")],
                  ["linkedin", p("management.platforms.linkedin")],
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
                  {socialExport.publishReady ? p("management.publishReady") : ""}
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
                    <summary className="cursor-pointer text-white/60">{p("management.captionsVtt")}</summary>
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
                    {p("management.openVideoAsset")}
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
            <DashboardCardTitle>{p("management.mediaLibrary")}</DashboardCardTitle>
            <DashboardCardDescription>
              {p("management.mediaLibraryDescription")}
            </DashboardCardDescription>
          </DashboardCardHeader>
          <DashboardCardContent className="space-y-2">
            {media.length === 0 ? (
              <p className="text-sm text-white/40">
                {p("management.noMediaYet")}
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
                        {p("management.previewLink")}
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
                          else toast.error(p("management.noPreviewUrl"));
                        }}
                      >
                        {p("management.signUrl")}
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
                            toast.error(json.error ?? p("management.deleteFailed"));
                            return;
                          }
                          toast.success(p("management.mediaDeleted"));
                          setMedia((prev) => prev.filter((x) => x.id !== m.id));
                        } finally {
                          setBusy(false);
                        }
                      }}
                    >
                      {t("common.delete")}
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
            <DashboardCardTitle>{p("management.brandIntegration")}</DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent className="space-y-3">
            <Input
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder={p("placeholders.brandName")}
              className={dashboardInputClass}
            />
            <Input
              value={primary}
              onChange={(e) => setPrimary(e.target.value)}
              placeholder={p("placeholders.primaryColor")}
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
              {p("management.applyBrand")}
            </Button>
          </DashboardCardContent>
        </DashboardCard>
      )}

      {tab === "audio" && (
        <DashboardCard>
          <DashboardCardHeader>
            <DashboardCardTitle>{p("management.voiceAudio")}</DashboardCardTitle>
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
                <Sparkles className="mr-2 size-4" /> {p("management.synthesizeVoicePreview")}
              </Button>
              <Button
                variant="outline"
                className="rounded-xl border-white/10"
                disabled={busy}
                onClick={() => void post({ action: "synthesize_voice", real: true })}
              >
                {p("management.realTts")}
              </Button>
              <Button
                variant="outline"
                className="rounded-xl border-white/10"
                disabled={busy}
                onClick={() => void post({ action: "rebuild_subtitles" })}
              >
                {p("management.rebuildSubtitles")}
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
                <label className="text-xs text-white/45">{p("management.subtitleCueEditor")}</label>
                <Textarea
                  value={model.subtitles.map((s) => s.text).join("\n")}
                  onChange={(e) => {
                    /* local edit via save button below */
                    setScriptText(e.target.value);
                  }}
                  placeholder={p("management.cueLinesPlaceholder")}
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
                  {p("management.saveSubtitleCues")}
                </Button>
              </div>
            )}
          </DashboardCardContent>
        </DashboardCard>
      )}

      {tab === "quality" && (
        <DashboardCard>
          <DashboardCardHeader>
            <DashboardCardTitle>{p("management.qualitySystem")}</DashboardCardTitle>
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
            <DashboardCardTitle>{p("management.versionControl")}</DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent className="space-y-2">
            {history.versions.length === 0 ? (
              <p className="text-sm text-white/40">{p("management.noVersionsYet")}</p>
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
                    {p("management.restore")}
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

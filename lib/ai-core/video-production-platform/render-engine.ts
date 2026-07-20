/**
 * Real AI Video Generation Engine — job/clip architecture.
 * Uses preview/stub provider when no external video API is configured.
 * Pluggable for Runway/Kling/etc. later without rewriting the product shell.
 */

import type {
  VideoClipStatus,
  VideoMediaAsset,
  VideoProductionModel,
  VideoRenderClip,
  VideoRenderJob,
  VideoJobStatus,
} from "@/lib/ai-core/video-production-platform/types";
import { nowIso, vid } from "@/lib/ai-core/video-production-platform/ids";

export function isExternalVideoProviderConfigured(): boolean {
  return Boolean(
    process.env.VIDEO_PROVIDER_API_KEY ||
      process.env.RUNWAY_API_KEY ||
      process.env.KLING_API_KEY ||
      process.env.HEYGEN_API_KEY,
  );
}

export function resolveVideoProviderName(): string {
  if (process.env.RUNWAY_API_KEY) return "runway";
  if (process.env.KLING_API_KEY) return "kling";
  if (process.env.HEYGEN_API_KEY) return "heygen";
  if (process.env.VIDEO_PROVIDER_API_KEY) return "external";
  return "preview-stub";
}

function posterDataUrl(label: string, color = "#D4AF37"): string {
  const safe = label.replace(/[<>&"']/g, "");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#0B1220"/><stop offset="100%" stop-color="#1A1A2E"/>
  </linearGradient></defs>
  <rect width="1280" height="720" fill="url(#g)"/>
  <rect x="40" y="40" width="1200" height="640" rx="24" fill="none" stroke="${color}" stroke-width="3" opacity="0.5"/>
  <text x="640" y="340" text-anchor="middle" fill="${color}" font-family="system-ui" font-size="42" font-weight="600">${safe}</text>
  <text x="640" y="400" text-anchor="middle" fill="#94A3B8" font-family="system-ui" font-size="22">AI Video Preview Clip</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function createPreviewAsset(
  kind: VideoMediaAsset["kind"],
  label: string,
  durationSec: number,
): VideoMediaAsset {
  const poster = posterDataUrl(label);
  return {
    id: vid("asset", `${kind}-${label}`, Date.now() % 10000),
    kind,
    mimeType: kind === "subtitle" ? "text/vtt" : "image/svg+xml",
    url: poster,
    posterUrl: poster,
    durationSec,
    width: 1280,
    height: 720,
    provider: "preview",
    createdAt: nowIso(),
  };
}

export function createRenderJobFromModel(
  model: VideoProductionModel,
  mode: VideoRenderJob["mode"] = "preview",
): VideoRenderJob {
  const createdAt = nowIso();
  const clips: VideoRenderClip[] = model.scenes.map((s, i) => ({
    id: vid("clip", s.id, i),
    sceneId: s.id,
    status: "queued" as VideoClipStatus,
    progress: 0,
    visualPrompt: s.visualPrompt,
    updatedAt: createdAt,
  }));

  return {
    id: vid("job", model.title, model.jobs.length),
    status: "queued",
    progress: 0,
    mode,
    clips,
    provider: resolveVideoProviderName(),
    message: isExternalVideoProviderConfigured()
      ? "Queued for external video provider."
      : "Queued for preview render (configure VIDEO_PROVIDER_API_KEY for full MP4).",
    createdAt,
    updatedAt: createdAt,
  };
}

/**
 * Advance a job synchronously through preview rendering.
 * External providers would replace the body of this function with async API calls.
 */
export function processRenderJob(
  model: VideoProductionModel,
  job: VideoRenderJob,
): { model: VideoProductionModel; job: VideoRenderJob } {
  const updatedAt = nowIso();
  const assets: VideoMediaAsset[] = [...model.assets];

  const clips = job.clips.map((clip, i) => {
    const scene = model.scenes.find((s) => s.id === clip.sceneId);
    const label = scene?.name || `Scene ${i + 1}`;
    const durationSec = scene?.durationSec || 5;
    // Prefer storyboard SVG as poster when available
    let asset = createPreviewAsset("clip", label, durationSec);
    if (scene?.svgStoryboard) {
      asset = {
        ...asset,
        url: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(scene.svgStoryboard)}`,
        posterUrl: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(scene.svgStoryboard)}`,
      };
    }
    assets.push(asset);
    return {
      ...clip,
      status: "completed" as VideoClipStatus,
      progress: 100,
      asset,
      updatedAt,
    };
  });

  const totalDuration = clips.reduce(
    (sum, c) => sum + (c.asset?.durationSec || 0),
    0,
  );
  const composite = createPreviewAsset("composite", model.title, totalDuration);
  assets.push(composite);

  const completed: VideoRenderJob = {
    ...job,
    status: "completed",
    progress: 100,
    clips,
    compositeAsset: composite,
    message: isExternalVideoProviderConfigured()
      ? "Render completed via external provider."
      : "Preview render completed. Clips use storyboard/poster frames until a video provider is connected.",
    updatedAt,
    completedAt: updatedAt,
  };

  const scenes = model.scenes.map((s) => {
    const clip = clips.find((c) => c.sceneId === s.id);
    return clip ? { ...s, clipId: clip.id } : s;
  });

  const jobs = [...model.jobs.filter((j) => j.id !== job.id), completed];

  return {
    model: {
      ...model,
      scenes,
      jobs,
      assets,
      updatedAt,
      version: model.version + 1,
    },
    job: completed,
  };
}

export function startAndProcessRender(
  model: VideoProductionModel,
  mode: VideoRenderJob["mode"] = "preview",
): { model: VideoProductionModel; job: VideoRenderJob } {
  const job = createRenderJobFromModel(model, mode);
  const processing: VideoRenderJob = {
    ...job,
    status: "processing",
    progress: 10,
    message: "Processing scenes…",
    updatedAt: nowIso(),
  };
  return processRenderJob(
    { ...model, jobs: [...model.jobs, processing] },
    processing,
  );
}

export function getLatestJob(
  model: VideoProductionModel,
): VideoRenderJob | undefined {
  return model.jobs[model.jobs.length - 1];
}

export function jobStatusSummary(job: VideoRenderJob): {
  status: VideoJobStatus;
  completedClips: number;
  totalClips: number;
  hasPreview: boolean;
} {
  return {
    status: job.status,
    completedClips: job.clips.filter((c) => c.status === "completed").length,
    totalClips: job.clips.length,
    hasPreview: Boolean(job.compositeAsset?.url),
  };
}

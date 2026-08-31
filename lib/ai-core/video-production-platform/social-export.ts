/**
 * Social media export presets + publish packages (download-ready).
 */

import type {
  SocialExportPreset,
  SocialExportPresetId,
  VideoProductionModel,
} from "@/lib/ai-core/video-production-platform/types";
import { brandEndCardSvg } from "@/lib/ai-core/video-production-platform/brand";

export const SOCIAL_EXPORT_PRESETS: SocialExportPreset[] = [
  {
    id: "tiktok",
    label: "TikTok",
    aspectRatio: "9:16",
    maxDurationSec: 60,
    quality: "1080p",
    captions: true,
  },
  {
    id: "instagram-reels",
    label: "Instagram Reels",
    aspectRatio: "9:16",
    maxDurationSec: 90,
    quality: "1080p",
    captions: true,
  },
  {
    id: "youtube-shorts",
    label: "YouTube Shorts",
    aspectRatio: "9:16",
    maxDurationSec: 60,
    quality: "1080p",
    captions: true,
  },
  {
    id: "youtube",
    label: "YouTube",
    aspectRatio: "16:9",
    maxDurationSec: 600,
    quality: "1080p",
    captions: true,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    aspectRatio: "1:1",
    maxDurationSec: 180,
    quality: "1080p",
    captions: true,
  },
];

export function getSocialExportPreset(
  id: SocialExportPresetId | string,
): SocialExportPreset | undefined {
  return SOCIAL_EXPORT_PRESETS.find((p) => p.id === id);
}

function formatVttTime(n: number): string {
  const h = Math.floor(n / 3600);
  const m = Math.floor((n % 3600) / 60);
  const sec = (n % 60).toFixed(3).padStart(6, "0");
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${sec}`;
}

export function buildCaptionsVtt(model: VideoProductionModel): string {
  return [
    "WEBVTT",
    "",
    ...model.subtitles.map((s, i) => {
      const start = s.startSec ?? i * 3;
      const end = s.endSec ?? start + 3;
      return `${i + 1}\n${formatVttTime(start)} --> ${formatVttTime(end)}\n${s.text}\n`;
    }),
  ].join("\n");
}

export type SocialPublishPackage = {
  preset: SocialExportPreset;
  videoUrl: string | null;
  captionsVtt: string;
  endCardSvg: string;
  checklist: string[];
  title: string;
  description: string;
  hashtags: string[];
  publishReady: boolean;
  warnings: string[];
  downloadManifest: Array<{ kind: string; url: string | null; filename: string }>;
};

export function buildSocialExportPackage(
  model: VideoProductionModel,
  presetId: SocialExportPresetId,
): SocialPublishPackage {
  const preset = getSocialExportPreset(presetId) || SOCIAL_EXPORT_PRESETS[0]!;
  const job = model.jobs[model.jobs.length - 1];
  const videoUrl = job?.compositeAsset?.url || null;
  const captionsVtt = buildCaptionsVtt(model);

  const warnings: string[] = [];
  if (!videoUrl) {
    warnings.push("No playable composite — export requires a final assembled video");
  }
  if (model.targetDurationSec > preset.maxDurationSec) {
    warnings.push(
      `Project ${model.targetDurationSec}s exceeds ${preset.label} max ${preset.maxDurationSec}s`,
    );
  }
  if (model.aspectRatio !== preset.aspectRatio) {
    warnings.push(
      `Aspect ${model.aspectRatio} differs from ${preset.aspectRatio} — crop/letterbox on publish`,
    );
  }
  if (preset.captions && model.subtitles.length === 0) {
    warnings.push("Captions expected but no subtitle cues");
  }

  const checklist = [
    `Aspect ${preset.aspectRatio}`,
    `Max duration ${preset.maxDurationSec}s (project ${model.targetDurationSec}s)`,
    preset.captions ? "Captions included (VTT)" : "Captions off",
    `Quality ${preset.quality}`,
    videoUrl ? "Primary composite asset linked" : "No playable composite yet",
    job?.assemblyManifest
      ? `Assembly: ${job.assemblyManifest.method}`
      : "Assembly: n/a",
  ];

  const hashtags = [
    "#TrendBusinessAI",
    `#${preset.id.replace(/-/g, "")}`,
    model.contentTypeId ? `#${model.contentTypeId}` : "#video",
  ];

  return {
    preset,
    videoUrl,
    captionsVtt,
    endCardSvg: brandEndCardSvg(model.brand || { businessName: model.title }),
    checklist,
    title: model.title.slice(0, 100),
    description: (
      model.voiceTracks[0]?.script ||
      model.scenes.map((s) => s.script).filter(Boolean).join(" ") ||
      model.title
    ).slice(0, 500),
    hashtags,
    publishReady: false,
    warnings,
    downloadManifest: [
      {
        kind: "video",
        url: videoUrl,
        filename: `${preset.id}-${model.title.slice(0, 40).replace(/\W+/g, "-")}.mp4`,
      },
      {
        kind: "captions",
        url: null,
        filename: `${preset.id}-captions.vtt`,
      },
      {
        kind: "end-card",
        url: null,
        filename: `${preset.id}-endcard.svg`,
      },
    ],
  };
}

/** Alias for publish-oriented API responses */
export function buildSocialPublishPackage(
  model: VideoProductionModel,
  presetId: SocialExportPresetId,
): SocialPublishPackage {
  return buildSocialExportPackage(model, presetId);
}

/**
 * Persist captions VTT (+ optional end card) into Video Studio media storage.
 */
export async function persistSocialExportAssets(params: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any;
  userId: string;
  generationId: string;
  package: SocialPublishPackage;
}): Promise<{ captionsAssetId?: string; endCardAssetId?: string }> {
  const { uploadVideoStudioMedia } = await import(
    "@/lib/ai-core/video-production-platform/media-storage"
  );
  const out: { captionsAssetId?: string; endCardAssetId?: string } = {};
  const vttBytes = new TextEncoder().encode(params.package.captionsVtt);
  const captions = await uploadVideoStudioMedia({
    supabase: params.supabase,
    userId: params.userId,
    generationId: params.generationId,
    kind: "export",
    bytes: vttBytes,
    mimeType: "text/vtt",
    filename: `${params.package.preset.id}-captions.vtt`,
    provider: "social-export",
    meta: { presetId: params.package.preset.id, kind: "captions" },
  });
  out.captionsAssetId = captions.asset.id;

  return out;
}

function packageFromVerified(
  model: VideoProductionModel,
  presetId: SocialExportPresetId,
  videoUrl: string,
  mimeType: "video/mp4" | "video/webm",
  summary: string,
): SocialPublishPackage {
  const base = buildSocialExportPackage(model, presetId);
  return {
    ...base,
    videoUrl,
    publishReady: false,
    warnings: base.warnings.filter(
      (warning) => !warning.includes("No playable composite") && !warning.includes("No rendered"),
    ),
    downloadManifest: base.downloadManifest.map((item) =>
      item.kind === "video"
        ? {
            ...item,
            url: videoUrl,
            filename: `${presetId}-export.${mimeType === "video/webm" ? "webm" : "mp4"}`,
          }
        : item,
    ),
    checklist: [
      ...base.checklist.filter((line) => !line.startsWith("No playable") && !line.startsWith("Primary")),
      summary,
    ],
  };
}

/**
 * Re-encode a verified playable composite to a social preset via FFmpeg.
 * Does not report success until write + probe verification complete.
 */
export async function reencodeForSocialPreset(params: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any;
  userId: string;
  generationId: string;
  model: VideoProductionModel;
  presetId: SocialExportPresetId;
  reencode?: boolean;
}): Promise<{
  package: SocialPublishPackage;
  reencoded: boolean;
  reused: boolean;
  charged: false;
  videoUrl: string;
  message: string;
  artifact: import("@/lib/ai-core/video-production-platform/export-production").VerifiedCompositeArtifact;
  audioIncluded: boolean;
  audioRequired: boolean;
}> {
  const { exportProductionForSocialPreset } = await import(
    "@/lib/ai-core/video-production-platform/export-production"
  );
  const preset = getSocialExportPreset(params.presetId);
  if (!preset) {
    const { ProductionExportError } = await import(
      "@/lib/ai-core/video-production-platform/export-production"
    );
    throw new ProductionExportError("Unknown social export preset.", "export_failed");
  }

  const exported = await exportProductionForSocialPreset({
    supabase: params.supabase,
    userId: params.userId,
    generationId: params.generationId,
    model: params.model,
    preset,
    reencode: params.reencode,
  });

  return {
    ...exported,
    package: packageFromVerified(
      params.model,
      params.presetId,
      exported.videoUrl,
      exported.artifact.mimeType,
      `Verified ${exported.artifact.mimeType} ${exported.artifact.width}×${exported.artifact.height} ${exported.artifact.codec} ${exported.artifact.durationSec.toFixed(2)}s sha256=${exported.artifact.sha256.slice(0, 12)}`,
    ),
  };
}

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
  const videoUrl =
    job?.compositeAsset?.url ||
    job?.clips.find((c) => c.asset)?.asset?.url ||
    null;
  const captionsVtt = buildCaptionsVtt(model);

  const warnings: string[] = [];
  if (!videoUrl) warnings.push("No rendered video — run full render first");
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
    videoUrl ? "Primary video asset linked" : "No rendered video yet",
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
    publishReady: Boolean(videoUrl) && warnings.length === 0,
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

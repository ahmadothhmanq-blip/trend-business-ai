/**
 * Social media export presets + package builder.
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

export function buildSocialExportPackage(
  model: VideoProductionModel,
  presetId: SocialExportPresetId,
): {
  preset: SocialExportPreset;
  videoUrl: string | null;
  captionsVtt: string;
  endCardSvg: string;
  checklist: string[];
} {
  const preset = getSocialExportPreset(presetId) || SOCIAL_EXPORT_PRESETS[0]!;
  const job = model.jobs[model.jobs.length - 1];
  const videoUrl = job?.compositeAsset?.url || job?.clips.find((c) => c.asset)?.asset?.url || null;

  const captionsVtt = [
    "WEBVTT",
    "",
    ...model.subtitles.map((s, i) => {
      const start = s.startSec ?? i * 3;
      const end = s.endSec ?? start + 3;
      const fmt = (n: number) => {
        const h = Math.floor(n / 3600);
        const m = Math.floor((n % 3600) / 60);
        const sec = (n % 60).toFixed(3).padStart(6, "0");
        return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${sec}`;
      };
      return `${i + 1}\n${fmt(start)} --> ${fmt(end)}\n${s.text}\n`;
    }),
  ].join("\n");

  const checklist = [
    `Aspect ${preset.aspectRatio}`,
    `Max duration ${preset.maxDurationSec}s (project ${model.targetDurationSec}s)`,
    preset.captions ? "Captions included (VTT)" : "Captions off",
    `Quality ${preset.quality}`,
    videoUrl ? "Primary video asset linked" : "No rendered video yet — run full render first",
  ];

  return {
    preset,
    videoUrl,
    captionsVtt,
    endCardSvg: brandEndCardSvg(
      model.brand || { businessName: model.title },
    ),
    checklist,
  };
}

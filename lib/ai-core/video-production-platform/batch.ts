/**
 * AI Batch Video Creation — plan N videos with talent/voice variation.
 */

import type {
  PresenterPersonaId,
  LocationId,
  VideoBatchPlanItem,
  VideoBatchRequest,
} from "@/lib/ai-core/video-production-platform/types";
import type { VideoPluginInput } from "@/plugins/video-studio/types";
import {
  matchVideoTemplate,
  VIDEO_PRESENTER_PERSONAS,
  VIDEO_LOCATIONS,
} from "@/lib/ai-core/video-production-platform/templates";
import { recommendedSceneCount } from "@/lib/ai-core/video-production-platform/duration";
import { VOICE_STYLES } from "@/lib/ai-core/video-production-platform/voice-audio";
import { vid } from "@/lib/ai-core/video-production-platform/ids";

/** Max videos that can be planned in one batch request */
export const BATCH_PLAN_MAX = 100;
/** Max videos generated synchronously in one HTTP request (chunk for larger batches) */
export const BATCH_GENERATE_MAX = 50;

const ANGLES = [
  "Hook-first",
  "Story-driven",
  "Listicle",
  "Problem-solution",
  "Testimonial style",
  "Myth vs fact",
  "Day-in-the-life",
  "Challenge",
  "Before/after",
  "FAQ",
  "Contrarian take",
  "Checklist",
] as const;

export function planBatchVideos(req: VideoBatchRequest): {
  batchId: string;
  items: VideoBatchPlanItem[];
  estimatedCredits: number;
  variation: {
    angles: boolean;
    presenters: boolean;
    voices: boolean;
    locations: boolean;
  };
} {
  const count = Math.max(1, Math.min(BATCH_PLAN_MAX, Math.floor(req.count)));
  const batchId = vid("batch", req.prompt.slice(0, 24), count);
  const varyTalent = req.varyTalent !== false;
  const baseTemplate = matchVideoTemplate({
    prompt: req.prompt,
    videoType: req.videoType,
  });

  const presenters = VIDEO_PRESENTER_PERSONAS.map((p) => p.id);
  const locations = VIDEO_LOCATIONS.map((l) => l.id);
  const voices = [...VOICE_STYLES];

  const items: VideoBatchPlanItem[] = Array.from({ length: count }, (_, i) => {
    const angle = ANGLES[i % ANGLES.length]!;
    const presenterPersona = (
      varyTalent
        ? presenters[i % presenters.length]
        : baseTemplate.presenterPersona
    ) as PresenterPersonaId;
    const location = (
      varyTalent ? locations[i % locations.length] : baseTemplate.location
    ) as LocationId;
    const voiceStyle = varyTalent
      ? voices[i % voices.length]!
      : baseTemplate.voiceStyle;

    const template = matchVideoTemplate({
      prompt: `${req.prompt} ${angle}`,
      videoType: req.videoType,
      contentType: baseTemplate.contentType,
      presenter: presenterPersona,
      location,
    });

    const title = `${req.prompt.replace(/[.!?].*$/, "").trim().slice(0, 40)} #${i + 1}`;
    return {
      index: i + 1,
      title,
      idea: `${angle} take on: ${req.prompt}. Presenter: ${presenterPersona}. Voice: ${voiceStyle}. Location: ${location}.`,
      scriptOutline: template.scriptStructure.join(" → "),
      templateId: template.id,
      sceneCount: recommendedSceneCount(req.durationSec),
      presenterPersona,
      voiceStyle,
      location,
      angle,
    };
  });

  return {
    batchId,
    items,
    estimatedCredits: count * Math.max(1, Math.ceil(req.durationSec / 30)),
    variation: {
      angles: true,
      presenters: varyTalent,
      voices: varyTalent,
      locations: varyTalent,
    },
  };
}

export type BatchProgressSnapshot = {
  batchId: string;
  total: number;
  completed: number;
  failed: number;
  pending: number;
  estimatedCredits: number;
  spentCredits: number;
  percent: number;
  items: Array<{
    index: number;
    title: string;
    status: "pending" | "generating" | "completed" | "failed";
    generationId?: string;
    error?: string;
    presenterPersona?: string;
    voiceStyle?: string;
  }>;
};

export function createBatchProgress(
  batchId: string,
  items: VideoBatchPlanItem[],
  estimatedCredits: number,
): BatchProgressSnapshot {
  return {
    batchId,
    total: items.length,
    completed: 0,
    failed: 0,
    pending: items.length,
    estimatedCredits,
    spentCredits: 0,
    percent: 0,
    items: items.map((i) => ({
      index: i.index,
      title: i.title,
      status: "pending",
      presenterPersona: i.presenterPersona,
      voiceStyle: i.voiceStyle,
    })),
  };
}

export function updateBatchProgressPercent(
  progress: BatchProgressSnapshot,
): BatchProgressSnapshot {
  const done = progress.completed + progress.failed;
  return {
    ...progress,
    percent: Math.round((done / Math.max(1, progress.total)) * 100),
  };
}

export function batchItemToPluginInput(
  req: VideoBatchRequest,
  item: VideoBatchPlanItem,
): VideoPluginInput {
  const template = matchVideoTemplate({
    prompt: item.idea,
    presenter: item.presenterPersona,
    location: item.location,
  });
  return {
    prompt: [
      `Batch video ${item.index}: ${item.title}`,
      `Idea: ${item.idea}`,
      `Angle: ${item.angle || "standard"}`,
      `Presenter persona: ${item.presenterPersona || template.presenterPersona}`,
      `Voice style: ${item.voiceStyle || template.voiceStyle}`,
      `Location: ${item.location || template.location}`,
      `Character: ${template.character}`,
      `Camera: ${template.cameraStyle}`,
      `Motion: ${template.motionStyle}`,
      `Platform: ${req.platform}`,
      `Language: ${req.language}`,
      `Style: ${req.style}`,
      `Script outline: ${item.scriptOutline}`,
      `Original request: ${req.prompt}`,
    ].join("\n"),
    videoType: req.videoType || "social-video",
    style: req.style || template.visualStyle,
    aspectRatio:
      req.platform.toLowerCase().includes("tiktok") ||
      req.platform.toLowerCase().includes("reel") ||
      req.platform.toLowerCase().includes("short")
        ? "9:16"
        : "16:9",
    duration: `${req.durationSec}s`,
    mood: "Energetic",
    cameraMove: template.cameraStyle.split("+")[0]?.trim() || "Handheld",
    options: [
      "script",
      "voiceover",
      "subtitles",
      "music",
      "thumbnail",
      "branded",
      "presenter",
      item.presenterPersona || "business-expert",
    ],
    sceneCount: Math.min(8, item.sceneCount),
  };
}

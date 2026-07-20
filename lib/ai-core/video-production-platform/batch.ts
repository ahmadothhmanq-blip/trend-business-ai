/**
 * AI Batch Video Creation — plan N videos from one brief.
 */

import type {
  VideoBatchPlanItem,
  VideoBatchRequest,
} from "@/lib/ai-core/video-production-platform/types";
import type { VideoPluginInput } from "@/plugins/video-studio/types";
import { matchVideoTemplate } from "@/lib/ai-core/video-production-platform/templates";
import { recommendedSceneCount } from "@/lib/ai-core/video-production-platform/duration";
import { vid } from "@/lib/ai-core/video-production-platform/ids";

export function planBatchVideos(req: VideoBatchRequest): {
  batchId: string;
  items: VideoBatchPlanItem[];
  estimatedCredits: number;
} {
  const count = Math.max(1, Math.min(50, Math.floor(req.count)));
  const batchId = vid("batch", req.prompt.slice(0, 24), count);
  const baseTemplate = matchVideoTemplate({
    prompt: req.prompt,
    videoType: req.videoType,
  });

  const angles = [
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
  ];

  const items: VideoBatchPlanItem[] = Array.from({ length: count }, (_, i) => {
    const angle = angles[i % angles.length]!;
    const title = `${req.prompt.replace(/[.!?].*$/, "").trim().slice(0, 48)} #${i + 1}`;
    return {
      index: i + 1,
      title,
      idea: `${angle} take on: ${req.prompt}`,
      scriptOutline: baseTemplate.scriptStructure.join(" → "),
      templateId: baseTemplate.id,
      sceneCount: recommendedSceneCount(req.durationSec),
    };
  });

  return {
    batchId,
    items,
    estimatedCredits: count * Math.max(1, Math.ceil(req.durationSec / 30)),
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
  items: Array<{
    index: number;
    title: string;
    status: "pending" | "generating" | "completed" | "failed";
    generationId?: string;
    error?: string;
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
    items: items.map((i) => ({
      index: i.index,
      title: i.title,
      status: "pending",
    })),
  };
}

export function batchItemToPluginInput(
  req: VideoBatchRequest,
  item: VideoBatchPlanItem,
): VideoPluginInput {
  const template = matchVideoTemplate({ prompt: item.idea });
  return {
    prompt: [
      `Batch video ${item.index}: ${item.title}`,
      `Idea: ${item.idea}`,
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
    cameraMove: "Handheld",
    options: ["script", "voiceover", "subtitles", "music", "thumbnail", "branded"],
    sceneCount: Math.min(8, item.sceneCount),
  };
}

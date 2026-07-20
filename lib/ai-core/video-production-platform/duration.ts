/**
 * Flexible video duration — tiers, segmentation, chapters, assembly plan.
 */

import type {
  VideoChapter,
  VideoEditorScene,
  VideoProductionModel,
} from "@/lib/ai-core/video-production-platform/types";
import { vid } from "@/lib/ai-core/video-production-platform/ids";

export const DURATION_PRESETS = [
  { id: "short", label: "Short videos", seconds: 15, platforms: ["TikTok", "Reels", "Shorts"] },
  { id: "social", label: "Social media videos", seconds: 30, platforms: ["Instagram", "LinkedIn"] },
  { id: "marketing", label: "Marketing videos", seconds: 60, platforms: ["YouTube", "Ads"] },
  { id: "long", label: "Long videos", seconds: 300, platforms: ["YouTube", "Training"] },
  { id: "extended", label: "Extended long-form", seconds: 900, platforms: ["Courses", "Webinar"] },
] as const;

export function parseDurationToSeconds(raw: string | number | undefined): number {
  if (typeof raw === "number" && Number.isFinite(raw)) return Math.max(1, raw);
  if (!raw) return 30;
  const s = String(raw).trim().toLowerCase();
  const min = s.match(/^(\d+)\s*m/);
  if (min) return parseInt(min[1]!, 10) * 60;
  const sec = s.match(/^(\d+)\s*s?$/);
  if (sec) return parseInt(sec[1]!, 10);
  const mmss = s.match(/^(\d+):(\d+)$/);
  if (mmss) return parseInt(mmss[1]!, 10) * 60 + parseInt(mmss[2]!, 10);
  return 30;
}

export function resolveDurationTier(
  seconds: number,
): VideoProductionModel["durationTier"] {
  if (seconds <= 20) return "short";
  if (seconds <= 45) return "social";
  if (seconds <= 120) return "marketing";
  return "long";
}

export function recommendedSceneCount(durationSec: number): number {
  if (durationSec <= 15) return 3;
  if (durationSec <= 30) return 5;
  if (durationSec <= 60) return 8;
  if (durationSec <= 180) return 12;
  return Math.min(24, Math.ceil(durationSec / 20));
}

/** Segment long videos into chapters for automatic assembly. */
export function buildChapters(
  scenes: VideoEditorScene[],
  targetDurationSec: number,
): VideoChapter[] {
  if (scenes.length === 0) return [];

  const chapterTarget = targetDurationSec > 120 ? 60 : targetDurationSec > 60 ? 30 : targetDurationSec;
  const chapters: VideoChapter[] = [];
  let bucket: VideoEditorScene[] = [];
  let start = 0;
  let elapsed = 0;
  let chapterIdx = 0;

  const flush = () => {
    if (!bucket.length) return;
    const end = start + bucket.reduce((a, s) => a + s.durationSec, 0);
    chapters.push({
      id: vid("chapter", `ch-${chapterIdx}`, chapterIdx),
      title: `Chapter ${chapterIdx + 1}: ${bucket[0]!.name}`,
      startSec: start,
      endSec: end,
      sceneIds: bucket.map((s) => s.id),
    });
    start = end;
    bucket = [];
    elapsed = 0;
    chapterIdx += 1;
  };

  for (const scene of [...scenes].sort((a, b) => a.order - b.order)) {
    bucket.push(scene);
    elapsed += scene.durationSec;
    if (elapsed >= chapterTarget && scenes.length > 3) flush();
  }
  flush();
  return chapters;
}

export function assemblyPlan(model: VideoProductionModel): {
  totalSec: number;
  chapters: number;
  scenes: number;
  steps: string[];
} {
  const totalSec = model.scenes.reduce((a, s) => a + s.durationSec, 0);
  return {
    totalSec,
    chapters: model.chapters.length,
    scenes: model.scenes.length,
    steps: [
      "Render scene clips",
      "Synthesize voice tracks",
      "Mix music/SFX beds",
      "Assemble chapters in order",
      "Burn subtitles",
      "Apply brand overlay",
      "Export composite",
    ],
  };
}

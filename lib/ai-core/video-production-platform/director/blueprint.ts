import type { VideoBlueprint, VideoScene } from "@/types/video";
import type { VideoProductionModel } from "@/lib/ai-core/video-production-platform/types";
import { resolveDurationTier } from "@/lib/ai-core/video-production-platform/duration";
import type { DirectorInput, DirectorVideoPlan } from "@/lib/ai-core/video-production-platform/director/contracts";

function durationLabel(seconds: number): string {
  return `${Math.max(1, Math.round(seconds))}s`;
}

function projectScene(plan: DirectorVideoPlan, index: number): VideoScene {
  const scene = plan.scenes[index]!;
  return {
    id: scene.id,
    name: `Scene ${scene.order + 1}: ${scene.purpose}`,
    description: scene.prompt,
    duration: durationLabel(scene.duration),
    visualPrompt: scene.prompt,
    cameraMove: scene.camera.move,
    mood: scene.visualStyle,
    narration: scene.dialogue.text,
    musicDirection: scene.audio.musicCue || "",
    sfxNotes: (scene.audio.sfx || []).join(", "),
    transition: scene.transition,
    svgStoryboard: "",
  };
}

/** Derived GET/compat document. Domain `video_plans` / `video_scenes` remain the write source. */
export function projectDirectorBlueprint(params: {
  plan: DirectorVideoPlan;
  input: DirectorInput;
  videoType: string;
}): VideoBlueprint {
  const { plan, input } = params;
  const script = plan.scenes.map((scene) => scene.dialogue.text).filter(Boolean).join("\n\n");
  const productionModel: VideoProductionModel = {
    version: 1,
    title: plan.title || plan.objective,
    videoType: params.videoType,
    aspectRatio: plan.aspectRatio,
    targetDurationSec: plan.totalDuration,
    durationTier: resolveDurationTier(plan.totalDuration),
    language: plan.language,
    platform: input.platform,
    style: plan.visualStyle,
    mood: plan.pacing,
    scenes: plan.scenes.map((scene) => ({
      id: scene.id,
      name: scene.purpose,
      order: scene.order,
      durationSec: scene.duration,
      script: scene.dialogue.text,
      visualPrompt: scene.prompt,
      cameraMove: scene.camera.move,
      presenterId: scene.characters[0],
      transition: scene.transition,
    })),
    chapters: [],
    voiceTracks: plan.audioPlan.narrationRequired
      ? [
          {
            id: plan.audioPlan.id,
            voiceId: plan.audioPlan.speaker || "unspecified",
            style: plan.audioPlan.tone || "professional",
            language: plan.audioPlan.language,
            script: plan.audioPlan.voiceScript,
            status: "queued",
          },
        ]
      : [],
    audioBeds: [],
    subtitles: [],
    jobs: [],
    assets: [],
    productImageUrl: input.products?.find((row) => row.visualReference || row.referenceUri)?.visualReference
      || input.products?.find((row) => row.referenceUri)?.referenceUri
      || null,
    createdAt: plan.createdAt,
    updatedAt: plan.createdAt,
  };

  return {
    title: plan.title || plan.objective,
    description: plan.narrative,
    videoType: params.videoType,
    style: plan.visualStyle,
    aspectRatio: plan.aspectRatio,
    totalDuration: durationLabel(plan.totalDuration),
    scenes: plan.scenes.map((_, index) => projectScene(plan, index)),
    script,
    voiceoverScript: plan.audioPlan.voiceScript,
    musicSuggestions: plan.audioPlan.musicRequired
      ? [{ name: "Director music bed", genre: "cinematic", mood: plan.audioPlan.musicMood || plan.pacing, bpm: "" }]
      : [],
    subtitles: [],
    thumbnailSvg: "",
    colorGrade: plan.visualStyle,
    exportPreset: "1080p",
    files: [],
    prompt: input.prompt,
    language: plan.language,
    generatedAt: plan.createdAt,
    progressEvents: ["Director planned scenes.", "VideoPlan persisted."],
    productionModel,
  };
}

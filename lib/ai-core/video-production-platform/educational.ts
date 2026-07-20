/**
 * Educational AI Video Generator — text / document → teacher video package.
 */

import type { VideoPluginInput } from "@/plugins/video-studio/types";
import { matchVideoTemplate } from "@/lib/ai-core/video-production-platform/templates";
import { buildPresenterProfile, presenterPromptBlock } from "@/lib/ai-core/video-production-platform/presenters";
import { recommendedSceneCount, parseDurationToSeconds } from "@/lib/ai-core/video-production-platform/duration";

export type EducationalVideoInput = {
  topic: string;
  content: string;
  sourceKind?: "text" | "pdf" | "document";
  language?: string;
  duration?: string;
  audience?: string;
};

export function buildEducationalVideoBrief(
  input: EducationalVideoInput,
): {
  pluginInput: VideoPluginInput;
  templateId: string;
  lessonOutline: string[];
  sourceSummary: string;
} {
  const template = matchVideoTemplate({
    prompt: `educational lesson ${input.topic}`,
    contentType: "educational",
    presenter: "teacher",
  });
  const presenter = buildPresenterProfile("teacher", {
    language: input.language || "English",
    displayName: "AI Teacher",
  });

  const truncated = input.content.slice(0, 6000);
  const lessonOutline = template.scriptStructure;
  const duration = input.duration || `${Math.max(60, template.recommendedDurationSec)}s`;
  const sceneCount = Math.min(8, recommendedSceneCount(parseDurationToSeconds(duration)));

  const enrichedPrompt = [
    `Create an educational AI video lesson about: ${input.topic}`,
    `Audience: ${input.audience || "General learners"}`,
    `Source (${input.sourceKind || "text"}):`,
    truncated,
    `Generate: teacher/presenter, explanation scenes, visual aids, voice narration, subtitles.`,
    presenterPromptBlock(presenter),
    `Lesson structure: ${lessonOutline.join(" → ")}`,
    `Visual aids: diagrams, key points on screen, examples.`,
  ].join("\n");

  return {
    pluginInput: {
      prompt: enrichedPrompt,
      videoType: "explainer",
      style: "Motion Graphics",
      aspectRatio: "16:9",
      duration,
      mood: "Professional",
      cameraMove: "Static",
      options: ["script", "voiceover", "subtitles", "transitions", "thumbnail", "music"],
      sceneCount,
    },
    templateId: template.id,
    lessonOutline,
    sourceSummary: truncated.slice(0, 280),
  };
}

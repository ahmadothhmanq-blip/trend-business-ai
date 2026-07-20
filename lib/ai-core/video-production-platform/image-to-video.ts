/**
 * Image-to-video workflow.
 */

import type { VideoPluginInput } from "@/plugins/video-studio/types";
import type { VideoProductionModel } from "@/lib/ai-core/video-production-platform/types";
import { matchVideoTemplate } from "@/lib/ai-core/video-production-platform/templates";

export type ImageToVideoInput = {
  imageUrl: string;
  prompt: string;
  motion?: string;
  cameraMove?: string;
  duration?: string;
  aspectRatio?: string;
  kind?: "product" | "person" | "scene";
};

export function buildImageToVideoBrief(
  input: ImageToVideoInput,
): { pluginInput: VideoPluginInput; templateId: string } {
  const template = matchVideoTemplate({
    prompt: `${input.kind || "scene"} ${input.prompt}`,
  });
  const motion = input.motion || template.motionStyle;
  const camera = input.cameraMove || template.cameraStyle;

  const enriched = [
    `Image-to-video generation.`,
    `Source image: ${input.imageUrl}`,
    `Kind: ${input.kind || "scene"}`,
    `Motion: ${motion}`,
    `Camera: ${camera}`,
    `User prompt: ${input.prompt}`,
    `Animate the still image into a cinematic video scene with natural motion.`,
  ].join("\n");

  return {
    templateId: template.id,
    pluginInput: {
      prompt: enriched,
      videoType: "image-to-video",
      style: template.visualStyle,
      aspectRatio: input.aspectRatio || "9:16",
      duration: input.duration || "5s",
      mood: "Cinematic",
      cameraMove: camera.split("+")[0]?.trim() || "Dolly Forward",
      options: ["camera-motion", "smooth", "thumbnail", "script"],
      sceneCount: 1,
    },
  };
}

export function attachSourceImageToModel(
  model: VideoProductionModel,
  imageUrl: string,
): VideoProductionModel {
  return {
    ...model,
    productImageUrl: imageUrl,
    updatedAt: new Date().toISOString(),
    version: model.version + 1,
  };
}

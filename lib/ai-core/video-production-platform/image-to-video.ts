/**
 * Image-to-video workflow — product / person / scene stills → motion video.
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
  intensity?: "subtle" | "medium" | "dynamic";
};

const KIND_MOTION: Record<NonNullable<ImageToVideoInput["kind"]>, string> = {
  product: "Orbit product, subtle parallax, specular highlights, soft reflection",
  person: "Gentle head motion, natural breathing, eye blink, shoulder sway",
  scene: "Slow push-in, ambient particles, light flicker, depth parallax",
};

const INTENSITY_CAMERA: Record<NonNullable<ImageToVideoInput["intensity"]>, string> = {
  subtle: "Very slow dolly + micro pan",
  medium: "Dolly Forward + gentle orbit",
  dynamic: "Crash zoom + whip pan + parallax layers",
};

export function buildImageToVideoBrief(
  input: ImageToVideoInput,
): { pluginInput: VideoPluginInput; templateId: string; motionBrief: string } {
  const kind = input.kind || "scene";
  const intensity = input.intensity || "medium";
  const template = matchVideoTemplate({
    prompt: `${kind} ${input.prompt}`,
  });
  const motion = input.motion || KIND_MOTION[kind] || template.motionStyle;
  const camera =
    input.cameraMove || INTENSITY_CAMERA[intensity] || template.cameraStyle;

  const motionBrief = [
    `Kind=${kind}`,
    `Motion=${motion}`,
    `Camera=${camera}`,
    `Intensity=${intensity}`,
  ].join(" · ");

  const enriched = [
    `Image-to-video generation (production).`,
    `Source image URL: ${input.imageUrl}`,
    `Image kind: ${kind}`,
    `Motion direction: ${motion}`,
    `Camera movement: ${camera}`,
    `Motion intensity: ${intensity}`,
    `User prompt: ${input.prompt}`,
    `Requirements: animate the still into a cinematic video scene with natural motion, coherent lighting, and stable subject identity.`,
    kind === "product"
      ? "Keep product readable; emphasize material, logo, and hero angle."
      : kind === "person"
        ? "Keep facial identity stable; prefer natural micro-expressions over warping."
        : "Preserve scene layout; add atmospheric motion and camera path.",
  ].join("\n");

  return {
    templateId: template.id,
    motionBrief,
    pluginInput: {
      prompt: enriched,
      videoType: "image-to-video",
      style: template.visualStyle,
      aspectRatio: input.aspectRatio || "9:16",
      duration: input.duration || "5s",
      mood: "Cinematic",
      cameraMove: camera.split("+")[0]?.trim() || "Dolly Forward",
      options: [
        "camera-motion",
        "smooth",
        "thumbnail",
        "script",
        "image-to-video",
        kind,
        intensity,
      ],
      sceneCount: 1,
    },
  };
}

export function attachSourceImageToModel(
  model: VideoProductionModel,
  imageUrl: string,
  kind?: ImageToVideoInput["kind"],
): VideoProductionModel {
  return {
    ...model,
    productImageUrl: imageUrl,
    scenes: model.scenes.map((s, i) =>
      i === 0
        ? {
            ...s,
            visualPrompt: `${s.visualPrompt}\n[Source image: ${imageUrl}${kind ? ` · kind=${kind}` : ""}]`,
          }
        : s,
    ),
    updatedAt: new Date().toISOString(),
    version: model.version + 1,
  };
}

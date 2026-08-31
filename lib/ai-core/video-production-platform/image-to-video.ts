/**
 * Image-to-video workflow — product / person / scene stills → motion video.
 */

import type { VideoPluginInput } from "@/plugins/video-studio/types";
import type { VideoProductionModel } from "@/lib/ai-core/video-production-platform/types";
import { matchVideoTemplate } from "@/lib/ai-core/video-production-platform/templates";
import { uploadVideoStudioMedia } from "@/lib/ai-core/video-production-platform/media-storage";
import { validateVideoStudioUpload } from "@/lib/ai-core/video-production-platform/upload-validation";
import { assertSafeRemoteFetchUrl } from "@/lib/website/url-safety";

export const MAX_VIDEO_STUDIO_SOURCE_IMAGES = 8;

export type VideoStudioSourceImageUpload = {
  filename: string;
  mimeType: string;
  base64: string;
};

export function collectDirectorSourceImageUrls(input: {
  productImageUrl?: string | null;
  sourceImageUrls?: string[] | null;
}): string[] {
  return [
    ...new Set(
      [...(input.sourceImageUrls ?? []), input.productImageUrl].filter(
        (url): url is string => Boolean(url?.trim()),
      ),
    ),
  ].slice(0, MAX_VIDEO_STUDIO_SOURCE_IMAGES);
}

export async function ingestDirectorSourceImages(params: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any;
  userId: string;
  generationId: string;
  uploads?: VideoStudioSourceImageUpload[];
  urls?: string[];
}): Promise<string[]> {
  const urls: string[] = [];
  for (const upload of (params.uploads ?? []).slice(0, MAX_VIDEO_STUDIO_SOURCE_IMAGES)) {
    const bytes = Buffer.from(upload.base64, "base64");
    validateVideoStudioUpload({
      bytes,
      declaredMime: upload.mimeType,
      filename: upload.filename,
    });
    const stored = await uploadVideoStudioMedia({
      supabase: params.supabase,
      userId: params.userId,
      generationId: params.generationId,
      kind: "source-image",
      bytes,
      mimeType: upload.mimeType,
      filename: upload.filename,
      provider: "upload",
    });
    const url = stored.asset.url;
    if (!url || !/^https?:\/\//i.test(url)) {
      throw new Error("Source image uploaded but a signed URL was not issued.");
    }
    urls.push(url);
  }
  for (const url of (params.urls ?? []).slice(0, MAX_VIDEO_STUDIO_SOURCE_IMAGES - urls.length)) {
    await assertSafeRemoteFetchUrl(url);
    urls.push(url);
  }
  return [...new Set(urls)].slice(0, MAX_VIDEO_STUDIO_SOURCE_IMAGES);
}

export type ImageToVideoInput = {
  imageUrl: string;
  prompt: string;
  motion?: string;
  cameraMove?: string;
  duration?: string;
  aspectRatio?: string;
  kind?: "product" | "person" | "scene";
  intensity?: "subtle" | "medium" | "dynamic";
  language?: string;
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
      language: input.language,
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

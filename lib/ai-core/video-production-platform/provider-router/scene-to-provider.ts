/**
 * Maps domain Scene records into Router v2 + provider job requests.
 * Only sends fields supported by Veo / Runway adapters.
 */

import type { Scene } from "@/lib/ai-core/video-production-platform/domain/contracts";
import type {
  ModelRouterInput,
  ProviderJobRequest,
  RouterQuality,
  RouterTask,
} from "@/lib/ai-core/video-production-platform/provider-router/contract";

export type SceneProviderContext = {
  projectId: string;
  aspectRatio: string;
  mode?: "full" | "avatar" | "image-to-video" | "batch-item";
  quality?: RouterQuality;
  sourceImageUrl?: string | null;
  productImageUrl?: string | null;
  useAvatar?: boolean;
  language?: string;
  idempotencySalt?: string;
};

function sceneReferenceImage(scene: Scene, ctx: SceneProviderContext): string | null {
  for (const ref of scene.references) {
    if (ref.role === "product" || ref.role === "image" || ref.role === "style") {
      if (ref.uri?.startsWith("http")) return ref.uri;
    }
  }
  return ctx.sourceImageUrl || ctx.productImageUrl || null;
}

function sceneTask(ctx: SceneProviderContext): RouterTask {
  if (ctx.useAvatar || ctx.mode === "avatar") return "avatar";
  if (ctx.mode === "image-to-video" || ctx.sourceImageUrl || ctx.productImageUrl) {
    return "image-to-video";
  }
  return "text-to-video";
}

/** Build a provider-ready visual prompt from scene metadata (no unsupported fields). */
export function buildSceneProviderPrompt(scene: Scene): string {
  const parts = [scene.prompt.trim()];
  if (scene.visualStyle?.trim()) parts.push(`Visual style: ${scene.visualStyle.trim()}`);
  if (scene.environment?.trim()) parts.push(`Environment: ${scene.environment.trim()}`);
  if (scene.lighting?.trim()) parts.push(`Lighting: ${scene.lighting.trim()}`);
  const camera = scene.camera;
  if (camera?.move?.trim()) parts.push(`Camera: ${camera.move.trim()}`);
  if (camera?.shotSize?.trim()) parts.push(`Shot: ${camera.shotSize.trim()}`);
  if (camera?.lens?.trim()) parts.push(`Lens: ${camera.lens.trim()}`);
  return parts.filter(Boolean).join(". ");
}

export function buildSceneRouterInput(scene: Scene, ctx: SceneProviderContext): ModelRouterInput {
  const hasImage = Boolean(sceneReferenceImage(scene, ctx));
  const preferred =
    scene.providerPreference && scene.providerPreference !== "auto"
      ? scene.providerPreference
      : undefined;

  return {
    task: hasImage ? "image-to-video" : sceneTask(ctx),
    quality: ctx.quality || (ctx.mode === "batch-item" ? "draft" : "standard"),
    duration: Math.max(1, scene.duration || 5),
    avatarRequired: ctx.useAvatar || ctx.mode === "avatar",
    references: { images: hasImage },
    language: ctx.language,
    preferredProvider: preferred,
    projectId: ctx.projectId,
    sceneId: scene.id,
    prompt: buildSceneProviderPrompt(scene),
    idempotencySalt: ctx.idempotencySalt,
  };
}

export function buildProviderJobRequestFromScene(
  scene: Scene,
  ctx: SceneProviderContext & { promptHash: string; idempotencyKey: string },
): ProviderJobRequest {
  const imageUrl = sceneReferenceImage(scene, ctx);
  const prompt = buildSceneProviderPrompt(scene);

  return {
    projectId: ctx.projectId,
    sceneId: scene.id,
    prompt,
    promptHash: ctx.promptHash,
    durationSec: Math.max(1, scene.duration || 5),
    aspectRatio: ctx.aspectRatio,
    imageUrl,
    avatar:
      ctx.useAvatar || ctx.mode === "avatar"
        ? {
            personaId: scene.characters[0],
            script: scene.dialogue?.text || prompt,
          }
        : undefined,
    idempotencyKey: ctx.idempotencyKey,
  };
}

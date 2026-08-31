import { VIDEO_WORKFLOWS, type VideoWorkflow } from "@/lib/ai-core/video-production-platform/domain/contracts";
import { WORKFLOW_FROM_TYPE } from "@/lib/ai-core/video-production-platform/domain/legacy";
import { parseDurationToSeconds } from "@/lib/ai-core/video-production-platform/duration";
import {
  DIRECTOR_QUALITY_TIERS,
  type DirectorInput,
  type DirectorQualityTier,
} from "@/lib/ai-core/video-production-platform/director/contracts";

export function resolveDirectorWorkflow(videoType: string, workflow?: string): VideoWorkflow {
  if (workflow && (VIDEO_WORKFLOWS as readonly string[]).includes(workflow)) {
    return workflow as VideoWorkflow;
  }
  return WORKFLOW_FROM_TYPE[videoType] || "cinematic";
}

export function directorInputFromGenerateRequest(input: {
  prompt: string;
  videoType: string;
  style?: string;
  aspectRatio?: string;
  duration?: string | number;
  language?: string;
  country?: string;
  workflow?: string;
  objective?: string;
  audience?: string;
  quality?: string;
  budget?: number;
  brandId?: string;
  productIds?: string[];
  characterIds?: string[];
  voicePreference?: string;
  platform?: string;
  callToAction?: string;
  productImageUrl?: string;
  productImageUrls?: string[];
  projectId: string;
}): DirectorInput {
  const workflow = resolveDirectorWorkflow(input.videoType, input.workflow);
  const quality = (DIRECTOR_QUALITY_TIERS as readonly string[]).includes(input.quality || "")
    ? (input.quality as DirectorQualityTier)
    : undefined;
  const productIds = [...(input.productIds ?? [])];
  const products: NonNullable<DirectorInput["products"]> = [];
  const imageUrls = [
    ...new Set(
      [...(input.productImageUrls ?? []), input.productImageUrl].filter(
        (url): url is string => Boolean(url?.trim()),
      ),
    ),
  ];
  for (const [index, url] of imageUrls.entries()) {
    const id = productIds[index] || `source-image-${index + 1}`;
    if (!productIds.includes(id)) productIds.push(id);
    products.push({
      id,
      projectId: input.projectId,
      name: id,
      visualReference: url,
      referenceUri: url,
    });
  }
  return {
    prompt: input.prompt,
    workflow,
    objective: input.objective,
    audience: input.audience,
    duration: parseDurationToSeconds(input.duration),
    aspectRatio: input.aspectRatio,
    language: input.language,
    country: input.country,
    style: input.style,
    quality,
    budget: input.budget,
    brandId: input.brandId,
    productIds: productIds.length ? productIds : undefined,
    characterIds: input.characterIds?.length ? input.characterIds : undefined,
    voicePreference: input.voicePreference,
    platform: input.platform,
    callToAction: input.callToAction,
    products: products.length ? products : undefined,
  };
}

/**
 * Read-only AI Design Studio integration — social visual dimensions.
 */

import { SOCIAL_MEDIA_DIMENSIONS } from "@/lib/social-media/platforms";
import type { SocialPostPlatform } from "@/types/social-media";

export type SocialVisualRequest = {
  prompt: string;
  platform: SocialPostPlatform;
  dimensionId?: string;
  brandIdentityId?: string;
  aspectRatio?: string;
};

export function getDimensionsForPlatform(platform: SocialPostPlatform) {
  return SOCIAL_MEDIA_DIMENSIONS.filter((d) => d.platform === platform);
}

export function resolveSocialDimension(dimensionId?: string, platform?: SocialPostPlatform) {
  if (dimensionId) {
    return SOCIAL_MEDIA_DIMENSIONS.find((d) => d.id === dimensionId);
  }
  if (platform) {
    return getDimensionsForPlatform(platform)[0];
  }
  return SOCIAL_MEDIA_DIMENSIONS[0];
}

/** Build payload for POST /api/image-generator (client-side or server proxy). */
export function buildImageGeneratorPayload(req: SocialVisualRequest) {
  const dim = resolveSocialDimension(req.dimensionId, req.platform);
  const ratio = dim ? `${dim.width}:${dim.height}` : req.aspectRatio ?? "1:1";
  return {
    prompt: req.prompt,
    imageType: "social-media",
    style: "Professional",
    aspectRatio: ratio,
    mood: "Engaging",
    options: ["branded", "text-overlay"],
    batchCount: 1,
  };
}

export const DESIGN_INTEGRATION_NOTE =
  "Visual generation uses existing Image Generator API with social dimensions (1080, 1200). No Image Generator files are modified.";

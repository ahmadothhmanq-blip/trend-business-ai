/**
 * Image Art Direction — define photography style before pixels are generated.
 * Uses Brand Identity + Design Intelligence + industry/section purpose.
 */

import type { BrandIdentityBrief } from "@/lib/ai-core/brand-identity/types";
import type { ImageIntelligenceContext, ImagePurpose } from "@/lib/ai-core/image-engine/types";

export type ImageArtDirection = {
  photographyStyle: string;
  cameraAngle: string;
  lighting: string;
  mood: string;
  colors: string;
  composition: string;
  /** Compact fragment injected into generation prompts. */
  promptFragment: string;
  summary: string;
};

const PURPOSE_DIRECTION: Record<
  ImagePurpose,
  Pick<ImageArtDirection, "cameraAngle" | "composition">
> = {
  hero: {
    cameraAngle: "wide cinematic eye-level or slight low angle",
    composition: "full-bleed hero frame with clear subject hierarchy and negative space for headline",
  },
  product: {
    cameraAngle: "three-quarter product angle, eye-level",
    composition: "product-forward staging with soft depth and intentional crop",
  },
  service: {
    cameraAngle: "environmental portrait or craft close-up at eye level",
    composition: "people or process in authentic context, mid-shot",
  },
  background: {
    cameraAngle: "wide atmospheric, slight tilt optional",
    composition: "soft depth layers suitable as backdrop without competing with text",
  },
  gallery: {
    cameraAngle: "editorial varied angles",
    composition: "strong single subject, magazine crop, intentional asymmetry",
  },
  section: {
    cameraAngle: "supporting mid-shot",
    composition: "section-matched subject with clear focal point",
  },
  brand: {
    cameraAngle: "brand mood wide or still-life",
    composition: "iconic brand atmosphere, restrained props",
  },
  testimonial: {
    cameraAngle: "natural portrait, shallow depth of field",
    composition: "warm human subject, soft bokeh, trustworthy presence",
  },
};

function lightingForStyle(brandStyle: string, imageStyle: string): string {
  const hay = `${brandStyle} ${imageStyle}`.toLowerCase();
  if (/luxury|noir|cinematic|dark/.test(hay)) {
    return "dramatic cinematic lighting, soft key with deep shadows, golden or cool rim accents";
  }
  if (/minimal|clean|scandinavian/.test(hay)) {
    return "soft natural daylight, even exposure, gentle shadows";
  }
  if (/tech|saas|futur|neon/.test(hay)) {
    return "clean product lighting with subtle cool rim light and controlled speculars";
  }
  if (/corporate|trust|clinic|financ/.test(hay)) {
    return "bright professional lighting, natural windows, trustworthy clarity";
  }
  if (/creative|editorial|agency/.test(hay)) {
    return "expressive editorial lighting, intentional contrast";
  }
  return "premium commercial lighting, balanced highlights, agency-grade exposure";
}

function moodForContext(ctx: ImageIntelligenceContext, brand?: BrandIdentityBrief | null): string {
  if (brand?.strategy.brandPersonality) {
    const map: Record<string, string> = {
      refined: "quiet luxury, composed, exclusive",
      bold: "confident energy, decisive presence",
      trustworthy: "calm confidence, clarity, reassurance",
      playful: "warm optimism without looking childish",
      innovative: "forward-looking precision",
      calm: "serene, spacious, unhurried",
      authoritative: "assured expertise",
      warm: "human, inviting, approachable",
    };
    return map[brand.strategy.brandPersonality] || brand.strategy.visualDirection;
  }
  return `${ctx.brandStyle} mood for ${ctx.targetAudience}`;
}

/**
 * Build art direction for a specific image purpose before generation.
 */
export function buildImageArtDirection(params: {
  purpose: ImagePurpose;
  ctx: ImageIntelligenceContext;
  brandIdentity?: BrandIdentityBrief | null;
  sectionName?: string;
}): ImageArtDirection {
  const purposeDir = PURPOSE_DIRECTION[params.purpose] || PURPOSE_DIRECTION.section;
  const photographyStyle =
    params.brandIdentity?.imageDirection ||
    params.ctx.imageRequirements[0] ||
    `${params.ctx.imageStyle} commercial photography for ${params.ctx.industry}`;
  const lighting = lightingForStyle(params.ctx.brandStyle, String(params.ctx.imageStyle));
  const mood = moodForContext(params.ctx, params.brandIdentity);
  const colors = `Palette harmony near ${params.ctx.colors.primary} / ${params.ctx.colors.secondary}${
    params.brandIdentity
      ? ` with accent ${params.brandIdentity.colors.accent}`
      : ""
  }`;
  const cameraAngle = purposeDir.cameraAngle;
  const composition = params.sectionName
    ? `${purposeDir.composition}; section “${params.sectionName}”`
    : purposeDir.composition;

  const promptFragment = [
    `Photography style: ${photographyStyle}`,
    `Camera: ${cameraAngle}`,
    `Lighting: ${lighting}`,
    `Mood: ${mood}`,
    `Colors: ${colors}`,
    `Composition: ${composition}`,
  ].join(". ");

  return {
    photographyStyle,
    cameraAngle,
    lighting,
    mood,
    colors,
    composition,
    promptFragment,
    summary: `${params.purpose}: ${mood} · ${cameraAngle}`,
  };
}

/** Art-direct an entire planned set (one brief per purpose family). */
export function buildArtDirectionMap(params: {
  purposes: ImagePurpose[];
  ctx: ImageIntelligenceContext;
  brandIdentity?: BrandIdentityBrief | null;
}): Record<string, ImageArtDirection> {
  const map: Record<string, ImageArtDirection> = {};
  for (const purpose of params.purposes) {
    map[purpose] = buildImageArtDirection({
      purpose,
      ctx: params.ctx,
      brandIdentity: params.brandIdentity,
    });
  }
  return map;
}

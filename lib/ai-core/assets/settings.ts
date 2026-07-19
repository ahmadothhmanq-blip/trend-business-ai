/**
 * AI Real Images Engine — visual generation settings.
 * Separate from DeepSeek text/code providers.
 */

export type ImageStylePreset =
  | "luxury"
  | "modern"
  | "minimal"
  | "corporate";

export type ImageAspectRatio =
  | "16:9"
  | "3:2"
  | "1:1"
  | "4:5"
  | "9:16";

export type ImageQuality = "standard" | "hd";

export type ImageProviderId = "openai" | "replicate" | "stability";

export type ImageGenerationSettings = {
  style: ImageStylePreset;
  aspectRatio: ImageAspectRatio;
  quality: ImageQuality;
  /** Preferred provider; falls back through configured providers. */
  preferredProvider?: ImageProviderId;
};

const STYLE_PROMPT: Record<ImageStylePreset, string> = {
  luxury:
    "luxury editorial photography, refined materials, cinematic lighting, premium atmosphere",
  modern:
    "modern clean photography, sharp focus, contemporary composition, bright balanced light",
  minimal:
    "minimalist photography, negative space, soft light, calm composition, uncluttered",
  corporate:
    "professional corporate photography, trustworthy, polished, business-appropriate",
};

const ASPECT_TO_OPENAI: Record<ImageAspectRatio, "1792x1024" | "1024x1024" | "1024x1792"> = {
  "16:9": "1792x1024",
  "3:2": "1792x1024",
  "1:1": "1024x1024",
  "4:5": "1024x1792",
  "9:16": "1024x1792",
};

/** Stability / generic pixel sizes */
const ASPECT_TO_PIXELS: Record<ImageAspectRatio, { width: number; height: number }> = {
  "16:9": { width: 1344, height: 768 },
  "3:2": { width: 1216, height: 832 },
  "1:1": { width: 1024, height: 1024 },
  "4:5": { width: 896, height: 1152 },
  "9:16": { width: 768, height: 1344 },
};

export function getDefaultImageSettings(
  overrides?: Partial<ImageGenerationSettings>,
): ImageGenerationSettings {
  const envProvider = process.env.IMAGE_PROVIDER?.trim().toLowerCase();
  const preferred =
    envProvider === "replicate" ||
    envProvider === "stability" ||
    envProvider === "openai"
      ? (envProvider as ImageProviderId)
      : undefined;

  return {
    style: "modern",
    aspectRatio: "16:9",
    quality: "standard",
    preferredProvider: preferred,
    ...overrides,
  };
}

export function stylePromptFragment(style: ImageStylePreset): string {
  return STYLE_PROMPT[style];
}

export function openaiSizeForAspect(
  aspect: ImageAspectRatio,
): "1792x1024" | "1024x1024" | "1024x1792" {
  return ASPECT_TO_OPENAI[aspect];
}

export function pixelsForAspect(aspect: ImageAspectRatio) {
  return ASPECT_TO_PIXELS[aspect];
}

export function normalizeImageStyle(value?: string | null): ImageStylePreset {
  const v = (value ?? "").toLowerCase().trim();
  if (v.includes("luxury")) return "luxury";
  if (v.includes("minimal")) return "minimal";
  if (v.includes("corporate") || v.includes("business")) return "corporate";
  if (v.includes("modern") || v.includes("creative")) return "modern";
  return "modern";
}

import type { ImageStylePreset } from "@/lib/ai-core/assets/settings";

/**
 * AI Image Engine visual styles.
 * Maps premium / industry design language → image generation presets.
 */
export const IMAGE_ENGINE_STYLES: Record<
  ImageStylePreset,
  { label: string; fragment: string }
> = {
  luxury: {
    label: "Luxury",
    fragment:
      "luxury editorial photography, refined materials, soft cinematic lighting, premium atmosphere, high-end commercial look",
  },
  corporate: {
    label: "Corporate",
    fragment:
      "professional corporate photography, trustworthy polished lighting, clean business environment, premium commercial clarity",
  },
  modern: {
    label: "Modern",
    fragment:
      "modern clean photography, sharp focus, contemporary composition, bright balanced light, premium commercial finish",
  },
  minimal: {
    label: "Modern",
    fragment:
      "minimalist photography, negative space, soft light, calm uncluttered composition, refined commercial aesthetic",
  },
  realistic: {
    label: "Realistic",
    fragment:
      "ultra-realistic photography, natural light, authentic detail, true-to-life textures, documentary commercial quality",
  },
  cinematic: {
    label: "Cinematic",
    fragment:
      "cinematic wide photography, dramatic lighting, shallow depth of field, filmic color grade, premium commercial mood",
  },
  "premium-commercial": {
    label: "Premium commercial",
    fragment:
      "premium commercial photography, agency advertising quality, polished product/lifestyle staging, crisp detail, brand-ready",
  },
};

/** Resolve image style from Premium Design System / industry / template signals. */
export function resolveImageEngineStyle(params: {
  preferred?: string | null;
  premiumStyleId?: string | null;
  designStyle?: string | null;
  designPreset?: string | null;
  industryDesignStyle?: string | null;
}): ImageStylePreset {
  const blob = [
    params.preferred,
    params.premiumStyleId,
    params.designStyle,
    params.designPreset,
    params.industryDesignStyle,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (blob.includes("cinematic") || blob.includes("travel premium")) {
    return "cinematic";
  }
  if (
    blob.includes("premium-commercial") ||
    blob.includes("premium commercial") ||
    blob.includes("commercial")
  ) {
    return "premium-commercial";
  }
  if (blob.includes("realistic") || blob.includes("photo-real")) {
    return "realistic";
  }
  if (blob.includes("luxury") || blob.includes("editorial")) return "luxury";
  if (blob.includes("corporate") || blob.includes("business")) {
    return "corporate";
  }
  if (blob.includes("minimal")) return "minimal";
  if (
    blob.includes("modern") ||
    blob.includes("creative") ||
    blob.includes("tech") ||
    blob.includes("futur")
  ) {
    return "modern";
  }
  return "premium-commercial";
}

export function imageStyleFragment(style: ImageStylePreset): string {
  return IMAGE_ENGINE_STYLES[style]?.fragment ?? IMAGE_ENGINE_STYLES.modern.fragment;
}

/**
 * AI Layout Selection Engine — industry + audience + brand position → unique website structure.
 * Generates agency-grade compositions, not repetitive card templates.
 */

import type { PremiumStyleId } from "@/lib/ai-core/design-system/premium/types";
import type {
  CoreBusinessProfile,
  CoreProductStrategy,
} from "@/lib/ai-core/layers/types";

/** Typed layout variations the engine can select. */
export type LayoutVariationId =
  | "cinematic-hero"
  | "full-screen-hero"
  | "split-hero"
  | "image-focused-hero"
  | "product-showcase"
  | "interactive-hero"
  | "storytelling"
  | "editorial"
  | "dashboard"
  | "premium-saas";

export type LayoutSelectionResult = {
  industryKey: string;
  layoutVariationId: LayoutVariationId;
  /** Industry layout spine label (travel-premium, vehicle-showroom, …). */
  layoutStyle: string;
  /** Concrete hero treatment token for scaffolds / premium layout IQ. */
  heroTreatment: string;
  /** Section composition token. */
  sectionLayout: string;
  /** Preferred premium design system. */
  premiumStyleId: PremiumStyleId;
  cardStyle: string;
  navigationStyle: string;
  animationStyle: string;
  sectionStructure: string[];
  imageStyle: string;
  reason: string;
  allowedHeroVariants: string[];
  allowedSectionLayouts: string[];
  /** Soft composition preference: reduce card grids. */
  compositionMode: "editorial" | "story" | "product" | "trust" | "balanced";
};

const VARIATION_DEFAULTS: Record<
  LayoutVariationId,
  {
    heroTreatment: string;
    sectionLayout: string;
    cardStyle: string;
    navigationStyle: string;
    animationStyle: string;
    compositionMode: LayoutSelectionResult["compositionMode"];
  }
> = {
  "cinematic-hero": {
    heroTreatment: "cinematic-hero",
    sectionLayout: "story-then-proof",
    cardStyle: "borderless-editorial",
    navigationStyle: "transparent-overlay",
    animationStyle: "cinematic slow-reveal with parallax-lite",
    compositionMode: "story",
  },
  "full-screen-hero": {
    heroTreatment: "full-image-hero",
    sectionLayout: "destination-mosaic",
    cardStyle: "media-first-soft",
    navigationStyle: "transparent-overlay",
    animationStyle: "slow-reveal cinematic entrances",
    compositionMode: "editorial",
  },
  "split-hero": {
    heroTreatment: "split-hero",
    sectionLayout: "trust-then-offer",
    cardStyle: "elevated-trust",
    navigationStyle: "corporate-topbar",
    animationStyle: "subtle fade-up entrances",
    compositionMode: "trust",
  },
  "image-focused-hero": {
    heroTreatment: "full-image-hero",
    sectionLayout: "editorial-asymmetric",
    cardStyle: "borderless-editorial",
    navigationStyle: "minimal-logo-led",
    animationStyle: "soft fade-up with image scale-in",
    compositionMode: "editorial",
  },
  "product-showcase": {
    heroTreatment: "product-showcase-hero",
    sectionLayout: "showroom-experience",
    cardStyle: "metallic-elevated",
    navigationStyle: "dark-concierge",
    animationStyle: "scale-in product reveals",
    compositionMode: "product",
  },
  "interactive-hero": {
    heroTreatment: "interactive-hero",
    sectionLayout: "interactive-product-story",
    cardStyle: "elevated-soft",
    navigationStyle: "sticky-product-cta",
    animationStyle: "interactive stagger + glow-in",
    compositionMode: "product",
  },
  storytelling: {
    heroTreatment: "flagship-manifesto",
    sectionLayout: "premium-storytelling",
    cardStyle: "borderless-editorial",
    navigationStyle: "logo-led-reserved",
    animationStyle: "slow-reveal narrative pacing",
    compositionMode: "story",
  },
  editorial: {
    heroTreatment: "editorial-flagship",
    sectionLayout: "portfolio-mosaic",
    cardStyle: "bold-media",
    navigationStyle: "studio-transparent",
    animationStyle: "asymmetric staggered reveals",
    compositionMode: "editorial",
  },
  dashboard: {
    heroTreatment: "trust-split",
    sectionLayout: "symmetric-metrics",
    cardStyle: "data-card",
    navigationStyle: "corporate-topbar",
    animationStyle: "crisp fade-up metrics",
    compositionMode: "trust",
  },
  "premium-saas": {
    heroTreatment: "product-showcase-hero",
    sectionLayout: "bento-capabilities",
    cardStyle: "elevated-soft",
    navigationStyle: "sticky-product-cta",
    animationStyle: "product stagger + glow-in",
    compositionMode: "product",
  },
};

type IndustryLayoutProfile = {
  variation: LayoutVariationId;
  style: PremiumStyleId;
  layoutStyle: string;
  imageStyle: string;
  sections: string[];
  heroPool: string[];
  sectionPool: string[];
};

/**
 * Industry → distinct structure + premium system.
 * Restaurant / automotive / saas / finance / agency never share the same spine.
 */
const INDUSTRY_LAYOUTS: Record<string, IndustryLayoutProfile> = {
  tourism: {
    variation: "cinematic-hero",
    style: "luxury",
    layoutStyle: "travel-cinematic",
    imageStyle: "cinematic destination photography, golden-hour landscapes, editorial crops",
    sections: [
      "Cinematic hero",
      "Feature storytelling",
      "Gallery experience",
      "Brand trust",
      "Video section",
      "Booking CTA",
    ],
    heroPool: ["cinematic-hero", "full-image-hero", "immersive-overlay"],
    sectionPool: ["premium-storytelling", "destination-mosaic", "story-then-proof"],
  },
  restaurant: {
    variation: "image-focused-hero",
    style: "luxury",
    layoutStyle: "editorial-dining",
    imageStyle: "food photography, warm ambient dining, shallow depth of field",
    sections: [
      "Full image hero",
      "Feature storytelling",
      "Gallery experience",
      "Timeline",
      "Brand trust",
      "Reservations CTA",
      "Location",
    ],
    heroPool: ["full-image-hero", "cinematic-hero", "image-led-appetite"],
    sectionPool: ["editorial-asymmetric", "premium-storytelling", "menu-then-atmosphere"],
  },
  "real-estate": {
    variation: "split-hero",
    style: "luxury",
    layoutStyle: "property-editorial",
    imageStyle: "architectural interiors, luxury property exteriors, natural light",
    sections: [
      "Split hero",
      "Interactive product showcase",
      "Feature storytelling",
      "Case studies",
      "Brand trust",
      "Inquiry CTA",
    ],
    heroPool: ["split-hero", "editorial-split", "full-image-hero"],
    sectionPool: ["trust-then-offer", "premium-storytelling", "listing-grid"],
  },
  saas: {
    variation: "interactive-hero",
    style: "saas",
    layoutStyle: "product-saas-premium",
    imageStyle: "product UI in context, clean desks, soft product lighting",
    sections: [
      "Interactive product hero",
      "Feature storytelling",
      "Comparison",
      "Case studies",
      "Brand trust",
      "Pricing tiers",
      "Demo CTA",
    ],
    heroPool: ["interactive-hero", "product-showcase-hero", "split-hero"],
    sectionPool: ["interactive-product-story", "bento-capabilities", "pricing-then-proof"],
  },
  ecommerce: {
    variation: "product-showcase",
    style: "modern",
    layoutStyle: "commerce-editorial",
    imageStyle: "lifestyle product photography, studio lighting, editorial crops",
    sections: [
      "Product showcase hero",
      "Interactive product showcase",
      "Feature storytelling",
      "Gallery experience",
      "Comparison",
      "Brand trust",
      "Shop CTA",
    ],
    heroPool: ["product-showcase-hero", "full-image-hero", "cinematic-hero"],
    sectionPool: ["showroom-experience", "commerce-grid", "premium-storytelling"],
  },
  automotive: {
    variation: "product-showcase",
    style: "luxury",
    layoutStyle: "vehicle-cinematic",
    imageStyle: "automotive photography, motion blur, dramatic studio light",
    sections: [
      "Product showcase hero",
      "Interactive product showcase",
      "Feature storytelling",
      "Video section",
      "Comparison",
      "Brand trust",
      "Test-drive CTA",
    ],
    heroPool: ["product-showcase-hero", "cinematic-hero", "luxury-vehicle-stage"],
    sectionPool: ["showroom-experience", "interactive-product-story", "inventory-mosaic"],
  },
  clinic: {
    variation: "split-hero",
    style: "corporate",
    layoutStyle: "care-trust-premium",
    imageStyle: "calm clinical interiors, caring professionals, soft natural light",
    sections: [
      "Split hero",
      "Feature storytelling",
      "Brand trust",
      "Timeline",
      "Case studies",
      "Appointment CTA",
    ],
    heroPool: ["split-hero", "trust-split", "full-image-hero"],
    sectionPool: ["trust-then-offer", "premium-storytelling", "symmetric-grid"],
  },
  education: {
    variation: "storytelling",
    style: "modern",
    layoutStyle: "campus-narrative",
    imageStyle: "campus life, focused learners, bright optimistic light",
    sections: [
      "Storytelling hero",
      "Feature storytelling",
      "Timeline",
      "Case studies",
      "Gallery experience",
      "Brand trust",
      "Admissions CTA",
    ],
    heroPool: ["flagship-manifesto", "cinematic-hero", "split-hero"],
    sectionPool: ["premium-storytelling", "story-then-proof", "programs-grid"],
  },
  agency: {
    variation: "editorial",
    style: "creative",
    layoutStyle: "studio-flagship",
    imageStyle: "studio craft, bold compositions, editorial branding moments",
    sections: [
      "Cinematic hero",
      "Case studies",
      "Feature storytelling",
      "Gallery experience",
      "Timeline",
      "Brand trust",
      "Project CTA",
    ],
    heroPool: ["cinematic-hero", "editorial-flagship", "asymmetric-studio"],
    sectionPool: ["portfolio-mosaic", "premium-storytelling", "process-then-proof"],
  },
  finance: {
    variation: "dashboard",
    style: "corporate",
    layoutStyle: "finance-trust-premium",
    imageStyle: "confident professionals, refined offices, trustworthy clarity",
    sections: [
      "Split hero",
      "Brand trust",
      "Feature storytelling",
      "Comparison",
      "Case studies",
      "Timeline",
      "Advisory CTA",
    ],
    heroPool: ["split-hero", "trust-split", "flagship-manifesto"],
    sectionPool: ["symmetric-metrics", "trust-then-offer", "premium-storytelling"],
  },
  technology: {
    variation: "interactive-hero",
    style: "technology",
    layoutStyle: "tech-product-premium",
    imageStyle: "abstract tech light, hardware close-ups, precise product frames",
    sections: [
      "Interactive product hero",
      "Feature storytelling",
      "Interactive product showcase",
      "Comparison",
      "Case studies",
      "Video section",
      "Demo CTA",
    ],
    heroPool: ["interactive-hero", "product-showcase-hero", "cinematic-hero"],
    sectionPool: ["interactive-product-story", "bento-capabilities", "tech-bento"],
  },
  business: {
    variation: "storytelling",
    style: "premium-brand",
    layoutStyle: "brand-flagship",
    imageStyle: "professional brand photography, confident people, refined spaces",
    sections: [
      "Cinematic hero",
      "Feature storytelling",
      "Case studies",
      "Brand trust",
      "Timeline",
      "Gallery experience",
      "Contact CTA",
    ],
    heroPool: ["cinematic-hero", "flagship-manifesto", "editorial-flagship"],
    sectionPool: ["premium-storytelling", "story-then-proof", "trust-then-offer"],
  },
};

export function resolveLayoutIndustryKey(
  industryId?: string | null,
  profile?: CoreBusinessProfile | null,
  strategy?: CoreProductStrategy | null,
): string {
  const hay = [
    industryId,
    profile?.industry,
    profile?.offer,
    strategy?.positioning,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .replace(/[_\s]+/g, "-");

  if (hay in INDUSTRY_LAYOUTS) return hay;
  if (/financ|bank|invest|wealth|insur|fintech/.test(hay)) return "finance";
  if (/tour|travel|hotel|resort/.test(hay)) return "tourism";
  if (/restaurant|food|dining|cafe|bistro|cuisine/.test(hay)) return "restaurant";
  if (/real.?estate|property|listing|broker/.test(hay)) return "real-estate";
  if (/saas|software|subscription|b2b.?platform/.test(hay)) return "saas";
  if (/ecom|shop|store|retail|merch/.test(hay)) return "ecommerce";
  if (/auto|car|vehicle|showroom|dealership|motors/.test(hay)) {
    return "automotive";
  }
  if (/clinic|health|medical|dental|hospital/.test(hay)) return "clinic";
  if (/school|education|university|academy|course/.test(hay)) return "education";
  if (/agency|studio|creative|brand.?design/.test(hay)) return "agency";
  if (/tech|ai\b|cyber|hardware|iot/.test(hay)) return "technology";
  return "business";
}

function preferVariationFromSignals(
  theme?: string | null,
  designStyle?: string | null,
  audience?: string | null,
  brandPosition?: string | null,
  businessGoals?: string[] | null,
): LayoutVariationId | null {
  const hay = [
    theme,
    designStyle,
    audience,
    brandPosition,
    ...(businessGoals ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  if (!hay) return null;
  if (/interactive|configurator|demo.?ui|hotspot/.test(hay)) {
    return "interactive-hero";
  }
  if (/cinematic|film|immersive|atmosphere/.test(hay)) return "cinematic-hero";
  if (/dashboard|metrics|analytics|admin/.test(hay)) return "dashboard";
  if (/saas|product.?ui|bento|trial/.test(hay)) return "premium-saas";
  if (/editorial|portfolio|studio/.test(hay)) return "editorial";
  if (/story|manifesto|brand.?story|heritage|narrative/.test(hay)) {
    return "storytelling";
  }
  if (/showroom|inventory|product.?showcase/.test(hay)) return "product-showcase";
  if (/split.?hero|trust.?split/.test(hay)) return "split-hero";
  if (/full.?screen|full.?bleed|full.?image/.test(hay)) return "full-screen-hero";
  if (/image.?focus|appetite|food.?hero/.test(hay)) return "image-focused-hero";
  if (/luxury|prestige|affluent|executive|premium brand/.test(hay)) {
    return "cinematic-hero";
  }
  if (/enterprise|b2b|compliance|security/.test(hay)) return "dashboard";
  if (/convert|trial|plg|signup/.test(hay)) return "interactive-hero";
  return null;
}

function refineStyleForBrand(
  base: PremiumStyleId,
  brandPosition?: string | null,
  audience?: string | null,
  preferredStyle?: string | null,
): PremiumStyleId {
  const hay = [brandPosition, audience, preferredStyle]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  if (/premium brand|flagship|heritage|iconic|prestige/.test(hay)) {
    return "premium-brand";
  }
  if (/luxury|exclusive|affluent|resort|fine dining/.test(hay)) return "luxury";
  if (/enterprise|institutional|board|compliance/.test(hay)) return "corporate";
  if (/minimal|quiet|restrained|scandinavian/.test(hay)) return "minimal";
  if (/bold|expressive|artist|culture/.test(hay)) return "creative";
  if (/developer|engineer|platform|ai\b/.test(hay)) return "technology";
  if (/startup|product.?led|plg|saas/.test(hay)) return "saas";
  if (/modern|growth|smb/.test(hay)) return "modern";
  return base;
}

/**
 * Select the best website structure for industry + audience + brand + goals.
 */
export function selectWebsiteLayout(params: {
  profile?: CoreBusinessProfile | null;
  strategy?: CoreProductStrategy | null;
  industryId?: string | null;
  theme?: string | null;
  designStyle?: string | null;
  preferredStyle?: string | null;
  audience?: string | null;
  brandPosition?: string | null;
  businessGoals?: string[] | null;
}): LayoutSelectionResult {
  const industryKey = resolveLayoutIndustryKey(
    params.industryId,
    params.profile,
    params.strategy,
  );
  const profile = INDUSTRY_LAYOUTS[industryKey] ?? INDUSTRY_LAYOUTS.business!;
  const audience =
    params.audience || params.profile?.targetAudience || null;
  const brandPosition =
    params.brandPosition ||
    params.strategy?.positioning ||
    params.profile?.offer ||
    null;
  const businessGoals =
    params.businessGoals || params.profile?.businessGoals || null;

  const signalVariation = preferVariationFromSignals(
    params.preferredStyle || params.theme,
    params.designStyle,
    audience,
    brandPosition,
    businessGoals,
  );

  const variation =
    signalVariation && isVariationCompatible(industryKey, signalVariation)
      ? signalVariation
      : profile.variation;

  const defaults = VARIATION_DEFAULTS[variation];
  const heroTreatment = profile.heroPool[0] || defaults.heroTreatment;
  const sectionLayout = profile.sectionPool[0] || defaults.sectionLayout;
  const premiumStyleId = refineStyleForBrand(
    profile.style,
    brandPosition,
    audience,
    params.preferredStyle,
  );

  return {
    industryKey,
    layoutVariationId: variation,
    layoutStyle: profile.layoutStyle,
    heroTreatment,
    sectionLayout,
    premiumStyleId,
    cardStyle: defaults.cardStyle,
    navigationStyle: defaults.navigationStyle,
    animationStyle: defaults.animationStyle,
    sectionStructure: profile.sections,
    imageStyle: profile.imageStyle,
    compositionMode: defaults.compositionMode,
    reason: `Layout Selection Engine chose ${variation} + ${premiumStyleId} for ${industryKey} (audience/brand/goal aware)`,
    allowedHeroVariants: profile.heroPool,
    allowedSectionLayouts: profile.sectionPool,
  };
}

function isVariationCompatible(
  industryKey: string,
  variation: LayoutVariationId,
): boolean {
  const allowed: Record<string, LayoutVariationId[]> = {
    restaurant: [
      "image-focused-hero",
      "full-screen-hero",
      "cinematic-hero",
      "editorial",
      "storytelling",
    ],
    automotive: [
      "product-showcase",
      "cinematic-hero",
      "interactive-hero",
      "full-screen-hero",
    ],
    saas: [
      "interactive-hero",
      "premium-saas",
      "dashboard",
      "split-hero",
      "product-showcase",
    ],
    finance: ["dashboard", "split-hero", "storytelling", "cinematic-hero"],
    agency: [
      "editorial",
      "storytelling",
      "cinematic-hero",
      "image-focused-hero",
    ],
    tourism: [
      "cinematic-hero",
      "full-screen-hero",
      "storytelling",
      "editorial",
    ],
    "real-estate": [
      "split-hero",
      "product-showcase",
      "full-screen-hero",
      "cinematic-hero",
    ],
    ecommerce: [
      "product-showcase",
      "interactive-hero",
      "full-screen-hero",
      "cinematic-hero",
    ],
    clinic: ["split-hero", "storytelling", "cinematic-hero"],
    education: ["storytelling", "split-hero", "cinematic-hero", "editorial"],
    technology: [
      "interactive-hero",
      "premium-saas",
      "product-showcase",
      "dashboard",
      "cinematic-hero",
    ],
    business: [
      "storytelling",
      "cinematic-hero",
      "split-hero",
      "editorial",
      "dashboard",
      "premium-saas",
      "interactive-hero",
    ],
  };
  return (allowed[industryKey] ?? allowed.business!).includes(variation);
}

/** Pick a hero within the industry-allowed pool (uniqueness without identity loss). */
export function pickHeroFromAllowedPool(
  allowed: string[],
  seed: number,
  preferred?: string | null,
): string {
  if (preferred && allowed.includes(preferred)) return preferred;
  if (!allowed.length) return preferred || "cinematic-hero";
  return allowed[seed % allowed.length]!;
}

export function pickSectionLayoutFromAllowedPool(
  allowed: string[],
  seed: number,
  preferred?: string | null,
): string {
  if (preferred && allowed.includes(preferred)) return preferred;
  if (!allowed.length) return preferred || "premium-storytelling";
  return allowed[(seed >> 3) % allowed.length]!;
}

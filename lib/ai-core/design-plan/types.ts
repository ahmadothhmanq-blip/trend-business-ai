import type { BrandIdentityBrief } from "@/lib/ai-core/brand-identity/types";
import type { DesignPresetId } from "@/lib/ai-core/design-system/types";
import type { PremiumStyleId } from "@/lib/ai-core/design-system/premium/types";
import type { DesignIntelligenceBrief } from "@/lib/ai-core/design-intelligence/types";

export type DesignPlanSection = {
  key: string;
  label: string;
  purpose: string;
  priority: number;
  /** Preferred component kind hint for renderer/compose. */
  kindHint: string;
  assetRole?:
    | "hero"
    | "product"
    | "service"
    | "section"
    | "background"
    | "gallery"
    | "testimonial";
};

export type DesignPlanImageRequirement = {
  role:
    | "hero"
    | "product"
    | "service"
    | "section"
    | "background"
    | "gallery"
    | "testimonial";
  purpose: string;
  style: string;
  required: boolean;
  notes: string;
};

export type DesignPlanColorSystem = {
  primary: string;
  secondary: string;
  accent: string;
  neutral: string;
  surface: string;
  background: string;
  foreground: string;
  direction: string;
};

export type DesignPlanTypographySystem = {
  displayFont: string;
  headingFont: string;
  bodyFont: string;
  direction: string;
  scaleNotes: string;
};

export type DesignPlanStatus = "draft" | "approved";

/**
 * Approved visual design plan — must exist before website code generation.
 * Guarantees a unique premium identity (never a generic template dump).
 */
export type VisualDesignPlan = {
  id: string;
  status: DesignPlanStatus;
  approvedAt: string;
  brandName: string;
  industryId: string;
  /** Human-readable unique identity label for this site. */
  visualIdentity: string;
  uniquenessSeed: string;
  websiteStyle: {
    premiumStyleId: PremiumStyleId;
    enginePreset: DesignPresetId;
    layoutStyle: string;
    /** AI Layout Selection Engine variation. */
    layoutVariationId?: string;
    heroTreatment: string;
    sectionLayout: string;
    cardStyle?: string;
    navigationStyle?: string;
    animationStyle: string;
    componentStyle: string;
    density: "airy" | "balanced" | "compact";
  };
  colorSystem: DesignPlanColorSystem;
  typographySystem: DesignPlanTypographySystem;
  spacingNotes: string;
  sectionStructure: DesignPlanSection[];
  imageRequirements: DesignPlanImageRequirement[];
  artDirection: string[];
  antiPatterns: string[];
  intelligence: DesignIntelligenceBrief;
  /** Brand Identity Intelligence package applied before design generation. */
  brandIdentity?: BrandIdentityBrief;
  summary: string;
};

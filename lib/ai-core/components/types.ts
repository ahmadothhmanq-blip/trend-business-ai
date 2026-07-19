import type { IndustryId } from "@/lib/ai-core/templates/types";
import type { DesignRendererComponentId } from "@/lib/ai-core/design-renderer/types";

export type SectionKind =
  | "header"
  | "footer"
  | "hero"
  | "services"
  | "features"
  | "feature-story"
  | "product-showcase"
  | "interactive-product"
  | "gallery"
  | "gallery-experience"
  | "case-studies"
  | "brand-trust"
  | "timeline"
  | "comparison"
  | "video"
  | "testimonials"
  | "pricing"
  | "faq"
  | "booking"
  | "contact"
  | "maps"
  | "team"
  | "blog"
  | "cta";

export type HeroVariant =
  | "luxury"
  | "video"
  | "split"
  | "image"
  | "product"
  | "cinematic"
  | "interactive"
  | "full-image";

export type NavVariant = "sticky" | "transparent" | "modern";

/** Primary conversion intent for the generated website. */
export type WebsiteGoal =
  | "lead-gen"
  | "booking"
  | "ecommerce"
  | "brand"
  | "content"
  | "conversion";

export type ProfessionalComponentDefinition = {
  id: DesignRendererComponentId;
  kind: SectionKind;
  variant?: HeroVariant | NavVariant | string;
  exportName: string;
  path: string;
  pattern: string;
  description: string;
  defaultGoal: string;
  /** Industries that prefer this component (`*` = all). */
  industries: Array<IndustryId | "*">;
  /** Match against designStyle / stylePreset / premium heroStyle. */
  designStyles: string[];
  /** Keywords matched against target audience. */
  audiences: string[];
  /** Website goals that prefer this component. */
  websiteGoals: Array<WebsiteGoal | "*">;
  tags: string[];
  assetRole?: "hero" | "product" | "service" | "section" | "background";
  /** Prefer this score boost when requiredSections mention related labels. */
  sectionKeywords: string[];
};

export type ComponentSelectionContext = {
  industryId: IndustryId;
  industryLabel?: string;
  businessType?: string;
  designStyle?: string;
  stylePreset?: string;
  layoutStyle?: string;
  targetAudience?: string;
  /** Primary website goal (lead-gen, booking, ecommerce, …). */
  websiteGoal?: WebsiteGoal | string;
  businessGoals?: string[];
  positioning?: string;
  requiredSections: string[];
  ctaTypes?: string[];
  premiumHeroStyle?: string;
  premiumSectionLayout?: string;
  brandName?: string;
};

export type SelectedHomeSection = {
  name: string;
  kind: SectionKind;
  componentId: DesignRendererComponentId;
  goal: string;
  contentNotes: string;
  assetRole?: ProfessionalComponentDefinition["assetRole"];
};

export type ComponentSelectionResult = {
  heroVariant: HeroVariant;
  navVariant: NavVariant;
  websiteGoal: WebsiteGoal;
  homeSections: SelectedHomeSection[];
  componentPalette: DesignRendererComponentId[];
  componentPaths: string[];
  layoutRules: string[];
  reason: string;
};

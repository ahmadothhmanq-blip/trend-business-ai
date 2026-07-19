/**
 * Component Marketplace / Library — reusable sections for Visual Editor.
 */

import type { SectionKind } from "@/lib/ai-core/components/types";
import type { DesignRendererComponentId } from "@/lib/ai-core/design-renderer/types";
import type { IndustryId } from "@/lib/ai-core/templates/types";

/** Marketplace UX categories (Webflow / Wix / Framer style). */
export type ComponentMarketplaceCategory =
  | "hero"
  | "navigation"
  | "footer"
  | "pricing"
  | "testimonials"
  | "faq"
  | "forms"
  | "galleries"
  | "product-showcases"
  | "booking"
  | "contact"
  | "services"
  | "features"
  | "trust"
  | "cta"
  | "other";

/** Industry packs for marketplace filtering. */
export type ComponentIndustryPack =
  | "automotive"
  | "restaurant"
  | "saas"
  | "real-estate"
  | "healthcare"
  | "ecommerce"
  | "agency"
  | "finance"
  | "universal";

export type ComponentStyleVariant =
  | "luxury"
  | "modern"
  | "corporate"
  | "creative"
  | "minimal"
  | "cinematic"
  | "product"
  | "default";

export type ComponentConfigOption = {
  key: string;
  label: string;
  type: "text" | "color" | "select" | "boolean";
  defaultValue?: string | boolean;
  options?: string[];
  description?: string;
};

export type ComponentResponsiveBehavior = {
  desktop: string;
  tablet: string;
  mobile: string;
};

export type MarketplaceComponent = {
  id: DesignRendererComponentId;
  name: string;
  description: string;
  category: ComponentMarketplaceCategory;
  sectionKind: SectionKind;
  /** Style variant label for filtering. */
  styleVariant: ComponentStyleVariant;
  industries: ComponentIndustryPack[];
  /** CSS gradient preview (no external assets required). */
  previewGradient: string;
  previewLabel: string;
  responsive: ComponentResponsiveBehavior;
  configOptions: ComponentConfigOption[];
  tags: string[];
  path: string;
  exportName: string;
  /** Drag payload for Visual Editor. */
  dragType: "component-marketplace-item";
  popular?: boolean;
};

export type ComponentMarketplaceFilters = {
  category?: ComponentMarketplaceCategory | "all";
  industry?: ComponentIndustryPack | "all";
  style?: ComponentStyleVariant | "all";
  query?: string;
};

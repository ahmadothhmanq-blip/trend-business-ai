/**
 * Template Layer contract — design-only components that render exclusively from props.
 */

import type { WebsiteBusinessPack } from "@/lib/website-builder-platform/contracts/business-layer";
import type { WebsiteDesignPack } from "@/lib/website-builder-platform/contracts/design-layer";

export const TEMPLATE_LAYER_VERSION = "1.0.0";

export type TemplateRenderMode = "preview" | "production";

/** Semantic section roles — stable contract between business and design layers. */
export type SectionRole =
  | "hero"
  | "about"
  | "features"
  | "services"
  | "portfolio"
  | "team"
  | "pricing"
  | "faq"
  | "contact"
  | "forms"
  | "blog"
  | "footer"
  | "navigation"
  | "testimonials"
  | "cta"
  | "gallery"
  | "timeline"
  | "statistics";

export type SectionPropsMap = Record<SectionRole, Record<string, unknown>>;

/**
 * Props passed to a template component at render time.
 * Business data is always injected — templates never source it internally.
 */
export type TemplateComponentProps = {
  role: SectionRole;
  componentId: string;
  variantId?: string;
  props: Record<string, unknown>;
  renderMode: TemplateRenderMode;
};

export type TemplateRenderContext = {
  business: WebsiteBusinessPack;
  design: WebsiteDesignPack;
  renderMode: TemplateRenderMode;
};

export type TemplateMarketplaceEntry = {
  id: string;
  packageId: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  previewUrl?: string;
  thumbnailUrl?: string;
};

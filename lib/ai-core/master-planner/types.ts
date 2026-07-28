import type { IndustryId } from "@/lib/ai-core/templates/types";
import type { DesignRendererComponentId } from "@/lib/ai-core/design-renderer/types";

export const MASTER_WEBSITE_PLAN_KEY = "masterWebsitePlan";

export type MasterWebsitePlanSection = {
  key: string;
  label: string;
  componentId?: DesignRendererComponentId | string;
  purpose?: string;
};

export type MasterWebsitePlanColorPalette = {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  surface: string;
};

export type MasterWebsitePlanTypography = {
  display: string;
  heading: string;
  body: string;
};

/** Single source of truth for website generation — all engines consume this plan. */
export type MasterWebsitePlan = {
  id: string;
  version: "1";
  createdAt: string;
  promptHash: string;

  industry: IndustryId | string;
  industryLabel: string;
  businessType: string;
  style: string;
  audience: string;
  country?: string;
  language: string;
  tone: string;

  template: string;
  templateCategory?: string;
  layout: string;
  hero: string;
  navigation: string;

  colorPalette: MasterWebsitePlanColorPalette;
  typography: MasterWebsitePlanTypography;

  imageStyle: string;
  imageKeywords: string[];

  sections: MasterWebsitePlanSection[];
  ctaStyle: string;
  ctaPrimary?: string;
  ctaSecondary?: string;
  features: string[];

  components: string[];

  /** Engines must not override locked facets unless the user explicitly requests a change. */
  locked: {
    industry: boolean;
    template: boolean;
    layout: boolean;
    sections: boolean;
    images: boolean;
    hero: boolean;
    navigation: boolean;
  };

  sources: {
    industry: string;
    template: string;
    design: string;
  };
};

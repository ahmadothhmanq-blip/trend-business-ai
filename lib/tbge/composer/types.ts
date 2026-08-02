/**
 * TBGE Component Composer — core composition types.
 * Sprint 4: deterministic page composition from GenerationSpec only.
 */

import type { DesignTokens, GenerationSpec } from "@/lib/tbge/spec/types";

export type ComposerDensity = "compact" | "comfortable" | "spacious";
export type ComposerEmphasis = "primary" | "secondary" | "neutral";

export type ComponentVariant = {
  id: string;
  componentType: string;
  density: ComposerDensity;
  emphasis: ComposerEmphasis;
};

export type ResponsiveBreakpoints = {
  sm: number;
  md: number;
  lg: number;
  xl: number;
};

export type ResponsiveLayoutSpec = {
  breakpoints: ResponsiveBreakpoints;
  container: {
    maxWidth: string;
    padding: string;
  };
  grid: {
    columns: number;
    gap: string;
  };
  stackDirection: "column" | "row";
};

export type ComposedTheme = {
  templateId: string;
  tokens: DesignTokens;
  typography: {
    headingFont: string;
    bodyFont: string;
  };
  layoutProfile: string;
  cssVariables: Record<string, string>;
  imageStyle?: string;
};

export type ComposedSection = {
  id: string;
  type: string;
  label: string;
  variant: ComponentVariant;
  layout: ResponsiveLayoutSpec;
  props: Record<string, unknown>;
  order: number;
};

export type ComposedPage = {
  path: string;
  name: string;
  title: string;
  description: string;
  purpose: string;
  primaryCta?: string;
  layout: ResponsiveLayoutSpec;
  sections: ComposedSection[];
};

export type IndustryPatternComposition = {
  id: string;
  label: string;
  sectionOrderBias: string[];
  defaultVariantDensity: ComposerDensity;
  layoutOverrides?: Partial<ResponsiveLayoutSpec>;
};

export type SiteComposition = {
  specId: string;
  productId: GenerationSpec["productId"];
  profile: GenerationSpec["profile"];
  theme: ComposedTheme;
  industryPattern: IndustryPatternComposition;
  pages: ComposedPage[];
  navigation: Array<{ label: string; href: string }>;
  footerSections: string[];
};

export type ComposerResult = {
  composition: SiteComposition;
  stats: {
    pagesComposed: number;
    sectionsComposed: number;
    durationMs: number;
  };
};

export type ComposerValidationResult =
  | { valid: true }
  | { valid: false; errors: string[] };

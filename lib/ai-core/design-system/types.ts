/**
 * AI Design System decisions (Phase 7).
 * Built from Strategy + industry/template signals.
 */

export type DesignPresetId =
  | "luxury"
  | "modern"
  | "corporate"
  | "minimal"
  | "creative"
  | "tech"
  | "premium-brand";

export type DesignColorPalette = {
  primary: string;
  secondary: string;
  accent: string;
  neutral: string;
  surface: string;
  background: string;
  foreground: string;
};

export type DesignTypographySystem = {
  headingFont: string;
  bodyFont: string;
  scale: string[];
  notes: string;
};

export type DesignSpacingSystem = {
  unit: string;
  scale: string[];
  sectionGap: string;
  containerMax: string;
  notes: string;
};

export type DesignUiStyle = {
  density: "airy" | "balanced" | "compact";
  corners: "sharp" | "soft" | "pill";
  elevation: "flat" | "soft" | "elevated";
  contrast: "subtle" | "medium" | "high";
  notes: string;
};

export type DesignComponentStyle = {
  buttons: string;
  cards: string;
  inputs: string;
  navigation: string;
  palette: string[];
};

export type DesignAnimationStyle = {
  motion: "none" | "subtle" | "expressive";
  easing: string;
  duration: string;
  entrances: string[];
  notes: string;
};

/** Full design decision set produced by the AI Design System engine. */
export type AiDesignSystem = {
  preset: DesignPresetId;
  style: string;
  industryPattern: string;
  colors: DesignColorPalette;
  typography: DesignTypographySystem;
  spacing: DesignSpacingSystem;
  uiStyle: DesignUiStyle;
  componentStyle: DesignComponentStyle;
  animationStyle: DesignAnimationStyle;
  layoutRules: string[];
  layoutStyle: string;
  uiPatterns: string[];
  borderRadius: string;
  shadowStyle: string;
};

/** Visual skin — full-site appearance layer (content + SitePlan unchanged). */
export type VisualSkinId = string;

export type VisualSkinTokens = {
  primary: string;
  secondary: string;
  /** Interactive accent — CTAs, selected states, focus (Signal: refined red) */
  accent: string;
  background: string;
  foreground: string;
  radius: string;
  /** Tech/system chrome — metrics, live status, ambient glow (defaults to accent) */
  signal?: string;
  surface?: string;
  muted?: string;
};

/** Image framing — consistent across sections and locales. */
export type VisualSkinImageTreatment = {
  radius: string;
  aspectRatio: string;
  frame: string;
  shadow: string;
};

export type VisualSkin = {
  id: VisualSkinId;
  /** Dashboard label */
  label: string;
  /** Design intent — world-class visual direction */
  description: string;
  tokens: VisualSkinTokens;
  typography: {
    headingFont: string;
    bodyFont: string;
  };
  shadows: Record<string, string>;
  imageTreatment: VisualSkinImageTreatment;
  motionIntensity: "subtle" | "balanced" | "expressive";
  /** RTL typography when visitor locale is Arabic/Persian/Urdu */
  rtlTypography?: {
    display: string;
    body: string;
  };
  /** @deprecated Legacy — V2 uses CSS tokens; kept for compat */
  sectionShellVariant: string;
  /** First skin polished to world-class — playbook for the rest */
  flagship?: boolean;
};

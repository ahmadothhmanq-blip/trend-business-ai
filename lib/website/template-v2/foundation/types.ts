import type { TemplateV2DesignTokens } from "@/lib/website/template-v2/contracts/tokens";
import type { TemplateV2ResponsiveRules } from "@/lib/website/template-v2/contracts/package";

/** Input for building the shared V2 design foundation CSS layer. */
export type DesignFoundationInput = {
  packageId: string;
  tokens: TemplateV2DesignTokens;
  responsive: Pick<TemplateV2ResponsiveRules, "containerMaxWidth" | "breakpoints">;
};

/** Logical primitive roles mapped by flagship shared components. */
export type FoundationUi = {
  section: string;
  sectionAlt: string;
  sectionGlow: string;
  container: string;
  eyebrow: string;
  headline: string;
  headlineSm: string;
  body: string;
  btnPrimary: string;
  btnSecondary: string;
  card: string;
  cardFeatured: string;
  metric: string;
  focusRing: string;
  fontDisplay: string;
  fontBody: string;
  input: string;
  textarea: string;
  glowOrb: string;
  quoteMark: string;
  star: string;
};

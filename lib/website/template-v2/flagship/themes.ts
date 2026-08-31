/** Visual mode — drives surface depth, borders, and color-scheme hints. */

export type FlagshipThemeMode = "dark" | "light";



/** Semantic color roles layered on package token colors. */

export type FlagshipSemanticTheme = {

  mode: FlagshipThemeMode;

  surfaceElevated: string;

  surfaceInset: string;

  borderSubtle: string;

  borderDefault: string;

  borderAccent: string;

  foregroundMuted: string;

  accentGlow: string;

  headlineTracking: string;

};



const DARK_SEMANTIC: Omit<FlagshipSemanticTheme, "mode"> = {

  surfaceElevated:

    "color-mix(in srgb, var(--color-surface, var(--color-background)) 90%, #fff 10%)",

  surfaceInset: "color-mix(in srgb, var(--color-background) 86%, #000 14%)",

  borderSubtle: "color-mix(in srgb, var(--color-foreground) 8%, transparent)",

  borderDefault: "color-mix(in srgb, var(--color-foreground) 14%, transparent)",

  borderAccent:

    "color-mix(in srgb, var(--color-accent, var(--color-signal)) 42%, transparent)",

  foregroundMuted: "color-mix(in srgb, var(--color-foreground) 60%, transparent)",

  accentGlow:

    "color-mix(in srgb, var(--color-signal, var(--color-accent)) 24%, transparent)",

  headlineTracking: "-0.03em",

};



const LIGHT_SEMANTIC: Omit<FlagshipSemanticTheme, "mode"> = {

  surfaceElevated:

    "color-mix(in srgb, var(--color-surface, #fff) 94%, var(--color-primary) 6%)",

  surfaceInset:

    "color-mix(in srgb, var(--color-background) 96%, var(--color-foreground) 4%)",

  borderSubtle: "color-mix(in srgb, var(--color-foreground) 6%, transparent)",

  borderDefault: "color-mix(in srgb, var(--color-foreground) 11%, transparent)",

  borderAccent:

    "color-mix(in srgb, var(--color-accent, var(--color-signal)) 34%, transparent)",

  foregroundMuted: "color-mix(in srgb, var(--color-foreground) 54%, transparent)",

  accentGlow:

    "color-mix(in srgb, var(--color-signal, var(--color-accent)) 18%, transparent)",

  headlineTracking: "-0.025em",

};



/** Per-package semantic themes — rich dark for product/hospitality, crisp light for trust sectors. */

export const FLAGSHIP_SEMANTIC_THEMES: Record<string, FlagshipSemanticTheme> = {

  "saas-enterprise": { mode: "light", ...LIGHT_SEMANTIC },

  "ai-startup-signal": {
    mode: "dark",
    ...DARK_SEMANTIC,
    accentGlow: "color-mix(in srgb, var(--color-signal, #2EC8E0) 28%, transparent)",
    borderAccent: "color-mix(in srgb, var(--color-accent, #E8364E) 48%, transparent)",
  },

  "restaurant-premium": { mode: "dark", ...DARK_SEMANTIC },

  "hotel-resort-premium": {
    mode: "light",
    surfaceElevated: "var(--color-surface-elevated, #F9F7FD)",
    surfaceInset: "var(--color-surface, #D8CFE8)",
    borderSubtle: "color-mix(in srgb, var(--color-foreground) 6%, transparent)",
    borderDefault: "color-mix(in srgb, var(--color-foreground) 11%, transparent)",
    borderAccent: "color-mix(in srgb, var(--color-accent, var(--color-signal)) 28%, transparent)",
    foregroundMuted: "color-mix(in srgb, var(--color-foreground) 54%, transparent)",
    accentGlow: "color-mix(in srgb, var(--color-accent, var(--color-signal)) 10%, transparent)",
    headlineTracking: "-0.025em",
  },

  "creative-agency-premium": { mode: "dark", ...DARK_SEMANTIC },

  "corporate-business": { mode: "light", ...LIGHT_SEMANTIC },

  "finance-premium": { mode: "light", ...LIGHT_SEMANTIC },

  "education-premium": { mode: "light", ...LIGHT_SEMANTIC },

  "medical-premium": { mode: "light", ...LIGHT_SEMANTIC },

  "real-estate-premium": { mode: "light", ...LIGHT_SEMANTIC },

  "real-estate-prestige": { mode: "dark", ...DARK_SEMANTIC },

  "ecommerce-premium": { mode: "light", ...LIGHT_SEMANTIC },

  "creative-portfolio": { mode: "dark", ...DARK_SEMANTIC },

  "restaurant-signature": { mode: "dark", ...DARK_SEMANTIC },

  "prism-aurora": { mode: "light", ...LIGHT_SEMANTIC },

  "obsidian-noir": {
    mode: "dark",
    ...DARK_SEMANTIC,
    accentGlow: "color-mix(in srgb, var(--color-accent, #D4AF37) 28%, transparent)",
  },

  "pulse-fintech": {
    mode: "dark",
    ...DARK_SEMANTIC,
    accentGlow: "color-mix(in srgb, var(--color-accent, #10B981) 32%, transparent)",
  },

  "forge-industrial": { mode: "light", ...LIGHT_SEMANTIC },

  "citadel-trust": { mode: "dark", ...DARK_SEMANTIC },

  "lumina-wellness": { mode: "light", ...LIGHT_SEMANTIC },

};



export function resolveFlagshipSemanticTheme(packageId: string): FlagshipSemanticTheme {

  return (

    FLAGSHIP_SEMANTIC_THEMES[packageId] ?? { mode: "light", ...LIGHT_SEMANTIC }

  );

}



/** Emits semantic surface, border, and typography aliases for a flagship package. */

export function buildFlagshipSemanticThemeCss(packageId: string): string {

  const theme = resolveFlagshipSemanticTheme(packageId);

  return [

    "/* Flagship semantic theme — visual identity layer */",

    ":root, .v2-template {",

    `  --df-theme-mode: ${theme.mode};`,

    `  --color-surface-elevated: ${theme.surfaceElevated};`,

    `  --color-surface-inset: ${theme.surfaceInset};`,

    `  --df-border-subtle: ${theme.borderSubtle};`,

    `  --df-border-default: ${theme.borderDefault};`,

    `  --df-border-accent: ${theme.borderAccent};`,

    `  --df-foreground-muted: ${theme.foregroundMuted};`,

    `  --df-accent-glow: ${theme.accentGlow};`,

    `  --df-headline-tracking: ${theme.headlineTracking};`,

    "}",

    theme.mode === "dark"

      ? ".v2-template { color-scheme: dark; }"

      : ".v2-template { color-scheme: light; }",

  ].join("\n");

}



/** Shared UI class tokens for flagship V2 templates — avoids duplicating section markup. */

export type FlagshipUi = {

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

};



export const SAAS_FLAGSHIP_UI: FlagshipUi = {

  section: "se-section",

  sectionAlt: "se-section-alt df-section-alt",

  sectionGlow: "se-section-glow df-section-glow",

  container: "df-container",

  eyebrow: "se-eyebrow",

  headline: "se-headline",

  headlineSm: "se-headline-sm",

  body: "se-body text-muted-foreground",

  btnPrimary: "se-btn-primary",

  btnSecondary: "se-btn-secondary",

  card: "se-card df-card",

  cardFeatured: "se-card-featured df-card-featured",

  metric: "se-metric",

  focusRing: "se-focus-ring",

  fontDisplay: "se-font-display",

  fontBody: "se-font-body",

};



export const AI_AURA_FLAGSHIP_UI: FlagshipUi = {

  section: "as-section",

  sectionAlt: "as-section-alt df-section-alt",

  sectionGlow: "as-section-glow df-section-glow",

  container: "df-container",

  eyebrow: "as-eyebrow",

  headline: "as-headline",

  headlineSm: "as-headline-sm",

  body: "as-body text-muted-foreground",

  btnPrimary: "as-btn-primary",

  btnSecondary: "as-btn-secondary",

  card: "as-card df-card",

  cardFeatured: "as-card-featured df-card-featured",

  metric: "as-metric",

  focusRing: "as-focus-ring",

  fontDisplay: "as-font-display",

  fontBody: "as-font-body",

};



export const CORPORATE_FLAGSHIP_UI: FlagshipUi = {

  section: "cb-section",

  sectionAlt: "cb-section-alt df-section-alt",

  sectionGlow: "cb-section-glow df-section-glow",

  container: "df-container",

  eyebrow: "cb-eyebrow",

  headline: "cb-headline",

  headlineSm: "cb-headline-sm",

  body: "cb-body text-muted-foreground",

  btnPrimary: "cb-btn-primary",

  btnSecondary: "cb-btn-secondary",

  card: "cb-card df-card",

  cardFeatured: "cb-card-featured df-card-featured",

  metric: "cb-metric",

  focusRing: "cb-focus-ring",

  fontDisplay: "cb-font-display",

  fontBody: "cb-font-body",

};



export const ECOMMERCE_FLAGSHIP_UI: FlagshipUi = {

  section: "ec-section",

  sectionAlt: "ec-section-alt df-section-alt",

  sectionGlow: "ec-section-glow df-section-glow",

  container: "df-container",

  eyebrow: "ec-eyebrow",

  headline: "ec-headline",

  headlineSm: "ec-headline-sm",

  body: "ec-body text-muted-foreground",

  btnPrimary: "ec-btn-primary",

  btnSecondary: "ec-btn-secondary",

  card: "ec-card df-card",

  cardFeatured: "ec-card-featured df-card-featured",

  metric: "ec-metric",

  focusRing: "ec-focus-ring",

  fontDisplay: "ec-font-display",

  fontBody: "ec-font-body",

};



export const FINANCE_FLAGSHIP_UI: FlagshipUi = {

  section: "fn-section",

  sectionAlt: "fn-section-alt df-section-alt",

  sectionGlow: "fn-section-glow df-section-glow",

  container: "df-container",

  eyebrow: "fn-eyebrow",

  headline: "fn-headline",

  headlineSm: "fn-headline-sm",

  body: "fn-body text-muted-foreground",

  btnPrimary: "fn-btn-primary",

  btnSecondary: "fn-btn-secondary",

  card: "fn-card df-card",

  cardFeatured: "fn-card-featured df-card-featured",

  metric: "fn-metric",

  focusRing: "fn-focus-ring",

  fontDisplay: "fn-font-display",

  fontBody: "fn-font-body",

};



export const EDUCATION_FLAGSHIP_UI: FlagshipUi = {

  section: "ed-section",

  sectionAlt: "ed-section-alt df-section-alt",

  sectionGlow: "ed-section-glow df-section-glow",

  container: "df-container",

  eyebrow: "ed-eyebrow",

  headline: "ed-headline",

  headlineSm: "ed-headline-sm",

  body: "ed-body text-muted-foreground",

  btnPrimary: "ed-btn-primary",

  btnSecondary: "ed-btn-secondary",

  card: "ed-card df-card",

  cardFeatured: "ed-card-featured df-card-featured",

  metric: "ed-metric",

  focusRing: "ed-focus-ring",

  fontDisplay: "ed-font-display",

  fontBody: "ed-font-body",

};



export const RESTAURANT_FLAGSHIP_UI: FlagshipUi = {

  section: "rp-section",

  sectionAlt: "rp-section-alt df-section-alt",

  sectionGlow: "rp-section-glow df-section-glow",

  container: "df-container df-container-wide",

  eyebrow: "rp-eyebrow",

  headline: "rp-headline",

  headlineSm: "rp-headline-sm",

  body: "rp-body text-muted-foreground",

  btnPrimary: "rp-btn-primary",

  btnSecondary: "rp-btn-ghost",

  card: "rp-card df-card",

  cardFeatured: "rp-card-featured df-card-featured",

  metric: "rp-metric",

  focusRing: "rp-focus-ring",

  fontDisplay: "rp-font-display",

  fontBody: "rp-font-body",

};



export const HOTEL_RESORT_FLAGSHIP_UI: FlagshipUi = {

  section: "hr-section",

  sectionAlt: "hr-section-alt",

  sectionGlow: "hr-section-glow",

  container: "hr-container",

  eyebrow: "hr-eyebrow",

  headline: "hr-headline",

  headlineSm: "hr-headline-sm",

  body: "hr-body",

  btnPrimary: "hr-btn-primary",

  btnSecondary: "hr-btn-ghost",

  card: "hr-card",

  cardFeatured: "hr-card-featured",

  metric: "hr-metric",

  focusRing: "hr-focus-ring",

  fontDisplay: "hr-font-display",

  fontBody: "hr-font-body",

};



export const MEDICAL_FLAGSHIP_UI: FlagshipUi = {

  section: "mp-section",

  sectionAlt: "mp-section-alt df-section-alt",

  sectionGlow: "mp-section-glow df-section-glow",

  container: "df-container",

  eyebrow: "mp-eyebrow",

  headline: "mp-headline",

  headlineSm: "mp-headline-sm",

  body: "mp-body text-muted-foreground",

  btnPrimary: "mp-btn-primary",

  btnSecondary: "mp-btn-secondary",

  card: "mp-card df-card",

  cardFeatured: "mp-card-featured df-card-featured",

  metric: "mp-metric",

  focusRing: "mp-focus-ring",

  fontDisplay: "mp-font-display",

  fontBody: "mp-font-body",

};



export const CREATIVE_FLAGSHIP_UI: FlagshipUi = {

  section: "sv-section",

  sectionAlt: "sv-section-alt df-section-alt",

  sectionGlow: "sv-section-glow df-section-glow",

  container: "df-container",

  eyebrow: "sv-eyebrow",

  headline: "sv-headline",

  headlineSm: "sv-headline-sm",

  body: "sv-body text-muted-foreground",

  btnPrimary: "sv-btn-primary",

  btnSecondary: "sv-btn-secondary",

  card: "sv-card df-card",

  cardFeatured: "sv-card-featured df-card-featured",

  metric: "sv-metric",

  focusRing: "sv-focus-ring",

  fontDisplay: "sv-font-display",

  fontBody: "sv-font-body",

};



export const REAL_ESTATE_FLAGSHIP_UI: FlagshipUi = {

  section: "rep-section",

  sectionAlt: "rep-section-alt df-section-alt",

  sectionGlow: "rep-section-glow df-section-glow",

  container: "df-container",

  eyebrow: "rep-eyebrow",

  headline: "rep-headline",

  headlineSm: "rep-headline-sm",

  body: "rep-body text-muted-foreground",

  btnPrimary: "rep-btn-primary",

  btnSecondary: "rep-btn-secondary",

  card: "rep-card df-card",

  cardFeatured: "rep-card-featured df-card-featured",

  metric: "rep-metric",

  focusRing: "rep-focus-ring",

  fontDisplay: "rep-font-display",

  fontBody: "rep-font-body",

};



type BuildFlagshipUiOptions = {

  btnPrimary?: string;

  btnSecondary?: string;

  container?: string;

};



/** Build consistent section UI tokens for any CSS prefix. */

export function buildFlagshipUi(

  prefix: string,

  opts: BuildFlagshipUiOptions = {},

): FlagshipUi {

  const p = prefix;

  return {

    section: `${p}-section`,

    sectionAlt: `${p}-section-alt df-section-alt`,

    sectionGlow: `${p}-section-glow df-section-glow`,

    container: opts.container ?? "df-container",

    eyebrow: `${p}-eyebrow`,

    headline: `${p}-headline`,

    headlineSm: `${p}-headline-sm`,

    body: `${p}-body text-muted-foreground`,

    btnPrimary: opts.btnPrimary ?? `${p}-btn-primary`,

    btnSecondary: opts.btnSecondary ?? `${p}-btn-secondary`,

    card: `${p}-card df-card`,

    cardFeatured: `${p}-card-featured df-card-featured`,

    metric: `${p}-metric`,

    focusRing: `${p}-focus-ring`,

    fontDisplay: `${p}-font-display`,

    fontBody: `${p}-font-body`,

  };

}



/** Per-package UI class map — all published visual-skin V2 packages. */

export const PACKAGE_FLAGSHIP_UI: Record<string, FlagshipUi> = {

  "ai-startup-signal": AI_AURA_FLAGSHIP_UI,

  "creative-agency-premium": buildFlagshipUi("sv", {

    btnPrimary: "sv-btn-volt",

    btnSecondary: "sv-btn-ghost",

  }),

  "saas-enterprise": SAAS_FLAGSHIP_UI,

  "corporate-business": CORPORATE_FLAGSHIP_UI,

  "finance-premium": FINANCE_FLAGSHIP_UI,

  "real-estate-prestige": REAL_ESTATE_FLAGSHIP_UI,

  "real-estate-premium": REAL_ESTATE_FLAGSHIP_UI,

  "medical-premium": MEDICAL_FLAGSHIP_UI,

  "hotel-resort-premium": HOTEL_RESORT_FLAGSHIP_UI,

  "restaurant-premium": RESTAURANT_FLAGSHIP_UI,

  "restaurant-signature": buildFlagshipUi("rs", {

    btnSecondary: "rs-btn-ghost",

    container: "df-container df-container-wide",

  }),

  "education-premium": EDUCATION_FLAGSHIP_UI,

  "ecommerce-premium": ECOMMERCE_FLAGSHIP_UI,

  "creative-portfolio": buildFlagshipUi("cp", {

    btnPrimary: "cp-btn-volt",

    btnSecondary: "cp-btn-ghost",

  }),

  "prism-aurora": buildFlagshipUi("pr"),

  "obsidian-noir": buildFlagshipUi("ob"),

  "pulse-fintech": buildFlagshipUi("pu"),

  "forge-industrial": buildFlagshipUi("fg"),

  "citadel-trust": buildFlagshipUi("ct"),

  "lumina-wellness": buildFlagshipUi("lu"),

};



export function resolveFlagshipUiForPackage(packageId: string): FlagshipUi {

  return PACKAGE_FLAGSHIP_UI[packageId] ?? SAAS_FLAGSHIP_UI;

}



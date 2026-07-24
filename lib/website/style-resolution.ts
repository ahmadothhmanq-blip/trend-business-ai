import type { DesignStylePreset, DesignSystem } from "@/plugins/website/layers/types";
import type { WebsiteGenerationInput } from "@/plugins/website/types";

export type WebsiteColorTheme = "gold" | "blue" | "purple" | "green" | "custom";

export type WebsiteStyleIntent = {
  stylePreset: DesignStylePreset;
  colorTheme: WebsiteColorTheme;
  mode: "light" | "dark";
  colors: Partial<DesignSystem["colors"]>;
  typography?: Partial<DesignSystem["typography"]>;
  explicit: boolean;
  styleLabel: string;
  directives: string[];
};

const COLOR_THEME_ACCENTS: Record<
  WebsiteColorTheme,
  { primary: string; accent: string; secondary: string }
> = {
  gold: { primary: "#D4AF37", accent: "#C9A227", secondary: "#1A1A1A" },
  blue: { primary: "#2563EB", accent: "#22D3EE", secondary: "#0F172A" },
  purple: { primary: "#7C3AED", accent: "#A78BFA", secondary: "#312E81" },
  green: { primary: "#059669", accent: "#34D399", secondary: "#064E3B" },
  custom: { primary: "#6366F1", accent: "#818CF8", secondary: "#312E81" },
};

const LIGHT_SURFACES = {
  background: "#FFFFFF",
  foreground: "#0F172A",
  surface: "#F8FAFC",
  neutral: "#64748B",
};

const DARK_SURFACES = {
  background: "#0A0A0A",
  foreground: "#FAFAF9",
  surface: "#171717",
  neutral: "#6B7280",
};

function normalizePreset(value: string | undefined | null): DesignStylePreset | null {
  const v = String(value ?? "").toLowerCase().trim();
  if (
    v === "luxury" ||
    v === "modern" ||
    v === "corporate" ||
    v === "minimal" ||
    v === "creative" ||
    v === "tech" ||
    v === "premium-brand"
  ) {
    return v;
  }
  return null;
}

export function mapDesignStyleLabelToPreset(label: string): DesignStylePreset {
  const hay = label.toLowerCase();
  if (/luxury|premium|editorial|opulent|dark/.test(hay) && !/light/.test(hay)) return "luxury";
  if (/minimal|clean|simple|light|sparse/.test(hay)) return "minimal";
  if (/corporate|enterprise|business|professional|trust/.test(hay)) return "corporate";
  if (/startup|saas|software|tech|fintech|cyber/.test(hay)) return "tech";
  if (/creative|agency|studio|bold|playful|glass/.test(hay)) return "creative";
  if (/modern|product/.test(hay)) return "modern";
  return "modern";
}

export function mapColorThemeLabel(theme: string): WebsiteColorTheme {
  const hay = theme.toLowerCase();
  if (/gold|amber|yellow|bronze/.test(hay)) return "gold";
  if (/blue|navy|azure|cyan/.test(hay)) return "blue";
  if (/purple|violet|indigo|magenta/.test(hay)) return "purple";
  if (/green|emerald|teal|mint|sage/.test(hay)) return "green";
  return "custom";
}

function inferMode(
  theme: string,
  preset: DesignStylePreset,
  designStyle?: string,
): "light" | "dark" {
  const hay = `${theme} ${designStyle ?? ""}`.toLowerCase();
  if (/\blight\b|bright|airy|day/.test(hay)) return "light";
  if (/\bdark\b|noir|night|midnight/.test(hay)) return "dark";
  if (preset === "minimal" || preset === "corporate" || preset === "modern") return "light";
  if (preset === "luxury" || preset === "tech") return "dark";
  return "light";
}

/** Resolve user-facing theme / preset / seed colors into a concrete style intent. */
export function resolveWebsiteStyleIntent(
  input: Pick<
    WebsiteGenerationInput,
    "theme" | "designPreset" | "templateStyle" | "designSystem" | "prompt" | "mode"
  >,
): WebsiteStyleIntent {
  const theme = String(input.theme ?? "").trim();
  const prompt = String(input.prompt ?? "").trim();
  const combined = `${theme} ${input.templateStyle ?? ""} ${input.designPreset ?? ""} ${prompt}`;

  const fromPreset =
    normalizePreset(input.designPreset) ||
    normalizePreset(input.templateStyle);
  const stylePreset =
    fromPreset || mapDesignStyleLabelToPreset(combined);

  const colorTheme = mapColorThemeLabel(theme);
  const mode = inferMode(theme, stylePreset, input.templateStyle);
  const accent = COLOR_THEME_ACCENTS[colorTheme];
  const surfaces = mode === "dark" ? DARK_SURFACES : LIGHT_SURFACES;

  const seed = input.designSystem ?? {};
  const colors: Partial<DesignSystem["colors"]> = {
    primary: seed.primary || accent.primary,
    secondary: seed.secondary || accent.secondary,
    accent: seed.accent || accent.accent,
    ...surfaces,
    ...(seed.background ? { background: seed.background } : {}),
    ...(seed.foreground ? { foreground: seed.foreground } : {}),
  };

  const typography: Partial<DesignSystem["typography"]> | undefined =
    seed.displayFont || seed.bodyFont
      ? {
          ...(seed.displayFont ? { headingFont: seed.displayFont } : {}),
          ...(seed.bodyFont ? { bodyFont: seed.bodyFont } : {}),
        }
      : undefined;

  const explicit = Boolean(
    input.designPreset ||
      input.templateStyle ||
      input.designSystem?.primary ||
      input.designSystem?.background ||
      /\[design\]|color|theme|style|luxury|minimal|corporate|modern|light|dark/i.test(
        prompt,
      ),
  );

  const directives = [
    `stylePreset=${stylePreset}`,
    `colorTheme=${colorTheme}`,
    `mode=${mode}`,
    `primary=${colors.primary}`,
    `background=${colors.background}`,
    `foreground=${colors.foreground}`,
  ];

  return {
    stylePreset,
    colorTheme,
    mode,
    colors,
    typography,
    explicit,
    styleLabel: theme || stylePreset,
    directives,
  };
}

/** Apply resolved user style intent onto a design system (wins over generic luxury defaults). */
export function applyWebsiteStyleIntent<T extends DesignSystem>(
  design: T,
  intent: WebsiteStyleIntent,
): T {
  const presetColors = intent.colors;
  return {
    ...design,
    stylePreset: intent.stylePreset,
    style:
      intent.stylePreset === "luxury"
        ? "Luxury editorial"
        : intent.stylePreset === "minimal"
          ? "Minimal clean"
          : intent.stylePreset === "corporate"
            ? "Corporate trust"
            : intent.stylePreset === "tech"
              ? "Tech product"
              : intent.stylePreset === "creative"
                ? "Creative studio"
                : "Modern product",
    colors: {
      ...design.colors,
      ...presetColors,
    },
    typography: {
      ...design.typography,
      ...(intent.typography ?? {}),
    },
    layoutRules: Array.from(
      new Set([
        ...(design.layoutRules ?? []),
        `User theme: ${intent.styleLabel}`,
        `Color mode: ${intent.mode}`,
        `Palette: ${intent.colorTheme}`,
      ]),
    ).slice(0, 20),
    uiPatterns: Array.from(
      new Set([
        ...(design.uiPatterns ?? []),
        intent.mode === "dark" ? "dark-surface" : "light-surface",
        `${intent.stylePreset}-theme`,
      ]),
    ),
  };
}

export function formatStyleIntentForPrompt(intent: WebsiteStyleIntent): string {
  return [
    "MANDATORY USER STYLE REQUIREMENTS (override generic defaults):",
    `- stylePreset: "${intent.stylePreset}"`,
    `- color mode: ${intent.mode}`,
    `- color theme: ${intent.colorTheme}`,
    `- primary: ${intent.colors.primary}`,
    `- accent: ${intent.colors.accent}`,
    `- background: ${intent.colors.background}`,
    `- foreground: ${intent.colors.foreground}`,
    "- Do NOT default to dark background + gold unless theme is explicitly Gold Luxury.",
    intent.mode === "light"
      ? "- Use a light page background with dark readable text."
      : "- Use a dark page background with light readable text.",
  ].join("\n");
}

/** Map dashboard design-style picker labels to engine presets. */
export function dashboardDesignStyleToPreset(
  designStyle: string,
): DesignStylePreset {
  return mapDesignStyleLabelToPreset(designStyle);
}

/** Map dashboard color-theme picker to design-system color seeds. */
export function dashboardColorThemeToDesignSystem(
  colorTheme: string,
  designStyle: string,
): NonNullable<WebsiteGenerationInput["designSystem"]> {
  const theme = mapColorThemeLabel(colorTheme);
  const accents = COLOR_THEME_ACCENTS[theme];
  const mode = inferMode(
    `${colorTheme} ${designStyle}`,
    mapDesignStyleLabelToPreset(designStyle),
    designStyle,
  );
  const surfaces = mode === "dark" ? DARK_SURFACES : LIGHT_SURFACES;
  return {
    primary: accents.primary,
    secondary: accents.secondary,
    accent: accents.accent,
    background: surfaces.background,
    foreground: surfaces.foreground,
  };
}

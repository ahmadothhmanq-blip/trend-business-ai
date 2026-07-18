import { generateJsonWithValidation } from "@/lib/ai/generator";
import { designEnginePrompt } from "@/lib/ai/prompts/website-layers";
import { buildWebsiteIterationPrompt } from "@/plugins/website/iteration";
import { designSystemSchema } from "@/plugins/website/layers/schemas";
import type {
  DesignStylePreset,
  DesignSystem,
  WebsiteStrategy,
} from "@/plugins/website/layers/types";
import type {
  WebsiteGenerationInput,
  WebsiteProjectAnalysis,
} from "@/plugins/website/types";
import type { GenerationContext } from "@/lib/ai/types";

const STYLE_PRESETS: Record<
  DesignStylePreset,
  Pick<
    DesignSystem,
    | "style"
    | "stylePreset"
    | "colors"
    | "typography"
    | "layoutRules"
    | "layoutStyle"
    | "uiPatterns"
    | "componentPalette"
    | "spacingScale"
    | "borderRadius"
    | "shadowStyle"
  >
> = {
  luxury: {
    style: "Luxury editorial",
    stylePreset: "luxury",
    colors: {
      primary: "#D4AF37",
      secondary: "#1A1A1A",
      accent: "#C9A227",
      neutral: "#6B7280",
      surface: "#F5F5F4",
      background: "#0A0A0A",
      foreground: "#FAFAF9",
    },
    typography: {
      headingFont: "Playfair Display",
      bodyFont: "Source Sans 3",
      scale: ["text-5xl", "text-3xl", "text-xl", "text-base"],
      notes: "Serif display + refined sans body",
    },
    layoutRules: [
      "Full-bleed hero imagery",
      "Generous whitespace",
      "Gold accent CTAs",
    ],
    layoutStyle: "full-bleed cinematic hero + editorial sections",
    uiPatterns: ["Split hero", "Masonry proof", "Sticky CTA bar"],
    componentPalette: ["Hero", "Gallery", "Testimonials", "CTA", "Footer"],
    spacingScale: ["6", "10", "16", "24", "32"],
    borderRadius: "0.75rem",
    shadowStyle: "soft gold glow",
  },
  modern: {
    style: "Modern product",
    stylePreset: "modern",
    colors: {
      primary: "#2563EB",
      secondary: "#0F172A",
      accent: "#22D3EE",
      neutral: "#64748B",
      surface: "#F1F5F9",
      background: "#FFFFFF",
      foreground: "#0F172A",
    },
    typography: {
      headingFont: "Space Grotesk",
      bodyFont: "IBM Plex Sans",
      scale: ["text-4xl", "text-2xl", "text-lg", "text-base"],
      notes: "Geometric product UI typography",
    },
    layoutRules: [
      "Card grids with clear hierarchy",
      "Mobile-first breakpoints",
      "High-contrast CTAs",
    ],
    layoutStyle: "product marketing grid with feature cards",
    uiPatterns: ["Bento features", "Logo cloud", "Pricing cards"],
    componentPalette: ["Hero", "FeatureGrid", "Pricing", "FAQ", "CTA"],
    spacingScale: ["4", "8", "12", "16", "24"],
    borderRadius: "1rem",
    shadowStyle: "soft elevated",
  },
  corporate: {
    style: "Corporate trust",
    stylePreset: "corporate",
    colors: {
      primary: "#1E3A5F",
      secondary: "#334155",
      accent: "#0EA5E9",
      neutral: "#64748B",
      surface: "#F8FAFC",
      background: "#FFFFFF",
      foreground: "#0F172A",
    },
    typography: {
      headingFont: "Libre Franklin",
      bodyFont: "Source Sans 3",
      scale: ["text-4xl", "text-2xl", "text-lg", "text-base"],
      notes: "Clear institutional hierarchy",
    },
    layoutRules: [
      "Structured section rhythm",
      "Trust badges and metrics",
      "Accessible contrast",
    ],
    layoutStyle: "structured enterprise marketing layout",
    uiPatterns: ["Stats strip", "Case studies", "Contact form"],
    componentPalette: ["Hero", "Stats", "Services", "CaseStudies", "Contact"],
    spacingScale: ["4", "8", "12", "20", "28"],
    borderRadius: "0.5rem",
    shadowStyle: "subtle card",
  },
  minimal: {
    style: "Minimal clean",
    stylePreset: "minimal",
    colors: {
      primary: "#111827",
      secondary: "#374151",
      accent: "#F43F5E",
      neutral: "#9CA3AF",
      surface: "#F9FAFB",
      background: "#FFFFFF",
      foreground: "#111827",
    },
    typography: {
      headingFont: "DM Sans",
      bodyFont: "DM Sans",
      scale: ["text-4xl", "text-2xl", "text-lg", "text-base"],
      notes: "Single-family minimal system",
    },
    layoutRules: [
      "Sparse composition",
      "Strong typography hierarchy",
      "Few accent moments",
    ],
    layoutStyle: "whitespace-first single column narrative",
    uiPatterns: ["Text-led hero", "Inline CTA", "Quiet footer"],
    componentPalette: ["Hero", "Features", "Work", "About", "Contact"],
    spacingScale: ["8", "12", "16", "24", "40"],
    borderRadius: "0.25rem",
    shadowStyle: "none",
  },
  creative: {
    style: "Creative expressive",
    stylePreset: "creative",
    colors: {
      primary: "#F43F5E",
      secondary: "#0F172A",
      accent: "#A78BFA",
      neutral: "#94A3B8",
      surface: "#FFF1F2",
      background: "#FFFBF7",
      foreground: "#0F172A",
    },
    typography: {
      headingFont: "Clash Display",
      bodyFont: "Satoshi",
      scale: ["text-5xl", "text-3xl", "text-xl", "text-base"],
      notes: "Expressive display + friendly body",
    },
    layoutRules: [
      "Asymmetric hero compositions",
      "Portfolio-forward sections",
      "Strong accent moments",
    ],
    layoutStyle: "studio portfolio with offset gallery",
    uiPatterns: ["Offset gallery", "Marquee proof", "Bold CTA band"],
    componentPalette: ["Hero", "Work", "Services", "Process", "Contact"],
    spacingScale: ["4", "8", "14", "22", "36"],
    borderRadius: "1.25rem",
    shadowStyle: "colorful soft elevation",
  },
};

export function resolveStylePreset(
  theme: string,
  styleHint?: string,
): DesignStylePreset {
  const hay = `${theme} ${styleHint ?? ""}`.toLowerCase();
  if (/luxury|gold|premium|editorial|opulent/.test(hay)) return "luxury";
  if (/corporate|enterprise|business|professional|trust/.test(hay)) {
    return "corporate";
  }
  if (/minimal|clean|simple|light|sparse/.test(hay)) return "minimal";
  if (/creative|agency|studio|bold|playful|expressive/.test(hay)) {
    return "creative";
  }
  if (/modern|startup|saas|tech|product/.test(hay)) return "modern";
  return "modern";
}

function normalizeStylePreset(value: unknown): DesignStylePreset {
  const v = String(value ?? "")
    .toLowerCase()
    .trim();
  if (
    v === "luxury" ||
    v === "modern" ||
    v === "corporate" ||
    v === "minimal" ||
    v === "creative"
  ) {
    return v;
  }
  return resolveStylePreset(v);
}

function fallbackDesign(
  input: WebsiteGenerationInput,
  analysis: WebsiteProjectAnalysis,
): DesignSystem {
  const presetKey = resolveStylePreset(
    input.theme,
    analysis.designSystem?.join(" "),
  );
  const preset = STYLE_PRESETS[presetKey];
  const industry =
    analysis.businessProfile.industry.toLowerCase().replace(/\s+/g, "_") ||
    "generic";

  return {
    ...preset,
    industryPattern: industry,
  };
}

export function validateDesignSystem(value: DesignSystem): {
  valid: boolean;
  reason?: string;
} {
  if (!value.colors?.primary || !value.typography?.headingFont) {
    return { valid: false, reason: "design colors/typography required" };
  }
  return { valid: true };
}

export function designSystemToPalette(design: DesignSystem): string[] {
  return [
    design.colors.primary,
    design.colors.secondary,
    design.colors.accent,
    design.colors.neutral,
    design.colors.surface,
    design.colors.background,
    design.colors.foreground,
  ];
}

export function designSystemCssVariables(design: DesignSystem): string {
  return `:root {
  --color-primary: ${design.colors.primary};
  --color-secondary: ${design.colors.secondary};
  --color-accent: ${design.colors.accent};
  --color-neutral: ${design.colors.neutral};
  --color-surface: ${design.colors.surface};
  --color-background: ${design.colors.background};
  --color-foreground: ${design.colors.foreground};
  --font-heading: "${design.typography.headingFont}", Georgia, serif;
  --font-body: "${design.typography.bodyFont}", system-ui, sans-serif;
  --radius: ${design.borderRadius};
  --style-preset: ${design.stylePreset};
}`;
}

function coerceDesignSystem(raw: DesignSystem, input: WebsiteGenerationInput): DesignSystem {
  const stylePreset = normalizeStylePreset(
    raw.stylePreset || raw.style || input.theme,
  );
  const preset = STYLE_PRESETS[stylePreset];
  return {
    ...preset,
    ...raw,
    stylePreset,
    style: raw.style || preset.style,
    layoutStyle: raw.layoutStyle || preset.layoutStyle,
    uiPatterns:
      Array.isArray(raw.uiPatterns) && raw.uiPatterns.length
        ? raw.uiPatterns
        : preset.uiPatterns,
    colors: raw.colors ?? preset.colors,
    typography: raw.typography ?? preset.typography,
    layoutRules:
      Array.isArray(raw.layoutRules) && raw.layoutRules.length
        ? raw.layoutRules
        : preset.layoutRules,
    componentPalette:
      Array.isArray(raw.componentPalette) && raw.componentPalette.length
        ? raw.componentPalette
        : preset.componentPalette,
    spacingScale:
      Array.isArray(raw.spacingScale) && raw.spacingScale.length
        ? raw.spacingScale
        : preset.spacingScale,
    borderRadius: raw.borderRadius || preset.borderRadius,
    shadowStyle: raw.shadowStyle || preset.shadowStyle,
    industryPattern: raw.industryPattern || "generic",
  };
}

export async function buildDesignSystem(
  input: WebsiteGenerationInput,
  analysis: WebsiteProjectAnalysis,
  strategy: WebsiteStrategy,
  ctx: GenerationContext,
): Promise<DesignSystem> {
  ctx.progress.emit("Creating design system...");

  const instruction = input.continueInstruction?.toLowerCase() ?? "";
  if (
    input.mode === "continue" &&
    input.previousDesignSystem &&
    !instruction.includes("[design]") &&
    !instruction.includes("[idea]")
  ) {
    return coerceDesignSystem(input.previousDesignSystem, input);
  }

  const iterationInput = {
    ...input,
    prompt: buildWebsiteIterationPrompt(input),
  };

  try {
    const raw = await generateJsonWithValidation<DesignSystem>({
      provider: ctx.provider,
      prompt: designEnginePrompt(iterationInput, analysis, strategy),
      schema: designSystemSchema,
      maxAttempts: 3,
      validate: validateDesignSystem,
    });
    return coerceDesignSystem(raw, input);
  } catch (error) {
    console.error("design engine failed; using fallback", error);
    return fallbackDesign(input, analysis);
  }
}

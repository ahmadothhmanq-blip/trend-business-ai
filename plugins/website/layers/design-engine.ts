import { generateJsonWithValidation } from "@/lib/ai/generator";
import { designEnginePrompt } from "@/lib/ai/prompts/website-layers";
import { buildWebsiteIterationPrompt } from "@/plugins/website/iteration";
import { designSystemSchema } from "@/plugins/website/layers/schemas";
import type { DesignSystem } from "@/plugins/website/layers/types";
import type {
  WebsiteGenerationInput,
  WebsiteProjectAnalysis,
} from "@/plugins/website/types";
import type { WebsiteStrategy } from "@/plugins/website/layers/types";
import type { GenerationContext } from "@/lib/ai/types";

const INDUSTRY_DEFAULTS: Record<string, Partial<DesignSystem>> = {
  clinic: {
    style: "Calm clinical",
    industryPattern: "clinic",
    colors: {
      primary: "#0F766E",
      secondary: "#134E4A",
      accent: "#F59E0B",
      neutral: "#64748B",
      surface: "#F8FAFC",
      background: "#FFFFFF",
      foreground: "#0F172A",
    },
  },
  saas: {
    style: "Modern product",
    industryPattern: "saas",
    colors: {
      primary: "#2563EB",
      secondary: "#1E293B",
      accent: "#22D3EE",
      neutral: "#64748B",
      surface: "#F1F5F9",
      background: "#FFFFFF",
      foreground: "#0F172A",
    },
  },
  restaurant: {
    style: "Warm hospitality",
    industryPattern: "restaurant",
    colors: {
      primary: "#9A3412",
      secondary: "#1C1917",
      accent: "#D4AF37",
      neutral: "#78716C",
      surface: "#FAF7F2",
      background: "#FFFBF5",
      foreground: "#1C1917",
    },
  },
  real_estate: {
    style: "Luxury editorial",
    industryPattern: "real_estate",
    colors: {
      primary: "#D4AF37",
      secondary: "#1A1A1A",
      accent: "#C9A227",
      neutral: "#6B7280",
      surface: "#F5F5F4",
      background: "#FAFAF9",
      foreground: "#111827",
    },
  },
  portfolio: {
    style: "Minimal creative",
    industryPattern: "portfolio",
    colors: {
      primary: "#111827",
      secondary: "#374151",
      accent: "#F43F5E",
      neutral: "#9CA3AF",
      surface: "#F9FAFB",
      background: "#FFFFFF",
      foreground: "#111827",
    },
  },
};

function fallbackDesign(
  input: WebsiteGenerationInput,
  analysis: WebsiteProjectAnalysis,
): DesignSystem {
  const industryKey = analysis.businessProfile.industry
    .toLowerCase()
    .replace(/\s+/g, "_");
  const preset =
    INDUSTRY_DEFAULTS[industryKey] ||
    INDUSTRY_DEFAULTS[
      Object.keys(INDUSTRY_DEFAULTS).find((k) => industryKey.includes(k)) ?? ""
    ] ||
    INDUSTRY_DEFAULTS.saas;

  return {
    style: preset.style ?? input.theme ?? "Modern",
    industryPattern: preset.industryPattern ?? "generic",
    colors: preset.colors ?? {
      primary: "#D4AF37",
      secondary: "#1A1A1A",
      accent: "#C9A227",
      neutral: "#6B7280",
      surface: "#F5F5F4",
      background: "#FFFFFF",
      foreground: "#111827",
    },
    typography: {
      headingFont: "Playfair Display",
      bodyFont: "Source Sans 3",
      scale: ["text-4xl", "text-2xl", "text-lg", "text-base"],
      notes: "Expressive heading + readable body",
    },
    layoutRules: [
      "Full-bleed hero",
      "Single-column mobile, 12-col desktop",
      "Generous section spacing",
    ],
    componentPalette: ["Hero", "FeatureGrid", "Testimonials", "CTA", "Footer"],
    spacingScale: ["4", "8", "12", "16", "24"],
    borderRadius: "1rem",
    shadowStyle: "soft elevated",
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
}`;
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
    return input.previousDesignSystem;
  }

  const iterationInput = {
    ...input,
    prompt: buildWebsiteIterationPrompt(input),
  };

  try {
    return await generateJsonWithValidation<DesignSystem>({
      provider: ctx.provider,
      prompt: designEnginePrompt(iterationInput, analysis, strategy),
      schema: designSystemSchema,
      maxAttempts: 3,
      validate: validateDesignSystem,
    });
  } catch (error) {
    console.error("design engine failed; using fallback", error);
    return fallbackDesign(input, analysis);
  }
}

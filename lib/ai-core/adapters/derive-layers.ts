/**
 * Deterministic Core layer artifacts derived from existing plugin analyze/plan
 * outputs. Used by products that do not yet have Design Engine AI layers.
 */

import type { GenerationContext, ValidationResult } from "@/lib/ai/types";
import type {
  CoreAssetManifest,
  CoreBusinessProfile,
  CoreDesignStylePreset,
  CoreDesignSystem,
  CoreProductStrategy,
  CoreQualityReport,
} from "@/lib/ai-core/layers/types";

/** Capture last provider usage into the Core run tracker (matches AIGenerationEngine). */
export function trackProviderUsage(ctx: GenerationContext): void {
  ctx.usage.add(ctx.provider.getLastUsage?.() ?? null);
}

export function toStylePreset(style: string): CoreDesignStylePreset {
  const s = style.toLowerCase();
  if (s.includes("luxury") || s.includes("premium") || s.includes("elegant")) {
    return "luxury";
  }
  if (s.includes("corporate") || s.includes("business") || s.includes("professional")) {
    return "corporate";
  }
  if (s.includes("minimal") || s.includes("clean") || s.includes("simple")) {
    return "minimal";
  }
  if (
    s.includes("creative") ||
    s.includes("agency") ||
    s.includes("studio") ||
    s.includes("playful")
  ) {
    return "creative";
  }
  return "modern";
}

export function deriveDesignSystem(params: {
  style: string;
  colorStyle: string;
  components?: string[];
  industryPattern?: string;
}): CoreDesignSystem {
  const preset = toStylePreset(params.style);
  const colorHint = params.colorStyle.toLowerCase();
  const primary = colorHint.includes("blue")
    ? "#2563eb"
    : colorHint.includes("green")
      ? "#059669"
      : colorHint.includes("dark")
        ? "#0f172a"
        : "#111827";

  return {
    style: params.style || preset,
    stylePreset: preset,
    industryPattern: params.industryPattern || "product-saas",
    colors: {
      primary,
      secondary: "#64748b",
      accent: "#f59e0b",
      neutral: "#94a3b8",
      surface: "#f8fafc",
      background: colorHint.includes("dark") ? "#0b1220" : "#ffffff",
      foreground: colorHint.includes("dark") ? "#f8fafc" : "#0f172a",
    },
    typography: {
      headingFont: preset === "luxury" ? "Playfair Display" : "Geist",
      bodyFont: "Geist",
      scale: ["text-sm", "text-base", "text-lg", "text-2xl", "text-4xl"],
      notes: `Color style: ${params.colorStyle}`,
    },
    layoutRules: ["Responsive container", "Clear visual hierarchy", "Accessible contrast"],
    layoutStyle: preset === "minimal" ? "airy" : "structured",
    uiPatterns: ["hero", "cta", "card-grid"],
    componentPalette: params.components?.length
      ? params.components
      : ["Button", "Card", "Section", "Navbar"],
    spacingScale: ["4", "8", "12", "16", "24", "32"],
    borderRadius: preset === "minimal" ? "0.5rem" : "0.75rem",
    shadowStyle: preset === "minimal" ? "soft" : "elevated",
  };
}

export function deriveStrategyFromPages(params: {
  positioning: string;
  pages: string[];
  sections?: string[];
  ctas?: string[];
  seoFocus?: string[];
}): CoreProductStrategy {
  const pages = (params.pages.length ? params.pages : ["Home"]).map((name, i) => {
    const slug =
      name.toLowerCase() === "home" || name === "/"
        ? "/"
        : `/${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
    return {
      name,
      path: slug || `/page-${i + 1}`,
      purpose: `${name} experience`,
      keySections: (params.sections ?? []).slice(0, 4),
      primaryCta: params.ctas?.[0],
    };
  });

  const sectionPlan = (params.sections ?? pages.flatMap((p) => p.keySections))
    .slice(0, 12)
    .map((name, i) => ({
      id: `section-${i + 1}`,
      page: pages[0]?.name ?? "Home",
      name,
      goal: `Deliver ${name}`,
      contentNotes: name,
    }));

  return {
    positioning: params.positioning,
    sitemap: pages.map((p) => p.path),
    pages,
    sectionPlan,
    conversionFunnel: ["awareness", "consideration", "conversion"],
    contentStructure: params.sections?.length ? params.sections : pages.map((p) => p.name),
    contentStrategy: {
      brandVoice: "clear and confident",
      messagingPillars: pages.slice(0, 3).map((p) => p.name),
      proofPoints: [],
      objectionHandlers: [],
      seoTopics: params.seoFocus ?? [],
    },
    ctas: params.ctas?.length ? params.ctas : ["Get started"],
    seoFocus: params.seoFocus ?? [],
  };
}

export function derivePendingAssetManifest(labels: string[]): CoreAssetManifest {
  const items = (labels.length ? labels : ["Hero visual"]).slice(0, 6).map((name, i) => ({
    id: `asset-${i + 1}`,
    role: i === 0 ? ("hero" as const) : ("section" as const),
    name,
    prompt: name,
    alt: name,
    url: null,
    storagePath: null,
    status: "pending" as const,
  }));

  return {
    items,
    provider: "none",
    generatedAt: new Date().toISOString(),
  };
}

export function profileFromProductAnalysis(params: {
  projectName: string;
  industry: string;
  summary: string;
  goals?: string[];
  requiredSections?: string[];
  offer?: string;
}): CoreBusinessProfile {
  return {
    projectName: params.projectName,
    industry: params.industry,
    targetAudience: "Target customers",
    businessGoals: params.goals?.length ? params.goals : ["Launch a compelling product experience"],
    offer: params.offer || params.projectName,
    tone: "professional",
    geography: "global",
    competitors: [],
    kpis: [],
    summary: params.summary,
    requiredSections: params.requiredSections ?? [],
  };
}

export function validationToQualityReport(
  result: ValidationResult,
): CoreQualityReport {
  const issues = result.issues ?? [];
  return {
    passed: result.valid,
    dimensions: [
      {
        name: "structure",
        passed: result.valid,
        issues,
      },
    ],
    weakSections: result.filesToRegenerate ?? [],
    improveApplied: false,
    improveNotes: result.reason ? [result.reason] : undefined,
    issues,
  };
}

/** Build a Core design system from brand palette + typography plan fields. */
export function deriveDesignSystemFromBrand(params: {
  personality: string;
  colors: { name: string; hex: string }[];
  typography: { primary: string; secondary: string; notes?: string };
  industry?: string;
}): CoreDesignSystem {
  const primary =
    params.colors.find((c) => /primary/i.test(c.name))?.hex ||
    params.colors[0]?.hex ||
    "#111827";
  const secondary =
    params.colors.find((c) => /secondary/i.test(c.name))?.hex ||
    params.colors[1]?.hex ||
    "#64748b";
  const accent =
    params.colors.find((c) => /accent|highlight/i.test(c.name))?.hex ||
    params.colors[2]?.hex ||
    "#f59e0b";

  return {
    style: params.personality || "professional",
    stylePreset: toStylePreset(params.personality),
    industryPattern: params.industry || "brand",
    colors: {
      primary,
      secondary,
      accent,
      neutral: "#94a3b8",
      surface: "#f8fafc",
      background: "#ffffff",
      foreground: "#0f172a",
    },
    typography: {
      headingFont: params.typography.primary || "Geist",
      bodyFont: params.typography.secondary || "Geist",
      scale: ["text-sm", "text-base", "text-lg", "text-2xl", "text-4xl"],
      notes: params.typography.notes || "",
    },
    layoutRules: ["Consistent brand spacing", "Accessible contrast", "Clear hierarchy"],
    layoutStyle: "branded",
    uiPatterns: ["logo-lockup", "color-swatch", "type-specimen"],
    componentPalette: ["Logo", "ColorSwatch", "TypePair", "BusinessCard"],
    spacingScale: ["4", "8", "12", "16", "24", "32"],
    borderRadius: "0.5rem",
    shadowStyle: "soft",
  };
}

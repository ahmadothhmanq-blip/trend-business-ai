import { generateJsonWithValidation } from "@/lib/ai/generator";
import { websiteStrategyPrompt } from "@/lib/ai/prompts/website-layers";
import {
  buildWebsiteIterationPrompt,
  normalizeWebsiteStringList,
} from "@/plugins/website/iteration";
import { websiteStrategySchema } from "@/plugins/website/layers/schemas";
import type {
  ContentStrategy,
  StrategyPage,
  StrategySection,
  WebsiteStrategy,
} from "@/plugins/website/layers/types";
import type {
  WebsiteGenerationInput,
  WebsiteProjectAnalysis,
} from "@/plugins/website/types";
import type { GenerationContext } from "@/lib/ai/types";

function fallbackStrategy(
  input: WebsiteGenerationInput,
  analysis: WebsiteProjectAnalysis,
): WebsiteStrategy {
  const pages = (analysis.pages.length ? analysis.pages : ["Home", "About", "Contact"]).map(
    (name, i) => ({
      name,
      path: i === 0 ? "/" : `/${name.toLowerCase().replace(/\s+/g, "-")}`,
      purpose: `${name} page for ${analysis.businessProfile.industry}`,
      keySections: ["Hero", "Value", "CTA"],
      primaryCta: "Get started",
    }),
  );

  const required = Array.isArray(analysis.businessProfile.requiredSections) &&
    analysis.businessProfile.requiredSections.length
      ? analysis.businessProfile.requiredSections
      : ["Hero", "Benefits", "Social proof", "CTA"];

  const homeSections = required.slice(0, 5);
  const normalizedPages = pages.map((p, i) =>
    i === 0 ? { ...p, keySections: homeSections } : p,
  );

  const goals = Array.isArray(analysis.businessProfile.businessGoals)
    ? analysis.businessProfile.businessGoals
    : [];

  return {
    positioning: analysis.businessProfile.summary || analysis.businessProfile.offer,
    sitemap: normalizedPages.map((p) => p.path),
    pages: normalizedPages,
    sectionPlan: normalizedPages.flatMap((p) =>
      p.keySections.map((section, idx) => ({
        id: `${p.name.toLowerCase().replace(/\s+/g, "-")}-${idx}`,
        page: p.name,
        name: section,
        goal: `Support ${p.purpose}`,
        contentNotes: analysis.businessProfile.offer,
      })),
    ),
    conversionFunnel: ["Awareness", "Interest", "Conversion"],
    contentStructure: required,
    contentStrategy: {
      brandVoice: analysis.businessProfile.tone || "Professional",
      messagingPillars: goals.slice(0, 4),
      proofPoints: ["Customer outcomes", "Trusted expertise"],
      objectionHandlers: ["Clear pricing path", "Fast contact"],
      seoTopics: [analysis.businessProfile.industry, analysis.projectName].filter(
        Boolean,
      ),
      sections: [],
    },
    ctas: ["Get started", "Contact us"],
    seoFocus: [analysis.businessProfile.industry, analysis.projectName].filter(
      Boolean,
    ),
  };
}

function normalizeContentStrategy(
  raw: unknown,
  fallback: ContentStrategy,
): ContentStrategy {
  const src =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};

  // AI often puts section lists under contentStrategy.sections (string/object/null).
  const sections = normalizeWebsiteStringList(src.sections);

  const messagingPillars = normalizeWebsiteStringList(src.messagingPillars);
  const proofPoints = normalizeWebsiteStringList(src.proofPoints);
  const objectionHandlers = normalizeWebsiteStringList(src.objectionHandlers);
  const seoTopics = normalizeWebsiteStringList(src.seoTopics);

  return {
    brandVoice:
      typeof src.brandVoice === "string" && src.brandVoice.trim()
        ? src.brandVoice.trim()
        : fallback.brandVoice,
    messagingPillars: messagingPillars.length
      ? messagingPillars
      : fallback.messagingPillars,
    proofPoints: proofPoints.length ? proofPoints : fallback.proofPoints,
    objectionHandlers: objectionHandlers.length
      ? objectionHandlers
      : fallback.objectionHandlers,
    seoTopics: seoTopics.length ? seoTopics : fallback.seoTopics,
    sections,
  };
}

function normalizeStrategyPages(
  raw: unknown,
  fallback: StrategyPage[],
): StrategyPage[] {
  if (!Array.isArray(raw) || raw.length === 0) return fallback;
  const pages: StrategyPage[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const name =
      typeof row.name === "string" && row.name.trim()
        ? row.name.trim()
        : "";
    if (!name) continue;
    const path =
      typeof row.path === "string" && row.path.trim()
        ? row.path.trim()
        : `/${name.toLowerCase().replace(/\s+/g, "-")}`;
    const keySections = normalizeWebsiteStringList(row.keySections);
    pages.push({
      name,
      path,
      purpose:
        typeof row.purpose === "string" && row.purpose.trim()
          ? row.purpose.trim()
          : `${name} page`,
      keySections: keySections.length ? keySections : ["Hero", "Value", "CTA"],
      primaryCta:
        typeof row.primaryCta === "string" && row.primaryCta.trim()
          ? row.primaryCta.trim()
          : "Get started",
    });
  }
  return pages.length ? pages : fallback;
}

function normalizeSectionPlan(
  raw: unknown,
  fallback: StrategySection[],
  pages: StrategyPage[],
): StrategySection[] {
  if (Array.isArray(raw) && raw.length > 0) {
    const plan: StrategySection[] = [];
    for (const item of raw) {
      if (!item || typeof item !== "object") continue;
      const row = item as Record<string, unknown>;
      const name =
        typeof row.name === "string" && row.name.trim()
          ? row.name.trim()
          : "";
      if (!name) continue;
      const page =
        typeof row.page === "string" && row.page.trim()
          ? row.page.trim()
          : pages[0]?.name || "Home";
      plan.push({
        id:
          typeof row.id === "string" && row.id.trim()
            ? row.id.trim()
            : `${page.toLowerCase().replace(/\s+/g, "-")}-${plan.length}`,
        page,
        name,
        goal:
          typeof row.goal === "string" && row.goal.trim()
            ? row.goal.trim()
            : `Support ${page}`,
        contentNotes:
          typeof row.contentNotes === "string" ? row.contentNotes : "",
      });
    }
    if (plan.length) return plan;
  }

  return fallback.length
    ? fallback
    : pages.flatMap((p) =>
        p.keySections.map((section, idx) => ({
          id: `${p.name.toLowerCase().replace(/\s+/g, "-")}-${idx}`,
          page: p.name,
          name: section,
          goal: `Support ${p.purpose}`,
          contentNotes: "",
        })),
      );
}

/**
 * Normalize AI strategy output before any downstream iteration/spread.
 * Guards null contentStrategy and non-array contentStrategy.sections.
 */
export function coerceWebsiteStrategy(
  strategy: WebsiteStrategy,
  analysis: WebsiteProjectAnalysis,
): WebsiteStrategy {
  const fallback = fallbackStrategy(
    {
      prompt: analysis.businessProfile.summary,
      projectType: analysis.projectType,
      projectKind: "website",
      language: "English",
      theme: analysis.businessProfile.tone,
      features: analysis.features,
    },
    analysis,
  );

  const raw = (strategy ?? {}) as WebsiteStrategy & {
    contentStrategy?: ContentStrategy & { sections?: unknown };
  };

  const contentStrategy = normalizeContentStrategy(
    raw.contentStrategy,
    fallback.contentStrategy,
  );

  const pages = normalizeStrategyPages(raw.pages, fallback.pages);
  const sectionPlan = normalizeSectionPlan(
    raw.sectionPlan,
    fallback.sectionPlan,
    pages,
  );

  const contentStructureFromStrategy = normalizeWebsiteStringList(
    raw.contentStructure,
  );
  const contentStructure =
    contentStructureFromStrategy.length > 0
      ? contentStructureFromStrategy
      : contentStrategy.sections && contentStrategy.sections.length > 0
        ? contentStrategy.sections
        : fallback.contentStructure;

  const sitemap = normalizeWebsiteStringList(raw.sitemap);
  const conversionFunnel = normalizeWebsiteStringList(raw.conversionFunnel);
  const ctas = normalizeWebsiteStringList(raw.ctas);
  const seoFocus = normalizeWebsiteStringList(raw.seoFocus);

  return {
    positioning:
      typeof raw.positioning === "string" && raw.positioning.trim()
        ? raw.positioning.trim()
        : fallback.positioning,
    sitemap: sitemap.length ? sitemap : pages.map((p) => p.path),
    pages,
    sectionPlan,
    conversionFunnel: conversionFunnel.length
      ? conversionFunnel
      : fallback.conversionFunnel,
    contentStructure,
    contentStrategy: {
      ...contentStrategy,
      // Always an array so `for...of` / spread never throws.
      sections: Array.isArray(contentStrategy.sections)
        ? contentStrategy.sections
        : [],
    },
    ctas: ctas.length ? ctas : fallback.ctas,
    seoFocus: seoFocus.length ? seoFocus : fallback.seoFocus,
  };
}

export function validateWebsiteStrategy(value: WebsiteStrategy): {
  valid: boolean;
  reason?: string;
} {
  if (!value.pages?.length) {
    return { valid: false, reason: "strategy.pages required" };
  }
  if (!value.positioning?.trim()) {
    return { valid: false, reason: "strategy.positioning required" };
  }
  return { valid: true };
}

export async function buildWebsiteStrategy(
  input: WebsiteGenerationInput,
  analysis: WebsiteProjectAnalysis,
  ctx: GenerationContext,
): Promise<WebsiteStrategy> {
  ctx.progress.emit("Building strategy...");

  const instruction = input.continueInstruction?.toLowerCase() ?? "";
  if (
    input.mode === "continue" &&
    input.previousStrategy &&
    !instruction.includes("[strategy]") &&
    !instruction.includes("[idea]")
  ) {
    return coerceWebsiteStrategy(input.previousStrategy, analysis);
  }

  const iterationInput = {
    ...input,
    prompt: buildWebsiteIterationPrompt(input),
  };

  try {
    const raw = await generateJsonWithValidation<WebsiteStrategy>({
      provider: ctx.provider,
      prompt: websiteStrategyPrompt(iterationInput, analysis),
      schema: websiteStrategySchema,
      maxAttempts: 3,
      validate: validateWebsiteStrategy,
    });
    return coerceWebsiteStrategy(raw, analysis);
  } catch (error) {
    console.error("strategy layer failed; using fallback", error);
    return fallbackStrategy(input, analysis);
  }
}

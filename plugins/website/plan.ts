import type { ProjectCapabilityFlags } from "@/lib/ai/validator";
import { generateJsonWithValidation } from "@/lib/ai/generator";
import {
  inferCategoryFromPath,
  normalizeCategory,
  sortFilesByDependency,
  type PlannedFile,
} from "@/lib/ai/planner";
import {
  websiteBlueprintPrompt,
  websitePlanPrompt,
} from "@/lib/ai/prompts/website";
import { mergeProductionRequirements } from "@/lib/ai/validator";
import { capPlannedFiles, MAX_WEBSITE_FILES } from "@/lib/ai/website-scaffold";
import { sanitizeProjectPath } from "@/lib/ai/zipper";
import {
  buildWebsiteIterationPrompt,
  isWebsiteImproveMode,
  normalizeWebsiteBlueprint,
} from "@/plugins/website/iteration";
import { buildWebsiteStrategy } from "@/plugins/website/layers/strategy";
import {
  buildDesignSystem,
  designSystemToPalette,
} from "@/plugins/website/layers/design-engine";
import {
  validateWebsiteBlueprint,
  validateWebsiteDynamicPlan,
} from "@/plugins/website/pipeline-validate";
import {
  websiteBlueprintSchema,
  websiteDynamicPlanSchema,
} from "@/plugins/website/schemas";
import type {
  WebsiteGenerationInput,
  WebsitePlanResult,
  WebsiteProjectAnalysis,
  WebsiteProjectBlueprint,
  WebsiteDynamicPlan,
} from "@/plugins/website/types";
import type { GenerationContext } from "@/lib/ai/types";

export function getCapabilityFlags(
  analysis: WebsiteProjectAnalysis,
): ProjectCapabilityFlags {
  return {
    requiresAuth: analysis.requiresAuth,
    requiresDatabase: analysis.requiresDatabase,
    requiresDashboard: analysis.requiresDashboard,
    isEcommerce: analysis.isEcommerce,
    isSaas: analysis.isSaas,
    databaseProvider: analysis.databaseProvider,
  };
}

function normalizePlannedFiles(
  plan: WebsiteDynamicPlan,
  flags: ProjectCapabilityFlags,
): PlannedFile[] {
  const merged = mergeProductionRequirements(plan.files, flags).map((file) => {
    const path = sanitizeProjectPath(file.path);
    return {
      path,
      purpose: file.purpose,
      language: file.language,
      category: normalizeCategory(file.category || inferCategoryFromPath(path)),
    };
  });

  const byPath = new Map<string, PlannedFile>();
  for (const file of merged) {
    byPath.set(file.path, file);
  }

  const capped = capPlannedFiles([...byPath.values()], MAX_WEBSITE_FILES);
  return sortFilesByDependency(capped);
}

function blueprintFromStrategy(
  analysis: WebsiteProjectAnalysis,
  strategy: Awaited<ReturnType<typeof buildWebsiteStrategy>>,
  design: Awaited<ReturnType<typeof buildDesignSystem>>,
): WebsiteProjectBlueprint {
  const pages = Array.isArray(strategy.pages) ? strategy.pages : [];
  const sectionPlan = Array.isArray(strategy.sectionPlan)
    ? strategy.sectionPlan
    : [];
  const contentStructure = Array.isArray(strategy.contentStructure)
    ? strategy.contentStructure
    : Array.isArray(strategy.contentStrategy?.sections)
      ? strategy.contentStrategy.sections
      : [];
  const ctas = Array.isArray(strategy.ctas) ? strategy.ctas : [];
  const seoFocus = Array.isArray(strategy.seoFocus) ? strategy.seoFocus : [];
  const conversionFunnel = Array.isArray(strategy.conversionFunnel)
    ? strategy.conversionFunnel
    : [];
  const typeScale = Array.isArray(design.typography.scale)
    ? design.typography.scale
    : [];
  const components = Array.isArray(design.componentPalette)
    ? design.componentPalette
    : [];

  return {
    title: analysis.businessProfile.projectName || analysis.projectName,
    description:
      strategy.positioning ||
      analysis.businessProfile.summary ||
      analysis.businessProfile.offer,
    pages: pages.map((p) => p.name),
    sections: sectionPlan.map((s) => `${s.page}: ${s.name}`),
    colorPalette: designSystemToPalette(design),
    typography: [
      design.typography.headingFont,
      design.typography.bodyFont,
      ...typeScale,
    ],
    components,
    content: [
      analysis.businessProfile.offer,
      ...contentStructure,
      ...ctas,
    ],
    seo: seoFocus,
    roadmap: conversionFunnel,
  };
}

export type PlanWebsiteOptions = {
  /** When set (typically by AI Core LayerRunner), skip strategy AI call. */
  strategy?: WebsitePlanResult["strategy"];
  /** When set with strategy, skip design AI call. */
  designSystem?: WebsitePlanResult["designSystem"];
  /** AI Design Renderer Engine — concrete component paths to force into file plan. */
  designRenderComponentPaths?: string[];
};

function injectRendererComponentFiles(
  files: PlannedFile[],
  componentPaths: string[] | undefined,
): PlannedFile[] {
  const byPath = new Map(files.map((f) => [f.path, f]));
  // Shared Professional Components Library primitives.
  if (!byPath.has("components/ui/section-shell.tsx")) {
    byPath.set("components/ui/section-shell.tsx", {
      path: "components/ui/section-shell.tsx",
      purpose:
        "Reusable SectionShell primitive from Professional Components Library",
      language: "tsx",
      category: "components",
    });
  }
  if (!byPath.has("components/ui/motion.tsx")) {
    byPath.set("components/ui/motion.tsx", {
      path: "components/ui/motion.tsx",
      purpose: "Motion helper for premium section entrance animations",
      language: "tsx",
      category: "components",
    });
  }
  if (!componentPaths?.length) {
    return sortFilesByDependency(
      capPlannedFiles([...byPath.values()], MAX_WEBSITE_FILES),
    );
  }
  for (const rawPath of componentPaths.slice(0, 18)) {
    const path = sanitizeProjectPath(rawPath);
    if (!path || byPath.has(path)) continue;
    const name = path.split("/").pop()?.replace(/\.tsx?$/, "") || "section";
    byPath.set(path, {
      path,
      purpose: `Professional Components Library section (${name}) — Design Renderer`,
      language: "tsx",
      category: "components",
    });
  }
  return sortFilesByDependency(
    capPlannedFiles([...byPath.values()], MAX_WEBSITE_FILES),
  );
}

export async function planWebsite(
  input: WebsiteGenerationInput,
  analysis: WebsiteProjectAnalysis,
  ctx: GenerationContext,
  options?: PlanWebsiteOptions,
): Promise<WebsitePlanResult> {
  const iterationInput = {
    ...input,
    prompt: buildWebsiteIterationPrompt(input),
  };

  const strategy =
    options?.strategy ?? (await buildWebsiteStrategy(input, analysis, ctx));
  const designSystem =
    options?.designSystem ??
    (await buildDesignSystem(input, analysis, strategy, ctx));

  ctx.progress.emit("Creating blueprint...");

  let blueprint: WebsiteProjectBlueprint;
  try {
    const rawBlueprint = await generateJsonWithValidation<WebsiteProjectBlueprint>({
      provider: ctx.provider,
      prompt: `${websiteBlueprintPrompt(iterationInput, analysis)}

Strategy: ${JSON.stringify(strategy)}
DesignSystem: ${JSON.stringify(designSystem)}

Align blueprint pages/sections/colors/typography with Strategy and DesignSystem.
Prefer DesignSystem.componentPalette as real React components under components/sections/ and components/layout/.
Section order must follow Strategy.sectionPlan (Design Renderer output).`,
      schema: websiteBlueprintSchema,
      maxAttempts: 3,
      validate: validateWebsiteBlueprint,
    });

    blueprint = isWebsiteImproveMode(input)
      ? normalizeWebsiteBlueprint(rawBlueprint)
      : rawBlueprint;

    // Prefer design-engine tokens when AI returns weak palette.
    if (!blueprint.colorPalette?.length) {
      blueprint.colorPalette = designSystemToPalette(designSystem);
    }
    if (!blueprint.pages?.length) {
      blueprint.pages = strategy.pages.map((p) => p.name);
    }
    if (designSystem.componentPalette?.length) {
      blueprint.components = Array.from(
        new Set([
          ...(blueprint.components ?? []),
          ...designSystem.componentPalette,
        ]),
      );
    }
    if (strategy.sectionPlan?.length) {
      blueprint.sections = strategy.sectionPlan.map(
        (s) => `${s.page}: ${s.name}`,
      );
    }
  } catch (error) {
    console.error("blueprint generation failed; deriving from strategy/design", error);
    blueprint = blueprintFromStrategy(analysis, strategy, designSystem);
  }

  if (
    isWebsiteImproveMode(input) &&
    (!blueprint.pages.length || !blueprint.content.length)
  ) {
    if (!blueprint.pages.length && analysis.pages?.length) {
      blueprint.pages = [...analysis.pages];
    }
    if (!blueprint.content.length) {
      blueprint.content = [
        blueprint.description,
        input.continueInstruction?.trim() || input.prompt,
      ].filter(Boolean);
    }
  }

  ctx.progress.emit("Planning files...");

  const dynamicPlan = await generateJsonWithValidation<WebsiteDynamicPlan>({
    provider: ctx.provider,
    prompt: `${websitePlanPrompt(iterationInput, analysis, blueprint)}

Strategy sitemap: ${JSON.stringify(strategy.sitemap)}
Design pattern: ${designSystem.industryPattern}
Prefer pages matching strategy paths. Inject design tokens via app/globals.css.
Must include Design Renderer components as separate files when listed in DesignSystem.componentPalette:
${JSON.stringify(options?.designRenderComponentPaths ?? designSystem.componentPalette ?? [])}`,
    schema: websiteDynamicPlanSchema,
    maxAttempts: 3,
    validate: validateWebsiteDynamicPlan,
  });

  const flags = getCapabilityFlags(analysis);
  const filePlans = injectRendererComponentFiles(
    normalizePlannedFiles(
      {
        ...dynamicPlan,
        estimatedFileCount: Math.min(
          dynamicPlan.estimatedFileCount || MAX_WEBSITE_FILES,
          MAX_WEBSITE_FILES,
        ),
      },
      flags,
    ),
    options?.designRenderComponentPaths,
  );

  return {
    blueprint,
    dynamicPlan: {
      ...dynamicPlan,
      estimatedFileCount: filePlans.length,
      files: filePlans,
    },
    filePlans,
    flags,
    strategy,
    designSystem,
  };
}

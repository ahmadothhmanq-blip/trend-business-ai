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
  return {
    title: analysis.businessProfile.projectName || analysis.projectName,
    description:
      strategy.positioning ||
      analysis.businessProfile.summary ||
      analysis.businessProfile.offer,
    pages: strategy.pages.map((p) => p.name),
    sections: strategy.sectionPlan.map((s) => `${s.page}: ${s.name}`),
    colorPalette: designSystemToPalette(design),
    typography: [
      design.typography.headingFont,
      design.typography.bodyFont,
      ...design.typography.scale,
    ],
    components: design.componentPalette,
    content: [
      analysis.businessProfile.offer,
      ...strategy.contentStructure,
      ...strategy.ctas,
    ],
    seo: strategy.seoFocus,
    roadmap: strategy.conversionFunnel,
  };
}

export async function planWebsite(
  input: WebsiteGenerationInput,
  analysis: WebsiteProjectAnalysis,
  ctx: GenerationContext,
): Promise<WebsitePlanResult> {
  const iterationInput = {
    ...input,
    prompt: buildWebsiteIterationPrompt(input),
  };

  const strategy = await buildWebsiteStrategy(input, analysis, ctx);
  const designSystem = await buildDesignSystem(
    input,
    analysis,
    strategy,
    ctx,
  );

  ctx.progress.emit("Creating blueprint...");

  let blueprint: WebsiteProjectBlueprint;
  try {
    const rawBlueprint = await generateJsonWithValidation<WebsiteProjectBlueprint>({
      provider: ctx.provider,
      prompt: `${websiteBlueprintPrompt(iterationInput, analysis)}

Strategy: ${JSON.stringify(strategy)}
DesignSystem: ${JSON.stringify(designSystem)}

Align blueprint pages/sections/colors/typography with Strategy and DesignSystem.`,
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
Prefer pages matching strategy paths. Inject design tokens via app/globals.css.`,
    schema: websiteDynamicPlanSchema,
    maxAttempts: 3,
    validate: validateWebsiteDynamicPlan,
  });

  const flags = getCapabilityFlags(analysis);
  const filePlans = normalizePlannedFiles(
    {
      ...dynamicPlan,
      estimatedFileCount: Math.min(
        dynamicPlan.estimatedFileCount || MAX_WEBSITE_FILES,
        MAX_WEBSITE_FILES,
      ),
    },
    flags,
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

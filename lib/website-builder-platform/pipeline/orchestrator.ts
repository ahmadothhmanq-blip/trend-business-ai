/**
 * Unified Website Builder generation pipeline.
 *
 * User Prompt
 *   → Business Engine (analysis, content, SEO, brand, images)
 *   → Design Engine (template, blueprint, tokens, layout)
 *   → Layout Composer (region grid + business bindings)
 *   → Website Generator (project files)
 *   → Live Preview
 */

import type { GeneratedWebsiteProject } from "@/plugins/website/types";
import { applyTemplateV2ToProject } from "@/lib/website/template-v2/apply/apply-v2-template";
import type { WebsiteBusinessPack } from "@/lib/website-builder-platform/contracts/business-layer";
import type { WebsiteDesignPack } from "@/lib/website-builder-platform/contracts/design-layer";
import { runBusinessEngine } from "@/lib/website-builder-platform/engines/business-engine";
import { runDesignEngine } from "@/lib/website-builder-platform/engines/design-engine";
import { validateTemplatePurity } from "@/lib/website-builder-platform/validation/template-purity";
import type { CoreBrief } from "@/lib/ai-core/layers/types";

export type PipelineStage =
  | "business-analysis"
  | "content-generation"
  | "image-engine"
  | "template-intelligence"
  | "layout-composer"
  | "website-generator"
  | "validation";

export type PipelineStageResult = {
  stage: PipelineStage;
  ok: boolean;
  durationMs: number;
  message: string;
};

export type WebsiteBuilderPipelineInput = {
  prompt: string;
  templatePackageId: string;
  language?: string | null;
  brandName?: string | null;
  theme?: string | null;
  features?: string[];
  brief?: CoreBrief;
  /** Existing project for template switch (skips business re-analysis when set). */
  existingProject?: GeneratedWebsiteProject;
  onProgress?: (message: string) => void;
  onStage?: (result: PipelineStageResult) => void;
};

export type WebsiteBuilderPipelineResult = {
  project: GeneratedWebsiteProject;
  business: WebsiteBusinessPack;
  design: WebsiteDesignPack;
  stages: PipelineStageResult[];
};

function stageTimer(): { elapsed: () => number } {
  const start = Date.now();
  return { elapsed: () => Date.now() - start };
}

function stubProject(
  business: WebsiteBusinessPack,
  templatePackageId: string,
): GeneratedWebsiteProject {
  return {
    title: business.brand.name,
    description: business.seo.description,
    files: [],
    pages: business.pages.map((p) => p.slug),
    sections: business.pages.flatMap((p) => p.sections),
    colorPalette: business.intelligence.colorPalette,
    typography: business.intelligence.typography,
    components: [],
    content: [],
    seo: [business.seo.title, business.seo.description],
    settings: {
      templatePackageId,
      businessIndustry: business.intelligence.industry,
    },
    businessProfile: {
      projectName: business.brand.name,
      industry: business.intelligence.routingIndustryId,
      targetAudience: business.intelligence.audience.join(", "),
      businessGoals: business.intelligence.heroMessaging,
      offer: business.intelligence.subcategory,
      tone: business.intelligence.tone,
      geography: "",
      competitors: [],
      kpis: [],
      summary: business.intelligence.reason,
      requiredSections: business.intelligence.recommendedSections,
    },
    designSystem: undefined,
    strategy: undefined,
    seoPackage: undefined,
    assetManifest: business.images,
    roadmap: [],
    projectKind: "website",
  };
}

/**
 * Full generation pipeline — business and design layers are strictly separated.
 */
export async function runWebsiteBuilderPipeline(
  input: WebsiteBuilderPipelineInput,
): Promise<WebsiteBuilderPipelineResult> {
  const stages: PipelineStageResult[] = [];
  const report = (stage: PipelineStage, ok: boolean, timer: { elapsed: () => number }, message: string) => {
    const result: PipelineStageResult = {
      stage,
      ok,
      durationMs: timer.elapsed(),
      message,
    };
    stages.push(result);
    input.onStage?.(result);
  };

  let timer = stageTimer();
  input.onProgress?.("[pipeline] Stage 1/6 · Business Engine");
  const business = await runBusinessEngine({
    prompt: input.prompt,
    language: input.language,
    brandName: input.brandName,
    theme: input.theme,
    features: input.features,
    brief: input.brief,
    onProgress: input.onProgress,
  });
  report("business-analysis", true, timer, `Locked ${business.intelligence.industry}`);
  report("content-generation", true, timer, "Content pack ready");
  report("image-engine", true, timer, `${business.images.items.length} image slots`);

  timer = stageTimer();
  input.onProgress?.("[pipeline] Stage 2/6 · Template Intelligence");
  const baseProject = input.existingProject ?? stubProject(business, input.templatePackageId);
  report("template-intelligence", true, timer, input.templatePackageId);

  timer = stageTimer();
  input.onProgress?.("[pipeline] Stage 3/6 · Design Engine + Layout Composer");
  const design = await runDesignEngine({
    templatePackageId: input.templatePackageId,
    language: input.language,
    business,
    project: baseProject,
    seed: business.projectSeed,
    onProgress: input.onProgress,
  });
  report("layout-composer", true, timer, design.blueprint ? "Blueprint optimized" : "Legacy presentation");

  timer = stageTimer();
  input.onProgress?.("[pipeline] Stage 4/6 · Website Generator");
  const retheme = await applyTemplateV2ToProject({
    project: {
      ...baseProject,
      title: business.brand.name,
      description: business.seo.description,
      assetManifest: business.images,
      businessProfile: baseProject.businessProfile ?? {
        projectName: business.brand.name,
        industry: business.intelligence.routingIndustryId,
        targetAudience: business.intelligence.audience.join(", "),
        businessGoals: business.intelligence.heroMessaging,
        offer: business.intelligence.subcategory,
        tone: business.intelligence.tone,
        geography: "",
        competitors: [],
        kpis: [],
        summary: business.intelligence.reason,
        requiredSections: business.intelligence.recommendedSections,
      },
    },
    templatePackageId: input.templatePackageId,
    language: input.language,
  });
  report("website-generator", true, timer, `${retheme.project.files.length} files`);

  timer = stageTimer();
  input.onProgress?.("[pipeline] Stage 5/6 · Architecture validation");
  const purity = validateTemplatePurity(retheme.project.files, "production");
  report(
    "validation",
    purity.ok,
    timer,
    purity.ok
      ? "Template purity passed"
      : `${purity.violations.length} purity violations`,
  );

  return {
    project: retheme.project,
    business,
    design,
    stages,
  };
}

/**
 * Switch template — design layer only; business identity preserved.
 */
export async function switchWebsiteTemplate(
  input: Omit<WebsiteBuilderPipelineInput, "prompt"> & {
    project: GeneratedWebsiteProject;
    business: WebsiteBusinessPack;
  },
): Promise<WebsiteBuilderPipelineResult> {
  return runWebsiteBuilderPipeline({
    ...input,
    prompt: input.business.intelligence.reason,
    existingProject: input.project,
  });
}

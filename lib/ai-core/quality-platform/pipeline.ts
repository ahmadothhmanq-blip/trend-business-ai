import { performance } from "node:perf_hooks";
import { validateAccessibility } from "@/lib/ai-core/accessibility/validate";
import {
  isSemanticQualityEnabled,
  runSemanticContentQuality,
} from "@/lib/ai-core/semantic-content-quality";
import {
  isVisualDesignQualityEnabled,
  runVisualDesignQuality,
} from "@/lib/ai-core/visual-design-quality";
import { isUnifiedQualityPlatformEnabled } from "@/lib/ai-core/quality-platform/flags";
import { buildUnifiedQualityReport } from "@/lib/ai-core/quality-platform/report";
import {
  buildUnifiedRepairQueue,
  mergeWeakSections,
} from "@/lib/ai-core/quality-platform/repair-queue";
import { toQualityDashboardModel } from "@/lib/ai-core/quality-platform/dashboard";
import type {
  UnifiedQualityDashboardModel,
  UnifiedQualityReport,
} from "@/lib/ai-core/quality-platform/types";
import {
  runWebsiteQualityCheck,
} from "@/plugins/website/layers/quality";
import type { GenerationContext } from "@/lib/ai/types";
import type {
  AssetManifest,
  GeneratedProjectFile,
  QualityReport,
  WebsiteGenerationInput,
} from "@/plugins/website/types";
import type { WebsiteProjectAnalysis, WebsitePlanResult } from "@/lib/website/types";
import type { SemanticContentQualityReport } from "@/lib/ai-core/semantic-content-quality";
import type { VisualDesignQualityReport } from "@/lib/ai-core/visual-design-quality";

export type UnifiedQualityPipelineParams = {
  input: WebsiteGenerationInput;
  analysis: WebsiteProjectAnalysis;
  plan: WebsitePlanResult;
  files: GeneratedProjectFile[];
  assetManifest: AssetManifest;
  ctx: GenerationContext;
  skipImprove?: boolean;
  improveFile?: (
    instruction: string,
    files: GeneratedProjectFile[],
  ) => Promise<GeneratedProjectFile[]>;
};

export type UnifiedQualityPipelineResult = {
  files: GeneratedProjectFile[];
  qualityReport: QualityReport;
  semanticContentQualityReport?: SemanticContentQualityReport;
  visualDesignQualityReport?: VisualDesignQualityReport;
  unifiedQualityReport: UnifiedQualityReport;
  qualityDashboard: UnifiedQualityDashboardModel;
};

function mergeStructuralWithModules(
  structural: QualityReport,
  semantic?: SemanticContentQualityReport,
  visual?: VisualDesignQualityReport,
): QualityReport {
  return {
    ...structural,
    passed:
      structural.passed &&
      (semantic?.passed ?? true) &&
      (visual?.passed ?? true),
    weakSections: mergeWeakSections(structural, semantic, visual),
    issues: [
      ...structural.issues,
      ...(semantic?.issues.map((i) => i.message) ?? []),
      ...(visual?.issues.map((i) => i.message) ?? []),
    ],
  };
}

async function analyzeModules(params: UnifiedQualityPipelineParams) {
  const { input, analysis, plan, assetManifest, ctx } = params;
  const validatedFiles = params.files;

  const structural = runWebsiteQualityCheck({
    files: validatedFiles,
    strategy: plan.strategy,
    designSystem: plan.designSystem,
    assetManifest,
    pages: plan.blueprint.pages,
    requiredSections: analysis.businessProfile.requiredSections,
    language: input.language,
  });

  let semantic: SemanticContentQualityReport | undefined;
  if (isSemanticQualityEnabled()) {
    ctx.progress.emit("Running semantic content quality analysis...");
    semantic = await runSemanticContentQuality({
      files: validatedFiles,
      prompt: input.prompt,
      language: input.language,
      industryId:
        typeof input.industryId === "string" ? input.industryId : undefined,
      industry: analysis.businessProfile?.industry,
      brandName: analysis.projectName,
      seoFocus: plan.strategy?.seoFocus,
      primaryCta:
        plan.strategy?.pages?.[0]?.primaryCta ?? plan.strategy?.ctas?.[0],
      requiredSections: analysis.businessProfile.requiredSections,
      provider: ctx.provider,
    });
  }

  let visual: VisualDesignQualityReport | undefined;
  if (isVisualDesignQualityEnabled()) {
    ctx.progress.emit("Running visual design & UX quality analysis...");
    visual = runVisualDesignQuality({
      files: validatedFiles,
      designSystem: {
        colors: {
          primary: plan.designSystem?.colors?.primary,
          secondary: plan.designSystem?.colors?.secondary,
          accent: plan.designSystem?.colors?.accent,
        },
        typography: {
          headingFont: plan.designSystem?.typography?.headingFont,
          bodyFont: plan.designSystem?.typography?.bodyFont,
        },
        spacingScale: plan.designSystem?.spacingScale?.[0],
      },
      brandName: analysis.projectName,
      pages: plan.blueprint.pages,
    });
  }

  return { structural, semantic, visual };
}

/**
 * Unified Quality Pipeline — single orchestrator for all QE modules.
 */
export async function runUnifiedQualityPipeline(
  params: UnifiedQualityPipelineParams,
): Promise<UnifiedQualityPipelineResult> {
  const startedAt = performance.now();
  let files = params.files;

  if (!isUnifiedQualityPlatformEnabled()) {
    const { structural, semantic, visual } = await analyzeModules({
      ...params,
      files,
    });
    const qualityReport = mergeStructuralWithModules(structural, semantic, visual);
    const repair = buildUnifiedRepairQueue({
      structural,
      semantic,
      visual,
      language: params.input.language,
    });
    const unifiedQualityReport = buildUnifiedQualityReport({
      structural,
      semantic,
      visual,
      files,
      repairQueue: repair.items,
      repairInstruction: repair.instruction,
      dedupedCount: repair.dedupedCount,
      durationMs: Math.round(performance.now() - startedAt),
      modules: {
        structural: true,
        semantic: Boolean(semantic),
        visual: Boolean(visual),
        accessibility: true,
      },
    });
    return {
      files,
      qualityReport: {
        ...qualityReport,
        score: unifiedQualityReport.scores.overall,
      },
      semanticContentQualityReport: semantic,
      visualDesignQualityReport: visual,
      unifiedQualityReport,
      qualityDashboard: toQualityDashboardModel(unifiedQualityReport),
    };
  }

  params.ctx.progress.emit("Running unified quality pipeline...");
  let { structural, semantic, visual } = await analyzeModules({ ...params, files });

  let repair = buildUnifiedRepairQueue({
    structural,
    semantic,
    visual,
    language: params.input.language,
  });

  if (!params.skipImprove && repair.instruction && params.improveFile) {
    params.ctx.progress.emit("Improving quality via unified repair queue...");
    try {
      files = await params.improveFile(repair.instruction, files);
      ({ structural, semantic, visual } = await analyzeModules({ ...params, files }));
      structural = {
        ...structural,
        improveApplied: true,
        improveNotes: [repair.instruction],
      };
      repair = buildUnifiedRepairQueue({
        structural,
        semantic,
        visual,
        language: params.input.language,
      });
    } catch {
      structural = { ...structural, improveApplied: false };
    }
  }

  const llmCalls = semantic?.llmScore?.applied ? 1 : 0;
  const promptChars = semantic?.llmScore?.promptChars ?? 0;

  const unifiedQualityReport = buildUnifiedQualityReport({
    structural,
    semantic,
    visual,
    files,
    repairQueue: repair.items,
    repairInstruction: repair.instruction,
    dedupedCount: repair.dedupedCount,
    durationMs: Math.round(performance.now() - startedAt),
    modules: {
      structural: true,
      semantic: Boolean(semantic),
      visual: Boolean(visual),
      accessibility: true,
    },
    llmCalls,
    promptChars,
  });

  void validateAccessibility(files);

  const qualityReport: QualityReport = {
    ...mergeStructuralWithModules(structural, semantic, visual),
    score: unifiedQualityReport.scores.overall,
    seoReadinessScore: unifiedQualityReport.scores.seo,
    publishReady: unifiedQualityReport.publishReady,
    improveApplied: structural.improveApplied,
    improveNotes: structural.improveNotes,
  };

  return {
    files,
    qualityReport,
    semanticContentQualityReport: semantic,
    visualDesignQualityReport: visual,
    unifiedQualityReport,
    qualityDashboard: toQualityDashboardModel(unifiedQualityReport),
  };
}

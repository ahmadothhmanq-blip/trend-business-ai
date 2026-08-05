/**
 * TBGE Website Builder generation runner — planner, composer, assembly pipeline.
 */

import { getAIProvider } from "@/lib/ai/adapters";
import { emptyTokenUsage, mergeTokenUsage } from "@/lib/ai/usage";
import type { AIProviderName } from "@/lib/ai/types";
import { resolveTbgeProductAdapter } from "@/lib/tbge/adapters/registry";
import { defaultAssemblyEngine } from "@/lib/tbge/assembly/engine";
import { defaultComponentComposer } from "@/lib/tbge/composer/runtime";
import { resolveTbgeFlags, shouldRunTbgeComposer } from "@/lib/tbge/flags";
import {
  mapWebsiteInputToTbgeBrief,
  mapWebsiteModeToTbge,
  mapWebsiteProfileToTbge,
} from "@/lib/tbge/integration/brief-mapper";
import { buildTbgeMetrics } from "@/lib/tbge/integration/metrics";
import { createPlannerLlmClientFromProvider } from "@/lib/tbge/integration/planner-llm-client";
import { mapTbgeSpecToWebsiteProject } from "@/lib/tbge/integration/result-mapper";
import type {
  TbgeWebsiteGenerationOptions,
  TbgeWebsiteGenerationResult,
} from "@/lib/tbge/integration/types";
import { createTbgeOrchestrator, type TbgeOrchestrator } from "@/lib/tbge/kernel/orchestrator";
import { createMasterPlanner } from "@/lib/tbge/planning/master-planner";
import type { ComponentComposer } from "@/lib/tbge/composer/runtime";
import type { WebsiteGenerationInput } from "@/lib/website/types";
import type { MasterPlanIntegrationContext } from "@/lib/ai-core/generation-engine/integration/types";
import {
  createContentProviderFromAiProvider,
  parseStructuredContent,
  validateBeforeExport,
  validateStructuredContent,
  assertIntegrationValid,
} from "@/lib/ai-core/generation-engine/integration";
import {
  isProductionPipelineEnabled,
  isProductionPipelineContext,
  mergeProductionTiming,
  traceStage,
  completeTrace,
  recordValidation,
  type ProductionPipelineReports,
} from "@/lib/ai-core/generation-engine/production";

export type TbgeWebsiteGenerationDeps = {
  orchestrator?: TbgeOrchestrator;
  composer?: ComponentComposer;
  getProvider?: typeof getAIProvider;
};

export async function runTbgeWebsiteGeneration(input: {
  pluginInput: WebsiteGenerationInput;
  providerName: AIProviderName;
  options?: TbgeWebsiteGenerationOptions;
  deps?: TbgeWebsiteGenerationDeps;
  masterPlanContext?: MasterPlanIntegrationContext;
  productionReports?: ProductionPipelineReports;
}): Promise<TbgeWebsiteGenerationResult> {
  const started = performance.now();
  const flags = resolveTbgeFlags();
  const resolveProvider = input.deps?.getProvider ?? getAIProvider;
  const provider = resolveProvider(input.providerName);
  const orchestrator =
    input.deps?.orchestrator ??
    createTbgeOrchestrator({
      assemblyEngine: defaultAssemblyEngine,
      masterPlanner: createMasterPlanner({
        llmClient: createPlannerLlmClientFromProvider(provider),
      }),
      resolveAdapter: resolveTbgeProductAdapter,
    });
  const composer = input.deps?.composer ?? defaultComponentComposer;

  const progressEvents: string[] = [];
  const emit = (message: string) => {
    progressEvents.push(message);
    input.options?.onProgress?.(message);
  };

  emit("[tbge] Starting TBGE website generation");

  const metadataPatch = input.masterPlanContext?.briefMetadataPatch;
  const lockedSpec = input.masterPlanContext?.lockedSpec;

  if (input.masterPlanContext) {
    emit("[master-plan] Using Master Plan as planning authority — skipping TBGE planner");
  }

  const tbgeBuilderStarted = performance.now();
  const tbgeResult = await orchestrator.run({
    brief: mapWebsiteInputToTbgeBrief(input.pluginInput, metadataPatch),
    mode: mapWebsiteModeToTbge(input.pluginInput.mode),
    profile: mapWebsiteProfileToTbge(input.pluginInput),
    spec: lockedSpec,
    flags,
    userId: input.pluginInput.userId,
    parentRunId: input.pluginInput.parentGenerationId,
    onProgress: (event) => emit(event.message),
  });

  if (tbgeResult.status !== "completed" || !tbgeResult.spec) {
    throw new Error(
      tbgeResult.message ??
        tbgeResult.trace.error ??
        `TBGE generation failed (${tbgeResult.status})`,
    );
  }

  if (input.masterPlanContext) {
    emit("[master-plan] Executing content tasks via Content Provider...");
    const contentStarted = performance.now();
    const contentProvider = createContentProviderFromAiProvider(provider);
    const strictContent =
      isProductionPipelineEnabled() || isProductionPipelineContext(input.masterPlanContext);

    const runContent = async () => {
      const response = await contentProvider.executeContent(
        input.masterPlanContext!.contentRequest,
      );
      const structured = parseStructuredContent(response);
      if (structured) {
        assertIntegrationValid(
          validateStructuredContent(input.masterPlanContext!.masterPlan, structured),
          "structured-content",
        );
        emit(`[master-plan] Structured content validated (${structured.content.length} blocks)`);
        if (isProductionPipelineContext(input.masterPlanContext)) {
          input.masterPlanContext.structuredContent = structured;
        }
      }
      return structured;
    };

    if (strictContent) {
      if (input.productionReports) {
        traceStage(input.productionReports.trace, "structured_content", "Content Provider executing");
      }
      await runContent();
      const contentMs = performance.now() - contentStarted;
      if (input.productionReports) {
        recordValidation(input.productionReports.validation, "structured_content", true);
        traceStage(
          input.productionReports.trace,
          "structured_content",
          `Structured content validated in ${Math.round(contentMs)}ms`,
        );
        input.productionReports.timing = mergeProductionTiming(
          input.productionReports.timing,
          contentMs,
          input.productionReports.timing.builderMs,
        );
      }
    } else {
      try {
        await runContent();
      } catch (contentError) {
        emit(
          `[master-plan] Content provider skipped: ${
            contentError instanceof Error ? contentError.message : String(contentError)
          }`,
        );
      }
    }
  }

  let composition;
  if (shouldRunTbgeComposer()) {
    emit("[tbge] Running Component Composer");
    const composed = composer.compose(tbgeResult.spec);
    composition = composed.composition;
    emit(
      `[tbge] Composed ${composed.stats.sectionsComposed} sections across ${composed.stats.pagesComposed} pages`,
    );
  }

  const project = mapTbgeSpecToWebsiteProject({
    spec: tbgeResult.spec,
    files: tbgeResult.files,
    composition,
    prompt: input.pluginInput.prompt,
    settingsPatch: input.masterPlanContext?.settingsPatch,
  });

  assertIntegrationValid(validateBeforeExport(project), "pre-export");
  const builderMs = performance.now() - tbgeBuilderStarted;

  if (input.options?.onFilesCheckpoint && project.files.length > 0) {
    await input.options.onFilesCheckpoint(project.files, {
      message: "[tbge] Assembly complete",
    });
  }

  const generationTimeMs = performance.now() - started;
  const providerUsage = provider.getLastUsage?.() ?? emptyTokenUsage();

  let productionPipelineReports = input.productionReports;
  if (productionPipelineReports) {
    traceStage(productionPipelineReports.trace, "builder", "TBGE assembly complete");
    traceStage(productionPipelineReports.trace, "tbdp", "TBDP settings applied");
    traceStage(productionPipelineReports.trace, "gls", "GLS context merged");
    traceStage(productionPipelineReports.trace, "export", "Website export validated");
    completeTrace(productionPipelineReports.trace);
    productionPipelineReports = {
      ...productionPipelineReports,
      timing: mergeProductionTiming(
        productionPipelineReports.timing,
        productionPipelineReports.timing.contentMs,
        builderMs,
      ),
    };
  }

  const tbgeIntegration = buildTbgeMetrics({
    route: "tbge-primary",
    durationMs: generationTimeMs,
    llmCalls: tbgeResult.trace.llmCalls,
    files: project.files,
    composition,
    spec: tbgeResult.spec,
  });

  emit("[tbge] Generation complete");

  return {
    ...project,
    progressEvents: progressEvents as TbgeWebsiteGenerationResult["progressEvents"],
    usage: mergeTokenUsage(emptyTokenUsage(), providerUsage),
    generationTimeMs,
    provider: isProductionPipelineEnabled() ? "content-provider" : input.providerName,
    tbgeIntegration,
    tbgeSpec: tbgeResult.spec,
    tbgeComposition: composition,
    tbgeTrace: tbgeResult.trace,
    productionPipelineReports,
  };
}

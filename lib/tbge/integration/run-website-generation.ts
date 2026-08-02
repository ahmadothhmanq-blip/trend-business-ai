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

  const tbgeResult = await orchestrator.run({
    brief: mapWebsiteInputToTbgeBrief(input.pluginInput),
    mode: mapWebsiteModeToTbge(input.pluginInput.mode),
    profile: mapWebsiteProfileToTbge(input.pluginInput),
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
  });

  if (input.options?.onFilesCheckpoint && project.files.length > 0) {
    await input.options.onFilesCheckpoint(project.files, {
      message: "[tbge] Assembly complete",
    });
  }

  const generationTimeMs = performance.now() - started;
  const providerUsage = provider.getLastUsage?.() ?? emptyTokenUsage();

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
    provider: input.providerName,
    tbgeIntegration,
    tbgeSpec: tbgeResult.spec,
    tbgeComposition: composition,
    tbgeTrace: tbgeResult.trace,
  };
}

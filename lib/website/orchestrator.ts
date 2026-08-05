import { getDefaultTextProvider } from "@/lib/ai/provider-config";
import { providerManager } from "@/lib/ai/provider-manager";
import type { AIProviderName } from "@/lib/ai/types";
import { emptyTokenUsage } from "@/lib/ai/usage";
import type { TokenUsage } from "@/lib/ai/types";
import { layerRunner } from "@/lib/ai-core";
import {
  createWebsiteBuilderAdapter,
  priorArtifactsFromWebsiteInput,
  websiteInputToBrief,
} from "@/lib/ai-core/adapters/website-builder";
import {
  runWithWebsiteProfiler,
  getActiveWebsiteProfiler,
} from "@/lib/ai-core/performance/profiler-context";
import { WebsitePipelineProfiler } from "@/lib/ai-core/performance/website-profiler";
import type { PerformanceProfilingReport } from "@/lib/ai-core/performance/website-profiler";
import {
  resolveWebsiteTbgeRoute,
  runTbgeWebsiteGeneration,
} from "@/lib/tbge/integration";
import type {
  GeneratedProjectFile,
  GeneratedWebsiteProject,
  WebsiteGenerationInput,
  WebsiteGenerationProgressEvent,
} from "@/lib/website/types";
import {
  mergeTbdpSettings,
  wireWebsiteGenerationStart,
} from "@/lib/website/tbdp-wiring";
import { resolveBuilderTemplatePackageId } from "@/lib/website/builder/resolve-builder-template-package-id";
import { finalizeV2StructureAfterGeneration } from "@/lib/website/template-v2/generation/v2-generation-bridge";
import {
  isMasterPlanIntegrationEnabled,
  mergeIntegrationSettings,
  wireMasterPlanIntegration,
} from "@/lib/ai-core/generation-engine/integration";
import type { MasterPlanIntegrationContext } from "@/lib/ai-core/generation-engine/integration/types";
import {
  isProductionPipelineEnabled,
  runProductionPlanningPhase,
  type ProductionPipelineContext,
  type ProductionPipelineReports,
} from "@/lib/ai-core/generation-engine/production";

export type {
  GeneratedProjectFile,
  GeneratedWebsiteProject,
  WebsiteGenerationInput,
  WebsiteGenerationProgressEvent,
};

type GenerateWebsiteInput = WebsiteGenerationInput & {
  onProgress?: (event: string) => void;
  onFilesCheckpoint?: (
    files: GeneratedProjectFile[],
    meta: { message: string },
  ) => void | Promise<void>;
  preferredProvider?: AIProviderName;
  autoFallback?: boolean;
};

function resolvePreferredProvider(input: GenerateWebsiteInput): AIProviderName | undefined {
  const settings = providerManager.getUserSettings();
  return (
    input.preferredProvider ??
    (settings?.default_provider as AIProviderName | undefined) ??
    getDefaultTextProvider()
  );
}

function resolveProviderChain(
  preferred: AIProviderName | undefined,
  autoFallback: boolean,
): AIProviderName[] {
  const primary = providerManager.resolve(preferred);
  if (!autoFallback) {
    return primary ? [primary] : [];
  }
  return primary
    ? [primary, ...providerManager.listConfigured().filter((name) => name !== primary)]
    : providerManager.listConfigured();
}

async function applyV2StructureToGenerationResult(
  project: GeneratedWebsiteProject,
  pluginInput: WebsiteGenerationInput,
  onProgress?: (event: string) => void,
): Promise<GeneratedWebsiteProject> {
  return finalizeV2StructureAfterGeneration(project, pluginInput, onProgress);
}

/**
 * TBGE-only generation — no legacy pipeline, no fallback, errors propagate immediately.
 */
async function runTbgeOnlyGeneration(input: {
  pluginInput: WebsiteGenerationInput;
  providerName: AIProviderName;
  onProgress?: (event: string) => void;
  onFilesCheckpoint?: GenerateWebsiteInput["onFilesCheckpoint"];
  masterPlanContext?: MasterPlanIntegrationContext | ProductionPipelineContext;
  productionReports?: ProductionPipelineReports;
}) {
  const providerLabel = isProductionPipelineEnabled()
    ? "Content Provider"
    : input.providerName;
  input.onProgress?.(`[tbge] Using TBGE engine with ${providerLabel}...`);
  return runTbgeWebsiteGeneration({
    pluginInput: input.pluginInput,
    providerName: input.providerName,
    masterPlanContext: input.masterPlanContext,
    productionReports: input.productionReports,
    options: {
      onProgress: input.onProgress,
      onFilesCheckpoint: input.onFilesCheckpoint,
    },
  });
}

/**
 * Website Builder orchestration implementation.
 *
 * Canonical public API: import `generateWebsite` from `@/lib/website-generator`.
 */
export async function generateWebsite(input: GenerateWebsiteInput): Promise<
  GeneratedWebsiteProject & {
    progressEvents: WebsiteGenerationProgressEvent[];
    usage: TokenUsage;
    generationTimeMs: number;
    provider: string;
    pipelinePerformanceReport?: PerformanceProfilingReport;
    pipelinePerformanceMarkdown?: string;
    productionPipelineReports?: ProductionPipelineReports;
  }
> {
  const {
    onProgress,
    onFilesCheckpoint,
    preferredProvider,
    autoFallback,
    ...pluginInput
  } = input;

  const settings = providerManager.getUserSettings();
  const useFallback = autoFallback ?? settings?.auto_fallback ?? true;
  const preferred = resolvePreferredProvider(input);
  const providers = resolveProviderChain(preferred, useFallback);
  const route = resolveWebsiteTbgeRoute();

  const resolvedWebsiteStructureTemplateId = pluginInput.websiteStructureTemplateId
    ? resolveBuilderTemplatePackageId(pluginInput.websiteStructureTemplateId)
    : undefined;
  const resolvedTemplateId = pluginInput.templateId
    ? resolveBuilderTemplatePackageId(pluginInput.templateId)
    : resolvedWebsiteStructureTemplateId;

  const tbdpWiring = wireWebsiteGenerationStart({
    prompt: pluginInput.prompt,
    language: pluginInput.language,
    industryId: pluginInput.industryId,
    templateId: resolvedTemplateId,
    websiteStructureTemplateId: resolvedWebsiteStructureTemplateId,
    templateIntelligenceId: pluginInput.templateIntelligenceId,
    components: pluginInput.components,
    theme: pluginInput.theme,
  });

  let resolvedPluginInput = pluginInput;
  if (
    resolvedTemplateId !== pluginInput.templateId ||
    resolvedWebsiteStructureTemplateId !== pluginInput.websiteStructureTemplateId
  ) {
    resolvedPluginInput = {
      ...pluginInput,
      templateId: resolvedTemplateId,
      websiteStructureTemplateId: resolvedWebsiteStructureTemplateId,
    };
  }
  if (tbdpWiring.enabled && tbdpWiring.suggestedComponents && !resolvedPluginInput.components?.length) {
    resolvedPluginInput = {
      ...resolvedPluginInput,
      components: tbdpWiring.suggestedComponents,
    };
  }

  let masterPlanContext: MasterPlanIntegrationContext | ProductionPipelineContext | undefined;
  let productionReports: ProductionPipelineReports | undefined;

  if (isProductionPipelineEnabled()) {
    onProgress?.("[production] Running full production pipeline planning...");
    const planned = await runProductionPlanningPhase({
      pluginInput: resolvedPluginInput,
      tbdpWiring,
      onProgress,
    });
    if (!planned.ok) {
      throw new Error(
        `Production pipeline failed at ${planned.stage}: ${planned.errors.join("; ")}`,
      );
    }
    masterPlanContext = planned.context;
    productionReports = {
      trace: planned.context.trace,
      timing: planned.context.planningTiming,
      validation: planned.context.validationReport,
      quality: planned.context.qualityReport,
    };
    resolvedPluginInput = planned.context.enrichedInput;
  } else if (isMasterPlanIntegrationEnabled()) {
    onProgress?.("[master-plan] Resolving Master Plan authority...");
    const wired = await wireMasterPlanIntegration({
      pluginInput: resolvedPluginInput,
      tbdpWiring,
      onProgress,
    });
    if (!wired.ok) {
      throw new Error(
        `Master Plan integration failed: ${wired.errors.join("; ")}`,
      );
    }
    masterPlanContext = wired.context;
    resolvedPluginInput = wired.context.enrichedInput;
  }

  if (route.mode === "tbge-primary") {
    const providerName =
      providers.find((name) => providerManager.isConfigured(name)) ?? null;
    if (!providerName) {
      throw new Error(
        "No AI provider configured. Set DEEPSEEK_API_KEY to enable generation.",
      );
    }
    const connectLabel = isProductionPipelineEnabled()
      ? "Connecting to Content Provider..."
      : `Connecting to ${providerName}...`;
    onProgress?.(connectLabel);
    const tbgeResult = await runTbgeOnlyGeneration({
      pluginInput: resolvedPluginInput,
      providerName,
      onProgress,
      onFilesCheckpoint,
      masterPlanContext,
      productionReports,
    });
    const v2Project = await applyV2StructureToGenerationResult(
      tbgeResult,
      resolvedPluginInput,
      onProgress,
    );
    const mergedProject = {
      ...tbgeResult,
      ...v2Project,
      settings: mergeIntegrationSettings(
        mergeTbdpSettings(
          (v2Project.settings ?? {}) as Record<string, unknown>,
          tbdpWiring.settingsPatch,
        ),
        masterPlanContext?.settingsPatch ?? {},
      ) as GeneratedWebsiteProject["settings"],
    };
    return mergedProject;
  }

  let lastError: unknown = null;

  for (const providerName of providers) {
    if (!providerManager.isConfigured(providerName)) continue;
    try {
      const connectLabel = isProductionPipelineEnabled()
        ? "Connecting to Content Provider..."
        : `Connecting to ${providerName}...`;
      onProgress?.(connectLabel);

      const adapter = createWebsiteBuilderAdapter();
      const profiler = getActiveWebsiteProfiler() ?? new WebsitePipelineProfiler();
      profiler.snapshotMemory("generation-start");

      const runGeneration = async () =>
        profiler.measure("website-builder", "layerRunner.run", async () =>
          layerRunner.run(
            adapter,
            {
              brief: profiler.attachToBrief(websiteInputToBrief(resolvedPluginInput)),
              mode: resolvedPluginInput.mode,
              continueInstruction: resolvedPluginInput.continueInstruction,
              priorArtifacts: priorArtifactsFromWebsiteInput(resolvedPluginInput),
              userId: resolvedPluginInput.userId,
              parentRunId: resolvedPluginInput.parentGenerationId,
            },
            {
              provider: providerName,
              onProgress,
              onFilesCheckpoint,
            },
          ),
        );

      const result = getActiveWebsiteProfiler()
        ? await runGeneration()
        : await runWithWebsiteProfiler(profiler, runGeneration);

      profiler.snapshotMemory("generation-end");
      const project = result.finalOutput ?? result.generation;

      const wiredProject = tbdpWiring.enabled || masterPlanContext
        ? {
            ...project,
            settings: mergeIntegrationSettings(
              mergeTbdpSettings(
                (project.settings ?? {}) as Record<string, unknown>,
                tbdpWiring.settingsPatch,
              ),
              masterPlanContext?.settingsPatch ?? {},
            ) as GeneratedWebsiteProject["settings"],
          }
        : project;

      const v2Project = await applyV2StructureToGenerationResult(
        wiredProject,
        resolvedPluginInput,
        onProgress,
      );

      return {
        ...v2Project,
        progressEvents: result.progressEvents as WebsiteGenerationProgressEvent[],
        usage: result.usage ?? emptyTokenUsage(),
        generationTimeMs: result.generationTimeMs,
        provider: result.provider,
        pipelinePerformanceReport: profiler.toReport(),
        pipelinePerformanceMarkdown: profiler.formatMarkdownReport(),
      };
    } catch (error) {
      lastError = error;
      onProgress?.(
        error instanceof Error
          ? `${providerName} failed: ${error.message}. Trying next provider...`
          : `${providerName} failed. Trying next provider...`,
      );
    }
  }

  if (providers.length > 0 && lastError) {
    throw lastError instanceof Error
      ? lastError
      : new Error("All configured AI providers failed.");
  }

  throw new Error(
    "No AI provider configured. Set DEEPSEEK_API_KEY to enable generation.",
  );
}


import type { PlannedFile } from "@/lib/ai/planner";
import type { GeneratedProjectFile } from "@/lib/ai/types";
import type { WaveCheckpointPolicy } from "@/lib/ai-core/file-generation/types";
import {
  getProfessionalScaffoldByPath,
  hasProfessionalScaffold,
} from "@/lib/ai-core/components";
import {
  assertWavePlanCoversFiles,
  buildFileGenerationWavePlan,
  isWaveSchedulerEnabled,
  LlmConcurrencyGate,
  resolveLlmConcurrencyCap,
  runFileGenerationScheduler,
} from "@/lib/ai-core/file-generation";
import {
  composedHomePagePlaceholder,
  shouldSkipLlmForComposedHomePage,
  type WebsiteGenerationProfile,
} from "@/lib/website/generation-flags";
import {
  buildWebsiteFileTaskKindContext,
  websiteFileGenerationAdapter,
} from "@/plugins/website/file-generation-adapter";
import type {
  WebsiteGenerationInput,
  WebsitePlanResult,
  WebsiteProjectAnalysis,
} from "@/plugins/website/types";
import type { GenerationContext } from "@/lib/ai/types";

export type WebsiteFileLoopParams = {
  input: WebsiteGenerationInput;
  analysis: WebsiteProjectAnalysis;
  plan: WebsitePlanResult;
  ctx: GenerationContext;
  assetSummary: string;
  files: GeneratedProjectFile[];
  aiFilePlans: PlannedFile[];
  generationProfile: WebsiteGenerationProfile;
  minimalGeneration: boolean;
  ultraGeneration: boolean;
  localizedCopy: boolean;
  componentPaletteForCompose?: string[];
  reusePrevious: boolean;
  previousByPath: Map<string, GeneratedProjectFile>;
  generateFile: (
    filePlan: PlannedFile,
    existingFiles: GeneratedProjectFile[],
    extraValidationReason: string,
  ) => Promise<GeneratedProjectFile>;
};

type FilePlanWaveContext = {
  waveName: string;
  policy: WaveCheckpointPolicy;
};

async function processWebsiteFilePlan(
  params: WebsiteFileLoopParams,
  filePlan: PlannedFile,
  files: GeneratedProjectFile[],
  index: number,
  waveContext?: FilePlanWaveContext,
): Promise<GeneratedProjectFile | null> {
  const {
    input,
    ctx,
    aiFilePlans,
    reusePrevious,
    previousByPath,
    localizedCopy,
    componentPaletteForCompose,
    generationProfile,
    generateFile,
  } = params;

  const prior = reusePrevious ? previousByPath.get(filePlan.path) : undefined;

  if (
    input.mode === "continue" &&
    prior &&
    !input.continueInstruction?.toLowerCase().includes(filePlan.path.toLowerCase()) &&
    !input.continueInstruction?.toLowerCase().includes("[quality]") &&
    !input.continueInstruction?.toLowerCase().includes("[design]") &&
    !input.continueInstruction?.toLowerCase().includes("[strategy]")
  ) {
    ctx.progress.emit(
      `Reusing file ${index}/${aiFilePlans.length}: ${filePlan.path}`,
    );
    return prior;
  }

  if (
    !localizedCopy &&
    shouldSkipLlmForComposedHomePage({
      filePath: filePlan.path,
      componentPalette: componentPaletteForCompose,
      composePage: true,
      generationProfile,
    })
  ) {
    ctx.progress.emit(
      `Deferring home page ${index}/${aiFilePlans.length}: ${filePlan.path} (composed after sections)`,
    );
    const placeholder = composedHomePagePlaceholder(filePlan);
    const checkpointFiles = [...files, placeholder];
    try {
      await ctx.onFilesCheckpoint?.(checkpointFiles, {
        message: `Saved progress · ${checkpointFiles.length} files · ${filePlan.path} (deferred)`,
        waveCheckpoint: waveContext
          ? {
              type: "task",
              waveName: waveContext.waveName,
              policy: waveContext.policy,
            }
          : undefined,
      });
    } catch {
      // Checkpoint failures must never abort generation.
    }
    return placeholder;
  }

  const scaffold = getProfessionalScaffoldByPath(filePlan.path);
  const preferLlmCopy = localizedCopy;
  if (scaffold && hasProfessionalScaffold(filePlan.path) && !preferLlmCopy) {
    ctx.progress.emit(
      `Using Professional Components Library ${index}/${aiFilePlans.length}: ${filePlan.path}`,
    );
    return {
      path: filePlan.path,
      content: scaffold,
      language: filePlan.language || "tsx",
    };
  }

  ctx.progress.emit(
    `Generating file ${index}/${aiFilePlans.length}: ${filePlan.path}`,
  );

  const generated = await generateFile(
    filePlan,
    files,
    prior
      ? `Improve this existing file while preserving working imports:\n${prior.content.slice(0, 4000)}`
      : "",
  );

  try {
    await ctx.onFilesCheckpoint?.([...files, generated], {
      message: `Saved progress · ${files.length + 1} files · ${filePlan.path}`,
      waveCheckpoint: waveContext
        ? {
            type: "task",
            waveName: waveContext.waveName,
            policy: waveContext.policy,
          }
        : undefined,
    });
  } catch {
    // Checkpoint failures must never abort generation.
  }

  return generated;
}

/** Legacy serial file loop — default production path. */
export async function runSerialWebsiteFileLoop(
  params: WebsiteFileLoopParams,
): Promise<GeneratedProjectFile[]> {
  const files = [...params.files];
  let index = 0;

  for (const filePlan of params.aiFilePlans) {
    index += 1;
    const result = await processWebsiteFilePlan(params, filePlan, files, index);
    if (result) {
      files.push(result);
    }
  }

  return files;
}

/** Wave scheduler path (WB_WAVE_SCHEDULER=1) — W2 sections parallel in Phase 2.2. */
export async function runWaveScheduledWebsiteFileLoop(
  params: WebsiteFileLoopParams,
): Promise<GeneratedProjectFile[]> {
  const kindContext = buildWebsiteFileTaskKindContext({
    localizedCopy: params.localizedCopy,
    componentPaletteForCompose: params.componentPaletteForCompose,
    generationProfile: params.generationProfile,
    reusePrevious: params.reusePrevious,
    previousPaths: [...params.previousByPath.keys()],
    shouldDeferHomePage: (path) =>
      !params.localizedCopy &&
      shouldSkipLlmForComposedHomePage({
        filePath: path,
        componentPalette: params.componentPaletteForCompose,
        composePage: true,
        generationProfile: params.generationProfile,
      }),
  });

  const wavePlan = buildFileGenerationWavePlan({
    filePlans: params.aiFilePlans,
    adapter: websiteFileGenerationAdapter,
    kindContext,
  });

  assertWavePlanCoversFiles(params.aiFilePlans, wavePlan);

  const waveById = new Map(wavePlan.waves.map((wave) => [wave.id, wave]));

  const componentsWave = wavePlan.waves.find((wave) => wave.name === "components");
  if (params.minimalGeneration) {
    params.ctx.progress.emit(
      `[wave-scheduler] ${wavePlan.waves.length} waves · ${params.aiFilePlans.length} tasks · W2 concurrency ${componentsWave?.maxConcurrency ?? 1}`,
    );
  }

  const llmGate = new LlmConcurrencyGate({
    maxConcurrency: resolveLlmConcurrencyCap(),
    onPause: (pauseMs) => {
      params.ctx.progress.emit(
        `[wave-scheduler] Provider rate limit — cooling down ${pauseMs}ms`,
      );
    },
  });

  const schedulerResult = await runFileGenerationScheduler({
    wavePlan,
    initialFiles: params.files,
    filePlans: params.aiFilePlans,
    composeHomePage: true,
    llmGate,
    onWaveComplete: async (wave, waveFiles) => {
      try {
        await params.ctx.onFilesCheckpoint?.(waveFiles, {
          message: `Wave ${wave.name} complete · ${waveFiles.length} files`,
          waveCheckpoint: {
            type: "wave-end",
            waveName: wave.name,
            policy: wave.checkpoint,
          },
        });
      } catch {
        // Checkpoint failures must never abort generation.
      }
    },
    executeTask: async (executionContext) => {
      const filePlan = executionContext.task.plannedFile;
      const index = executionContext.taskIndex;
      const wave = waveById.get(executionContext.waveId);

      return processWebsiteFilePlan(
        params,
        filePlan,
        executionContext.contextFiles,
        index,
        wave
          ? { waveName: wave.name, policy: wave.checkpoint }
          : undefined,
      );
    },
  });

  return schedulerResult.files;
}

export async function runWebsiteFileLoop(
  params: WebsiteFileLoopParams,
): Promise<GeneratedProjectFile[]> {
  if (isWaveSchedulerEnabled()) {
    return runWaveScheduledWebsiteFileLoop(params);
  }
  return runSerialWebsiteFileLoop(params);
}

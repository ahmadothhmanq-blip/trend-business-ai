import { providerManager } from "@/lib/ai/provider-manager";
import type { AIProviderName, TokenUsage } from "@/lib/ai/types";
import { layerRunner } from "@/lib/ai-core";
import {
  createMarketingAiAdapter,
  marketingInputToBrief,
} from "@/lib/ai-core/adapters/marketing-ai";
import { getWorkspaceDefinition } from "@/lib/workspace/registry";
import type {
  WorkspaceGenerationInput,
  WorkspaceOutput,
  WorkspaceType,
} from "@/lib/workspace/types";
import type { PluginBriefInput, TextPluginOutput } from "@/plugins/types";

const DEPTH_HINTS: Record<string, string> = {
  focused: "Keep the output focused, concise, and execution-ready.",
  standard: "Balance depth and clarity for production-ready deliverables.",
  deep: "Provide board-ready depth, evidence, and detailed recommendations.",
};

function toPluginInput(input: WorkspaceGenerationInput): PluginBriefInput {
  const features = [
    ...(input.features ?? []),
    ...(input.productId ? [`product:${input.productId}`] : []),
    ...(input.depth ? [`depth:${input.depth}`] : []),
  ];

  const attachmentNotes =
    input.attachments && input.attachments.length > 0
      ? `\n\nAttached references:\n${input.attachments
          .map(
            (file) =>
              `- [${file.fileType}] ${file.fileName}${file.mimeType ? ` (${file.mimeType})` : ""}`,
          )
          .join("\n")}`
      : "";

  const depthHint = input.depth ? `\n\nDepth guidance: ${DEPTH_HINTS[input.depth]}` : "";

  let prompt = `${input.prompt}${depthHint}${attachmentNotes}`;

  if (
    (input.mode === "continue" || input.continueInstruction) &&
    input.previousOutput
  ) {
    const prior = [
      `Title: ${input.previousOutput.title}`,
      `Summary: ${input.previousOutput.summary}`,
      ...input.previousOutput.sections.map(
        (section) => `${section.heading}:\n${section.content}`,
      ),
    ].join("\n\n");

    prompt = [
      "Continue and expand the previous generation.",
      input.continueInstruction
        ? `Continue instruction: ${input.continueInstruction}`
        : "Extend with additional depth, missing sections, and actionable next steps.",
      "",
      "Previous output:",
      prior,
      "",
      "Original brief:",
      input.prompt,
    ].join("\n");
  }

  if (input.mode === "regenerate" || input.mode === "retry") {
    prompt = `${prompt}\n\nRegenerate with a fresh approach while preserving the brief intent.`;
  }

  return {
    prompt,
    language: input.language,
    theme: input.theme,
    features,
  };
}

function toWorkspaceOutput(
  result: TextPluginOutput,
  progressEvents: string[],
  source: WorkspaceOutput["source"],
  meta?: {
    productId?: string;
    depth?: WorkspaceGenerationInput["depth"];
    tokenUsage?: TokenUsage;
    generationTimeMs?: number;
    mode?: WorkspaceGenerationInput["mode"];
    continuedFrom?: string;
  },
): WorkspaceOutput {
  return {
    title: result.title,
    summary: result.summary,
    sections: result.sections,
    deliverables: result.deliverables,
    progressEvents,
    generatedAt: new Date().toISOString(),
    source,
    productId: meta?.productId,
    depth: meta?.depth,
    tokenUsage: meta?.tokenUsage,
    generationTimeMs: meta?.generationTimeMs,
    mode: meta?.mode,
    continuedFrom: meta?.continuedFrom,
  };
}

export type WorkspaceGenerationResult = {
  output: WorkspaceOutput;
  source: WorkspaceOutput["source"];
  provider: string | null;
  usage: TokenUsage;
  generationTimeMs: number;
};

export async function generateWorkspaceProject(
  workspaceType: WorkspaceType,
  input: WorkspaceGenerationInput,
  options?: { onProgress?: (event: string) => void },
): Promise<WorkspaceGenerationResult> {
  const definition = getWorkspaceDefinition(workspaceType);
  const plugin = definition.plugin;
  const preferred =
    (input.provider as AIProviderName | undefined) ?? undefined;
  const primary = providerManager.resolve(preferred);

  const providers = primary
    ? [primary, ...providerManager.listConfigured().filter((name) => name !== primary)]
    : [];

  let lastError: unknown = null;

  for (const providerName of providers) {
    if (!providerManager.isConfigured(providerName)) continue;
    try {
      options?.onProgress?.(`Connecting to ${providerName}...`);
      const pluginInput = toPluginInput(input);

      // Phase 4: Marketing AI runs through AI Core LayerRunner.
      if (workspaceType === "marketing") {
        const adapter = createMarketingAiAdapter();
        const coreResult = await layerRunner.run(
          adapter,
          {
            brief: marketingInputToBrief(pluginInput),
            mode: input.mode,
            continueInstruction: input.continueInstruction,
            userId: undefined,
            parentRunId: input.parentGenerationId,
          },
          { provider: providerName, onProgress: options?.onProgress },
        );
        const project = coreResult.finalOutput ?? coreResult.generation;
        return {
          output: toWorkspaceOutput(
            project,
            coreResult.progressEvents,
            providerName,
            {
              productId: input.productId,
              depth: input.depth,
              tokenUsage: coreResult.usage,
              generationTimeMs: coreResult.generationTimeMs,
              mode: input.mode ?? "generate",
              continuedFrom: input.parentGenerationId,
            },
          ),
          source: providerName,
          provider: providerName,
          usage: coreResult.usage,
          generationTimeMs: coreResult.generationTimeMs,
        };
      }

      const result = await providerManager.runPlugin(plugin, pluginInput, {
        provider: providerName,
        onProgress: options?.onProgress,
      });

      return {
        output: toWorkspaceOutput(result.output, result.progressEvents, providerName, {
          productId: input.productId,
          depth: input.depth,
          tokenUsage: result.usage,
          generationTimeMs: result.generationTimeMs,
          mode: input.mode ?? "generate",
          continuedFrom: input.parentGenerationId,
        }),
        source: providerName,
        provider: providerName,
        usage: result.usage,
        generationTimeMs: result.generationTimeMs,
      };
    } catch (error) {
      lastError = error;
      console.error(`[workspace:${workspaceType}] provider ${providerName} failed:`, error);
      options?.onProgress?.(
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
    "No AI provider configured. Set DEEPSEEK_API_KEY to enable workspace generation.",
  );
}

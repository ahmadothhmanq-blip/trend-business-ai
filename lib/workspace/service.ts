import { aiGenerationEngine } from "@/lib/ai/engine";
import { getWorkspaceDefinition } from "@/lib/workspace/registry";
import { generateStructuredWorkspaceOutput } from "@/lib/workspace/structured-output";
import type {
  WorkspaceGenerationInput,
  WorkspaceOutput,
  WorkspaceType,
} from "@/lib/workspace/types";
import type { PluginBriefInput, TextPluginOutput } from "@/plugins/types";

function isProviderConfigured(provider: string) {
  if (provider === "openai") return Boolean(process.env.OPENAI_API_KEY?.trim());
  if (provider === "anthropic") return Boolean(process.env.ANTHROPIC_API_KEY?.trim());
  if (provider === "deepseek") return Boolean(process.env.DEEPSEEK_API_KEY?.trim());
  return false;
}

function toPluginInput(input: WorkspaceGenerationInput): PluginBriefInput {
  return {
    prompt: input.prompt,
    language: input.language,
    theme: input.theme,
    features: input.features,
  };
}

function toWorkspaceOutput(
  result: TextPluginOutput,
  progressEvents: string[],
  source: WorkspaceOutput["source"],
): WorkspaceOutput {
  return {
    title: result.title,
    summary: result.summary,
    sections: result.sections,
    deliverables: result.deliverables,
    progressEvents,
    generatedAt: new Date().toISOString(),
    source,
  };
}

export async function generateWorkspaceProject(
  workspaceType: WorkspaceType,
  input: WorkspaceGenerationInput,
): Promise<{ output: WorkspaceOutput; source: WorkspaceOutput["source"] }> {
  const definition = getWorkspaceDefinition(workspaceType);
  const plugin = definition.plugin;

  if (isProviderConfigured(plugin.preferredProvider)) {
    try {
      const result = await aiGenerationEngine.run(
        plugin,
        toPluginInput(input),
        { provider: plugin.preferredProvider },
      );

      return {
        output: toWorkspaceOutput(
          result.output,
          result.progressEvents,
          plugin.preferredProvider,
        ),
        source: plugin.preferredProvider,
      };
    } catch (error) {
      console.error(`[workspace:${workspaceType}] engine generation failed:`, error);
    }
  }

  const output = generateStructuredWorkspaceOutput(workspaceType, input);
  return { output, source: "structured" };
}

import { AI_WORKSPACES } from "@/lib/constants/ai-workspaces";
import type { WorkspaceDefinition } from "@/lib/workspace/definition";
import { workspaceInputSchema } from "@/lib/validations/workspace";
import type { WorkspaceType } from "@/lib/workspace/types";
import type { PluginBriefInput, TextPluginOutput } from "@/plugins/types";
import type { AIPlugin } from "@/lib/ai/engine";

type WorkspaceConfigKey = keyof typeof AI_WORKSPACES;

export function createWorkspaceDefinition(args: {
  type: WorkspaceType;
  configKey: WorkspaceConfigKey;
  dashboardHref: string;
  label: string;
  plugin: AIPlugin<
    PluginBriefInput,
    Record<string, unknown>,
    Record<string, unknown>,
    TextPluginOutput
  >;
}): WorkspaceDefinition {
  const config = AI_WORKSPACES[args.configKey];

  return {
    type: args.type,
    plugin: args.plugin,
    inputSchema: workspaceInputSchema,
    metadata: {
      title: config.title,
      eyebrow: config.eyebrow,
      description: config.description,
      icon: config.icon,
      promptLabel: config.promptLabel,
      promptPlaceholder: config.promptPlaceholder,
      generateLabel: config.generateLabel,
      templates: config.templates,
      outputs: config.outputs,
      metrics: config.metrics,
      dashboardHref: args.dashboardHref,
      label: args.label,
    },
  };
}

import type { z } from "zod";
import type { AIPlugin } from "@/lib/ai/engine";
import type { WorkspaceMetadata } from "@/lib/workspace/metadata";
import type {
  WorkspaceGenerationInput,
  WorkspaceType,
} from "@/lib/workspace/types";
import type { PluginBriefInput, TextPluginOutput } from "@/plugins/types";

export type WorkspaceDefinition = {
  type: WorkspaceType;
  plugin: AIPlugin<
    PluginBriefInput,
    Record<string, unknown>,
    Record<string, unknown>,
    TextPluginOutput
  >;
  inputSchema: z.ZodType<WorkspaceGenerationInput>;
  metadata: WorkspaceMetadata;
};

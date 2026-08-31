import type { WebsiteCapabilityId } from "@/lib/website/builder/capabilities/types";
import type { WorkspaceMode } from "@/lib/website/workspace/types";

export type BuilderToolTier = "core" | "standard" | "advanced";

export type ToolVisibilityRule =
  | { mode: "always" }
  | { mode: "any"; capabilities: WebsiteCapabilityId[] }
  | { mode: "all"; capabilities: WebsiteCapabilityId[] }
  | { mode: "none"; capabilities: WebsiteCapabilityId[] };

export type BuilderToolDefinition = {
  id: string;
  labelKey: string;
  icon: string;
  tier: BuilderToolTier;
  order: number;
  visibility: ToolVisibilityRule;
  /** When set, tool only appears in this workspace mode or higher. */
  minMode?: WorkspaceMode;
};

export type ResolvedBuilderTool = {
  id: string;
  labelKey: string;
  icon: string;
  tier: BuilderToolTier;
  order: number;
  /** False when project capabilities do not unlock this tool yet. */
  enabled: boolean;
  /** Suggested copilot prompt to unlock gated tools. */
  unlockCopilotCommand?: string;
};

export type ResolvedBuilderToolbar = {
  tools: ResolvedBuilderTool[];
  capabilityIds: string[];
  resolvedAt: string;
  filtered: boolean;
};

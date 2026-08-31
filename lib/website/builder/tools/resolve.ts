import { isCapabilityToolbarEnabled } from "@/lib/website/builder/capabilities/constants";
import type { WebsiteCapabilityService } from "@/lib/website/builder/capabilities/service";
import {
  BUILDER_TOOL_REGISTRY,
  getBuilderToolRegistry,
} from "@/lib/website/builder/tools/registry";
import type {
  BuilderToolDefinition,
  ResolvedBuilderToolbar,
  ResolvedBuilderTool,
  ToolVisibilityRule,
} from "@/lib/website/builder/tools/types";
import {
  normalizeWorkspaceMode,
  type WorkspaceMode,
} from "@/lib/website/workspace/types";

function matchesWorkspaceMode(
  minMode: WorkspaceMode | undefined,
  activeMode: WorkspaceMode,
): boolean {
  if (!minMode || minMode === "beginner") return true;
  return activeMode === "pro";
}

function matchesVisibility(
  rule: ToolVisibilityRule,
  activeCapabilities: Set<string>,
): boolean {
  switch (rule.mode) {
    case "always":
      return true;
    case "any":
      return rule.capabilities.some((id) => activeCapabilities.has(id));
    case "all":
      return rule.capabilities.every((id) => activeCapabilities.has(id));
    case "none":
      return !rule.capabilities.some((id) => activeCapabilities.has(id));
    default:
      return false;
  }
}

const TOOL_UNLOCK_COMMANDS: Partial<Record<string, string>> = {
  media:
    "Add a media gallery section with optimized image placeholders and connect site images",
  professional:
    "Add testimonials, pricing table, FAQ, and portfolio sections to this website",
  business:
    "Add contact forms, booking flow, product catalog, and newsletter signup",
  enterprise:
    "Add user authentication, analytics tracking, SEO metadata, and multi-language support",
};

function toResolvedTool(
  tool: BuilderToolDefinition,
  activeCapabilities: Set<string>,
  workspaceMode: WorkspaceMode,
): ResolvedBuilderTool {
  const modeOk = matchesWorkspaceMode(tool.minMode, workspaceMode);
  const enabled =
    modeOk && matchesVisibility(tool.visibility, activeCapabilities);
  return {
    id: tool.id,
    labelKey: tool.labelKey,
    icon: tool.icon,
    tier: tool.tier,
    order: tool.order,
    enabled,
    unlockCopilotCommand: enabled ? undefined : TOOL_UNLOCK_COMMANDS[tool.id],
  };
}

function resolveActiveCapabilities(
  capabilityService: WebsiteCapabilityService,
): Set<string> {
  return new Set(capabilityService.getActiveCapabilities());
}

export type ResolveBuilderToolbarOptions = {
  registry?: BuilderToolDefinition[];
  forceLegacy?: boolean;
  workspaceMode?: WorkspaceMode;
};

export function resolveBuilderToolbar(
  capabilityService: WebsiteCapabilityService,
  options?: ResolveBuilderToolbarOptions,
): ResolvedBuilderToolbar {
  const registry = options?.registry ?? getBuilderToolRegistry();
  const filtered = isCapabilityToolbarEnabled() && !options?.forceLegacy;
  const activeCapabilities = resolveActiveCapabilities(capabilityService);
  const workspaceMode = normalizeWorkspaceMode(options?.workspaceMode);

  const tools = registry
    .map((tool) => {
      const resolved = toResolvedTool(tool, activeCapabilities, workspaceMode);
      if (!filtered) {
        return { ...resolved, enabled: true, unlockCopilotCommand: undefined };
      }
      return resolved;
    })
    .sort((a, b) => a.order - b.order);

  return {
    tools,
    capabilityIds: [...activeCapabilities],
    resolvedAt: new Date().toISOString(),
    filtered,
  };
}

/** Legacy static tool list preserved for backward compatibility. */
export function getLegacyBuilderTools(): ResolvedBuilderTool[] {
  const allCapabilities = new Set<string>();
  return BUILDER_TOOL_REGISTRY.map((tool) =>
    toResolvedTool(tool, allCapabilities, "beginner"),
  )
    .map((tool) => ({ ...tool, enabled: true }))
    .sort((a, b) => a.order - b.order);
}

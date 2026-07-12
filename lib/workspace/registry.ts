import { getWorkspaceDefinitionByType } from "@/plugins/workspace";
import type { WorkspaceDefinition } from "@/lib/workspace/definition";
import type { WorkspaceType } from "@/lib/workspace/types";

export function getWorkspaceDefinition(type: WorkspaceType): WorkspaceDefinition {
  return getWorkspaceDefinitionByType(type);
}

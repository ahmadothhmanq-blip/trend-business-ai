"use client";

import { WorkspaceTool } from "@/components/dashboard/workspace/workspace-tool";
import type { WorkspaceGeneration } from "@/types/database";

type Props = { initialGenerations?: WorkspaceGeneration[]; initialTotal?: number };

/** Preserves legacy AI Workspace strategy engine (workspace_type: manager). */
export function StrategyWorkspaceClient({ initialGenerations = [], initialTotal = 0 }: Props) {
  return (
    <WorkspaceTool
      workspaceType="manager"
      initialGenerations={initialGenerations}
      initialTotal={initialTotal}
    />
  );
}

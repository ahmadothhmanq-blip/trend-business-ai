"use client";

import { WorkspaceTool } from "@/components/dashboard/workspace/workspace-tool";
import { getProductDefinition } from "@/lib/products/registry";
import type { WorkspaceGeneration } from "@/types/database";

type Props = { initialGenerations?: WorkspaceGeneration[]; initialTotal?: number };

/** Preserves legacy AI Workspace strategy engine (workspace_type: marketing). */
export function StrategyWorkspaceClient({ initialGenerations = [], initialTotal = 0 }: Props) {
  const product = getProductDefinition("marketing-strategy");
  if (product.kind !== "workspace" || !product.workspaceType) return null;

  return (
    <WorkspaceTool
      workspaceType={product.workspaceType}
      productId="marketing-strategy"
      initialGenerations={initialGenerations}
      initialTotal={initialTotal}
    />
  );
}

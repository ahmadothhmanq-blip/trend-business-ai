"use client";

import { WorkspaceTool } from "@/components/dashboard/workspace/workspace-tool";
import { getProductDefinition } from "@/lib/products/registry";
import type { WorkspaceGeneration } from "@/types/database";

type Props = { initialGenerations?: WorkspaceGeneration[]; initialTotal?: number };

/** Client wrapper for legacy workspace tool — preserves history, export, credits. */
export function ProductEnginePageClient({ initialGenerations = [], initialTotal = 0 }: Props) {
  const product = getProductDefinition("social-media-manager");
  if (product.kind !== "workspace" || !product.workspaceType) {
    return null;
  }

  return (
    <WorkspaceTool
      workspaceType={product.workspaceType}
      productId="social-media-manager"
      initialGenerations={initialGenerations}
      initialTotal={initialTotal}
    />
  );
}

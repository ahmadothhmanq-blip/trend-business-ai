"use client";

import { ProductEnginePageClient } from "@/components/dashboard/social-media/strategy-workspace-client";
import type { WorkspaceGeneration } from "@/types/database";

type Props = { initialGenerations?: WorkspaceGeneration[] };

/** Preserves legacy AI Workspace strategy engine (workspace_type: social). */
export function StrategyWorkspace({ initialGenerations }: Props) {
  return <ProductEnginePageClient initialGenerations={initialGenerations} />;
}

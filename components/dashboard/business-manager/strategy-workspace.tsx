"use client";

import { StrategyWorkspaceClient } from "@/components/dashboard/business-manager/strategy-workspace-client";
import type { WorkspaceGeneration } from "@/types/database";

type Props = { initialGenerations?: WorkspaceGeneration[]; initialTotal?: number };

export function StrategyWorkspace(props: Props) {
  return <StrategyWorkspaceClient {...props} />;
}

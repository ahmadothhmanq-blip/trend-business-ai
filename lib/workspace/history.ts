import { getWorkspaceDefinition } from "@/lib/workspace/registry";
import type { WorkspaceType } from "@/lib/workspace/types";
import type { HistoryItem } from "@/types/database";

type WorkspaceHistoryRow = {
  id: string;
  workspace_type: WorkspaceType;
  title: string;
  brief: string;
  output: { summary?: string };
  created_at: string;
};

export function mapWorkspaceToHistoryItem(row: WorkspaceHistoryRow): HistoryItem {
  const definition = getWorkspaceDefinition(row.workspace_type);

  return {
    id: row.id,
    type: "workspace",
    title: row.title,
    description: row.output?.summary ?? row.brief,
    detail: definition.metadata.label,
    href: definition.metadata.dashboardHref,
    createdAt: row.created_at,
    workspaceType: row.workspace_type,
  };
}

export function getWorkspaceHistoryEndpoint(workspaceType: WorkspaceType) {
  return `/api/workspaces/${workspaceType}`;
}

export function getHistoryItemEndpoint(item: HistoryItem) {
  if (item.type === "workspace" && item.workspaceType) {
    return getWorkspaceHistoryEndpoint(item.workspaceType);
  }

  if (item.type === "workspace") {
    return "/api/workspaces/brand";
  }

  const endpoints = {
    idea: "/api/ideas",
    analysis: "/api/market-analysis",
    report: "/api/reports",
    website: "/api/website-builder",
  } as const;

  return endpoints[item.type];
}

/** Workspace experience mode — UI shell, not generation quality profile. */
export type WorkspaceMode = "beginner" | "pro";

export const DEFAULT_WORKSPACE_MODE: WorkspaceMode = "beginner";

export function normalizeWorkspaceMode(value?: string | null): WorkspaceMode {
  return value === "pro" ? "pro" : "beginner";
}

export function isProWorkspaceMode(value?: string | null): boolean {
  return normalizeWorkspaceMode(value) === "pro";
}

import type { OrgRole } from "@/types/platform";

/** Role/scope catalog — labels resolved via `workspaces.platform.*` locale keys. */
export const I18N_CATALOG = true as const;

export const ORG_ROLES: { id: OrgRole; labelKey: string; label: string; description: string }[] = [
  { id: "owner", labelKey: "workspaces.platform.roles.owner", label: "Owner", description: "Full access and billing management" },
  { id: "admin", labelKey: "workspaces.platform.roles.admin", label: "Admin", description: "Manage team members and settings" },
  { id: "member", labelKey: "workspaces.platform.roles.member", label: "Member", description: "Create and manage own content" },
  { id: "viewer", labelKey: "workspaces.platform.roles.viewer", label: "Viewer", description: "View-only access" },
];

export const ROLE_PERMISSIONS: Record<OrgRole, string[]> = {
  owner: ["*"],
  admin: ["manage_members", "manage_settings", "manage_api_keys", "manage_webhooks", "create", "read", "update", "delete", "export"],
  member: ["create", "read", "update", "delete", "export"],
  viewer: ["read"],
};

export const API_KEY_SCOPES = [
  { id: "read", labelKey: "workspaces.platform.apiKeyScopes.read", label: "Read", description: "Read access to data" },
  { id: "write", labelKey: "workspaces.platform.apiKeyScopes.write", label: "Write", description: "Create and update data" },
  { id: "delete", labelKey: "workspaces.platform.apiKeyScopes.delete", label: "Delete", description: "Delete data" },
  { id: "generate", labelKey: "workspaces.platform.apiKeyScopes.generate", label: "Generate", description: "Use AI generation endpoints" },
  { id: "admin", labelKey: "workspaces.platform.apiKeyScopes.admin", label: "Admin", description: "Administrative operations" },
] as const;

export const WEBHOOK_EVENTS = [
  { id: "generation.completed", labelKey: "workspaces.platform.webhookEvents.generation.completed" },
  { id: "generation.failed", labelKey: "workspaces.platform.webhookEvents.generation.failed" },
  { id: "member.invited", labelKey: "workspaces.platform.webhookEvents.member.invited" },
  { id: "member.joined", labelKey: "workspaces.platform.webhookEvents.member.joined" },
  { id: "member.removed", labelKey: "workspaces.platform.webhookEvents.member.removed" },
  { id: "api_key.created", labelKey: "workspaces.platform.webhookEvents.api_key.created" },
  { id: "export.completed", labelKey: "workspaces.platform.webhookEvents.export.completed" },
] as const;

export const NOTIFICATION_TYPE_CONFIG: Record<string, { color: string; labelKey: string; label: string }> = {
  info: { color: "bg-blue-500/15 text-blue-400", labelKey: "workspaces.platform.notificationTypes.info", label: "Info" },
  success: { color: "bg-green-500/15 text-green-400", labelKey: "workspaces.platform.notificationTypes.success", label: "Success" },
  warning: { color: "bg-yellow-500/15 text-yellow-400", labelKey: "workspaces.platform.notificationTypes.warning", label: "Warning" },
  error: { color: "bg-red-500/15 text-red-400", labelKey: "workspaces.platform.notificationTypes.error", label: "Error" },
  invite: { color: "bg-purple-500/15 text-purple-400", labelKey: "workspaces.platform.notificationTypes.invite", label: "Invitation" },
  system: { color: "bg-white/10 text-white/60", labelKey: "workspaces.platform.notificationTypes.system", label: "System" },
};

export function hasPermission(role: OrgRole, permission: string): boolean {
  const perms = ROLE_PERMISSIONS[role];
  return perms.includes("*") || perms.includes(permission);
}

export function getRoleLabel(role: OrgRole): string {
  return ORG_ROLES.find((r) => r.id === role)?.label ?? role;
}

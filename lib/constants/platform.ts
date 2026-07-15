import type { OrgRole } from "@/types/platform";

export const ORG_ROLES: { id: OrgRole; label: string; description: string }[] = [
  { id: "owner", label: "Owner", description: "Full access and billing management" },
  { id: "admin", label: "Admin", description: "Manage team members and settings" },
  { id: "member", label: "Member", description: "Create and manage own content" },
  { id: "viewer", label: "Viewer", description: "View-only access" },
];

export const ROLE_PERMISSIONS: Record<OrgRole, string[]> = {
  owner: ["*"],
  admin: ["manage_members", "manage_settings", "manage_api_keys", "manage_webhooks", "create", "read", "update", "delete", "export"],
  member: ["create", "read", "update", "delete", "export"],
  viewer: ["read"],
};

export const API_KEY_SCOPES = [
  { id: "read", label: "Read", description: "Read access to data" },
  { id: "write", label: "Write", description: "Create and update data" },
  { id: "delete", label: "Delete", description: "Delete data" },
  { id: "generate", label: "Generate", description: "Use AI generation endpoints" },
  { id: "admin", label: "Admin", description: "Administrative operations" },
] as const;

export const WEBHOOK_EVENTS = [
  { id: "generation.completed", label: "Generation Completed" },
  { id: "generation.failed", label: "Generation Failed" },
  { id: "member.invited", label: "Member Invited" },
  { id: "member.joined", label: "Member Joined" },
  { id: "member.removed", label: "Member Removed" },
  { id: "api_key.created", label: "API Key Created" },
  { id: "export.completed", label: "Export Completed" },
] as const;

export const NOTIFICATION_TYPE_CONFIG: Record<string, { color: string; label: string }> = {
  info: { color: "bg-blue-500/15 text-blue-400", label: "Info" },
  success: { color: "bg-green-500/15 text-green-400", label: "Success" },
  warning: { color: "bg-yellow-500/15 text-yellow-400", label: "Warning" },
  error: { color: "bg-red-500/15 text-red-400", label: "Error" },
  invite: { color: "bg-purple-500/15 text-purple-400", label: "Invitation" },
  system: { color: "bg-white/10 text-white/60", label: "System" },
};

export function hasPermission(role: OrgRole, permission: string): boolean {
  const perms = ROLE_PERMISSIONS[role];
  return perms.includes("*") || perms.includes(permission);
}

export function getRoleLabel(role: OrgRole): string {
  return ORG_ROLES.find((r) => r.id === role)?.label ?? role;
}

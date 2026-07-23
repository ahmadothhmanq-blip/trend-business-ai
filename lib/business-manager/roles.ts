import type { BusinessRoleType } from "@/types/business-manager";

export const ROLE_HIERARCHY: BusinessRoleType[] = ["owner", "admin", "manager", "member"];

export const ROLE_PERMISSIONS: Record<BusinessRoleType, string[]> = {
  owner: ["*"],
  admin: [
    "org:read",
    "org:write",
    "team:read",
    "team:write",
    "project:read",
    "project:write",
    "task:read",
    "task:write",
    "workflow:read",
    "workflow:write",
    "approval:read",
    "approval:write",
    "kpi:read",
    "kpi:write",
    "analytics:read",
    "ai:use",
  ],
  manager: [
    "org:read",
    "team:read",
    "team:write",
    "project:read",
    "project:write",
    "task:read",
    "task:write",
    "workflow:read",
    "workflow:write",
    "approval:read",
    "approval:write",
    "kpi:read",
    "kpi:write",
    "analytics:read",
    "ai:use",
  ],
  member: [
    "org:read",
    "team:read",
    "project:read",
    "task:read",
    "task:write",
    "workflow:read",
    "approval:read",
    "kpi:read",
    "analytics:read",
  ],
};

export function hasPermission(role: BusinessRoleType, permission: string): boolean {
  const perms = ROLE_PERMISSIONS[role] ?? [];
  return perms.includes("*") || perms.includes(permission);
}

export function canManageRole(actor: BusinessRoleType, target: BusinessRoleType): boolean {
  return ROLE_HIERARCHY.indexOf(actor) <= ROLE_HIERARCHY.indexOf(target);
}

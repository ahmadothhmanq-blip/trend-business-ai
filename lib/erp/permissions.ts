import type { ErpRoleType } from "@/types/erp";

export const ERP_ROLE_PERMISSIONS: Record<ErpRoleType, string[]> = {
  owner: ["*"],
  admin: ["finance", "inventory", "operations", "hr", "analytics", "assistant"],
  finance: ["finance", "analytics"],
  operations: ["inventory", "operations", "analytics"],
  hr: ["hr", "analytics"],
  viewer: ["analytics"],
};

export function hasErpPermission(role: ErpRoleType, permission: string): boolean {
  const perms = ERP_ROLE_PERMISSIONS[role] ?? [];
  return perms.includes("*") || perms.includes(permission);
}

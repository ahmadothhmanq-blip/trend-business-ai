import type { CRMRoleType } from "@/types/crm";

export const CRM_ROLE_PERMISSIONS: Record<CRMRoleType, string[]> = {
  owner: ["*"],
  admin: ["crm:read", "crm:write", "crm:assign", "crm:analytics", "crm:ai", "crm:automation"],
  sales: ["crm:read", "crm:write", "crm:assign", "crm:analytics", "crm:ai"],
  viewer: ["crm:read", "crm:analytics"],
};

export function hasCrmPermission(role: CRMRoleType, permission: string): boolean {
  const perms = CRM_ROLE_PERMISSIONS[role] ?? [];
  return perms.includes("*") || perms.includes(permission);
}

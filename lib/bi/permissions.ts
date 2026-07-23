export const BI_ROLE_PERMISSIONS: Record<string, string[]> = {
  owner: ["*"],
  analyst: ["read", "query", "dashboard", "report"],
  viewer: ["read", "dashboard"],
};

export function hasBiPermission(role: string, permission: string): boolean {
  const perms = BI_ROLE_PERMISSIONS[role] ?? BI_ROLE_PERMISSIONS.viewer;
  return perms.includes("*") || perms.includes(permission);
}

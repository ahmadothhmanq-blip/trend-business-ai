export const CYBER_ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: ["*"],
  analyst: ["read", "alert", "incident", "investigate", "report"],
  responder: ["read", "incident", "case", "playbook"],
  viewer: ["read"],
};

export function hasCyberPermission(role: string, permission: string): boolean {
  const perms = CYBER_ROLE_PERMISSIONS[role] ?? CYBER_ROLE_PERMISSIONS.viewer;
  return perms.includes("*") || perms.includes(permission);
}

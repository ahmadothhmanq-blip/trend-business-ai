/**
 * User roles & permissions for App Builder structured models.
 */

import type { AppRole, StructuredAppModel } from "@/lib/ai-core/app-design-platform/types";
import { slugId } from "@/lib/ai-core/app-design-platform/ids";

export function listRoles(model: StructuredAppModel): AppRole[] {
  return model.roles;
}

export function upsertRole(
  model: StructuredAppModel,
  role: Omit<AppRole, "id"> & { id?: string },
): StructuredAppModel {
  const id = role.id || slugId("role", role.name, model.roles.length);
  const next: AppRole = { ...role, id };
  const idx = model.roles.findIndex((r) => r.id === id || r.name === next.name);
  const roles =
    idx >= 0 ? model.roles.map((r, i) => (i === idx ? next : r)) : [...model.roles, next];
  return {
    ...model,
    roles,
    updatedAt: new Date().toISOString(),
    version: model.version + 1,
  };
}

export function canAccessScreen(
  model: StructuredAppModel,
  roleName: string,
  screenPath: string,
): boolean {
  const role = model.roles.find(
    (r) => r.name.toLowerCase() === roleName.toLowerCase(),
  );
  if (!role) return false;
  if (role.permissions.screens.includes("*")) return true;
  const screen = model.screens.find((s) => s.path === screenPath);
  if (!screen) return false;
  return (
    role.permissions.screens.includes(screen.path) ||
    role.permissions.screens.includes(screen.id) ||
    screen.roles.map((x) => x.toLowerCase()).includes(roleName.toLowerCase())
  );
}

export function summarizePermissions(model: StructuredAppModel): Array<{
  role: string;
  screens: number;
  actions: string[];
  dataAccess: string;
}> {
  return model.roles.map((r) => ({
    role: r.name,
    screens: r.permissions.screens.includes("*")
      ? model.screens.length
      : r.permissions.screens.length,
    actions: r.permissions.actions,
    dataAccess: r.permissions.dataAccess,
  }));
}

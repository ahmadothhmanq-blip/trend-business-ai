import { MAX_RECENT_PROJECTS } from "@/lib/website/constants";

/** Prepend or replace a project in the recent-projects list (no duplicates). */
export function upsertRecentProject<T extends { id: string }>(
  items: T[],
  project: T,
  max = MAX_RECENT_PROJECTS,
): T[] {
  return [project, ...items.filter((item) => item.id !== project.id)].slice(0, max);
}

type ProjectWithBlueprint = {
  id: string;
  generatedProject?: { files?: unknown[] } | null;
};

function hasHydratedBlueprint(project: ProjectWithBlueprint): boolean {
  return Boolean(project.generatedProject?.files?.length);
}

/**
 * Merge an API list into local Recent Projects without dropping optimistic rows
 * or hydrated blueprints that the list endpoint does not return.
 */
export function mergeRecentProjectsList<T extends ProjectWithBlueprint>(
  current: T[],
  fromApi: T[],
  options?: { ensureProject?: T; preserveLocalIds?: string[] },
): T[] {
  const preserveIds = new Set(options?.preserveLocalIds ?? []);
  if (options?.ensureProject) preserveIds.add(options.ensureProject.id);

  let merged: T[];
  if (!fromApi.length) {
    merged = current;
  } else {
    const localById = new Map(current.map((item) => [item.id, item]));
    merged = fromApi.map((apiItem) => {
      const local = localById.get(apiItem.id);
      if (local && hasHydratedBlueprint(local) && !hasHydratedBlueprint(apiItem)) {
        return { ...apiItem, generatedProject: local.generatedProject };
      }
      return apiItem;
    });
  }

  let result = merged.slice(0, MAX_RECENT_PROJECTS);

  for (const id of preserveIds) {
    const local =
      (options?.ensureProject?.id === id ? options.ensureProject : undefined) ??
      current.find((item) => item.id === id);
    if (local) {
      result = upsertRecentProject(result, local);
    }
  }

  return result;
}

import { MAX_RECENT_PROJECTS } from "@/lib/website/constants";

/** Prepend or replace a project in the recent-projects list (no duplicates). */
export function upsertRecentProject<T extends { id: string }>(
  items: T[],
  project: T,
  max = MAX_RECENT_PROJECTS,
): T[] {
  return [project, ...items.filter((item) => item.id !== project.id)].slice(0, max);
}

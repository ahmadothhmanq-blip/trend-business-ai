/** Wave name assigned by the wave planner for component files. */
export const COMPONENTS_WAVE_NAME = "components";

/** Only paths under this prefix may run in parallel (Phase 2.2). */
export const COMPONENTS_SECTIONS_PREFIX = "components/sections/";

export function isComponentsSectionsPath(path: string): boolean {
  return path.startsWith(COMPONENTS_SECTIONS_PREFIX);
}

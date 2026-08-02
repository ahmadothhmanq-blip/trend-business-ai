/**
 * TBGE run lifecycle phases.
 */

export type TbgePhase =
  | "accepted"
  | "planning"
  | "spec_locked"
  | "content_modeling"
  | "assembling"
  | "verifying"
  | "repairing"
  | "quality"
  | "finalizing"
  | "completed"
  | "failed";

const ORDERED_PHASES: TbgePhase[] = [
  "accepted",
  "planning",
  "spec_locked",
  "content_modeling",
  "assembling",
  "verifying",
  "repairing",
  "quality",
  "finalizing",
  "completed",
];

export function phaseIndex(phase: TbgePhase): number {
  const index = ORDERED_PHASES.indexOf(phase);
  return index === -1 ? -1 : index;
}

export function canTransition(from: TbgePhase, to: TbgePhase): boolean {
  if (from === "failed" || from === "completed") return false;
  if (to === "failed") return true;
  const fromIdx = phaseIndex(from);
  const toIdx = phaseIndex(to);
  if (fromIdx === -1 || toIdx === -1) return false;
  return toIdx >= fromIdx;
}

export function nextPhase(current: TbgePhase): TbgePhase | null {
  const idx = phaseIndex(current);
  if (idx === -1 || idx >= ORDERED_PHASES.length - 1) return null;
  return ORDERED_PHASES[idx + 1] ?? null;
}

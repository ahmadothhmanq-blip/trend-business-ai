/**
 * User-facing Core pipeline steps for One Prompt Experience (Phase 9).
 * Maps LayerRunner layers into a simpler progress story.
 */

import type { TranslateFn } from "@/lib/i18n/translate";

export type CoreUxStepId =
  | "idea"
  | "strategy"
  | "design"
  | "assets"
  | "generation"
  | "quality"
  | "ready";

export type CoreUxStep = {
  id: CoreUxStepId;
  label: string;
  description: string;
};

export const CORE_UX_STEP_IDS: CoreUxStepId[] = [
  "idea",
  "strategy",
  "design",
  "assets",
  "generation",
  "quality",
  "ready",
];

export function buildCoreUxSteps(
  t: TranslateFn,
  scope = "dashboard.onePrompt.steps",
): CoreUxStep[] {
  return CORE_UX_STEP_IDS.map((id) => ({
    id,
    label: t(`${scope}.${id}.label`),
    description: t(`${scope}.${id}.description`),
  }));
}

const LAYER_TO_STEP: Record<string, CoreUxStepId> = {
  start: "idea",
  template: "idea",
  idea: "idea",
  strategy: "strategy",
  design: "design",
  assets: "assets",
  generation: "generation",
  quality: "quality",
  seo: "quality",
  performance: "quality",
  finalize: "ready",
  done: "ready",
};

export function stepIndex(id: CoreUxStepId): number {
  return CORE_UX_STEP_IDS.findIndex((s) => s === id);
}

/** Parse LayerRunner-style `[layer] message` progress lines. */
export function resolveStepFromEvents(events: string[]): CoreUxStepId {
  let current: CoreUxStepId = "idea";
  for (const event of events) {
    const match = event.match(/^\[([a-z]+)\]/i);
    if (!match) continue;
    const mapped = LAYER_TO_STEP[match[1].toLowerCase()];
    if (mapped) current = mapped;
  }
  return current;
}

/** Advance simulated progress while a request is in flight (no live SSE). */
export function simulatedStepAt(elapsedMs: number, active: boolean): CoreUxStepId {
  if (!active) return "ready";
  const schedule: { at: number; step: CoreUxStepId }[] = [
    { at: 0, step: "idea" },
    { at: 4_000, step: "strategy" },
    { at: 10_000, step: "design" },
    { at: 18_000, step: "assets" },
    { at: 28_000, step: "generation" },
    { at: 55_000, step: "quality" },
  ];
  let step: CoreUxStepId = "idea";
  for (const entry of schedule) {
    if (elapsedMs >= entry.at) step = entry.step;
  }
  return step;
}

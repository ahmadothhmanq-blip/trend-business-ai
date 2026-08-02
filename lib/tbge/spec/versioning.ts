/**
 * GenerationSpec versioning and continue/improve deltas (Sprint 1 contracts only).
 */

import { GENERATION_SPEC_VERSION } from "@/lib/tbge/spec/types";
import type { ContentModel, GenerationSpec } from "@/lib/tbge/spec/types";

export type SpecDelta = {
  specVersion: typeof GENERATION_SPEC_VERSION;
  baseSpecId: string;
  basePromptHash: string;
  /** Partial content overlay for continue/improve modes. */
  contentPatch?: Partial<ContentModel>;
  /** Replace structure pages when strategy changes are requested. */
  structurePatch?: Partial<GenerationSpec["structure"]>;
  /** Instruction tags e.g. [strategy], [design] */
  instructionTags?: string[];
  appliedAt?: string;
};

export function createSpecDelta(
  base: Pick<GenerationSpec, "specId" | "promptHash">,
  patch: Omit<SpecDelta, "specVersion" | "baseSpecId" | "basePromptHash">,
): SpecDelta {
  return {
    specVersion: GENERATION_SPEC_VERSION,
    baseSpecId: base.specId,
    basePromptHash: base.promptHash,
    ...patch,
    appliedAt: patch.appliedAt ?? new Date().toISOString(),
  };
}

export function requiresFullReplan(delta: SpecDelta): boolean {
  const tags = delta.instructionTags ?? [];
  return tags.some((tag) => /\[idea\]|\[strategy\]/i.test(tag));
}

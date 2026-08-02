/**
 * Deterministic GenerationSpec builder — no LLM.
 */

import { randomUUID } from "node:crypto";
import type { TbgeProductAdapter } from "@/lib/tbge/adapters/types";
import { resolveFileGraphForAdapter } from "@/lib/tbge/planning/file-graph";
import type { PlanDraft } from "@/lib/tbge/planning/plan-draft";
import { hashPrompt } from "@/lib/tbge/spec/lock";
import { GENERATION_SPEC_VERSION, type GenerationSpec, type TbgeProductId, type TbgeGenerationProfile, type TbgeRunMode } from "@/lib/tbge/spec/types";

export type BuildGenerationSpecInput = {
  draft: PlanDraft;
  adapter: TbgeProductAdapter;
  productId: TbgeProductId;
  profile: TbgeGenerationProfile;
  mode: TbgeRunMode;
  prompt: string;
  plannerModel?: string;
};

export function buildGenerationSpecFromDraft(input: BuildGenerationSpecInput): GenerationSpec {
  const promptHash = hashPrompt(input.prompt);
  const fileGraph = resolveFileGraphForAdapter(input.adapter);

  const base: GenerationSpec = {
    specVersion: GENERATION_SPEC_VERSION,
    specId: `spec-${randomUUID()}`,
    promptHash,
    productId: input.productId,
    profile: input.profile,
    mode: input.mode,
    locale: input.draft.locale,
    business: input.draft.business,
    structure: input.draft.structure,
    design: input.draft.design,
    capabilities: input.draft.capabilities,
    fileGraph,
    provenance: {
      lockedAt: "",
      promptHash,
      plannerModel: input.plannerModel,
    },
  };

  return base;
}

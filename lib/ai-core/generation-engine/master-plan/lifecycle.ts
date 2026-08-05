import type { MasterPlanPipelineStage } from "@/lib/ai-core/generation-engine/master-plan/types";

export type MasterPlanLifecyclePhase = {
  stage: MasterPlanPipelineStage;
  label: string;
  description: string;
  usesLlm: boolean;
  owner: "tbge" | "master-plan" | "llm" | "builder";
};

/** Official Master Plan lifecycle. */
export const MASTER_PLAN_LIFECYCLE: readonly MasterPlanLifecyclePhase[] = [
  {
    stage: "tbge_analysis",
    label: "TBGE Analysis",
    description: "Intent, business, requirements, website, pages, sections, content — no LLM",
    usesLlm: false,
    owner: "tbge",
  },
  {
    stage: "master_plan_build",
    label: "Master Plan Builder",
    description: "Build authoritative Master Plan — Single Source of Truth",
    usesLlm: false,
    owner: "master-plan",
  },
  {
    stage: "master_plan_validate",
    label: "Master Plan Validation",
    description: "Validate industry, language, pages, sections, SEO, accessibility, business logic",
    usesLlm: false,
    owner: "master-plan",
  },
  {
    stage: "llm_request",
    label: "LLM Request Builder",
    description: "Build copy-only execution request — LLM never receives raw user prompt",
    usesLlm: false,
    owner: "master-plan",
  },
  {
    stage: "structured_content",
    label: "Structured Content",
    description: "LLM writes copy only — headlines, descriptions, FAQs, meta, marketing text",
    usesLlm: true,
    owner: "llm",
  },
] as const;

export function getMasterPlanLifecyclePhase(
  stage: MasterPlanPipelineStage,
): MasterPlanLifecyclePhase | undefined {
  return MASTER_PLAN_LIFECYCLE.find((p) => p.stage === stage);
}

export function masterPlanToSettingsPatch(meta: {
  planHash: string;
  schemaVersion: string;
}): Record<string, string> {
  return {
    masterPlanHash: meta.planHash,
    masterPlanSchemaVersion: meta.schemaVersion,
    masterPlanProviderIndependent: "true",
  };
}

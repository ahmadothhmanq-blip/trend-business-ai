/**
 * PlanDraft — intermediate representation produced by the Master Planner LLM.
 * Converted deterministically into a locked GenerationSpec.
 */

import type {
  GenerationSpecBusiness,
  GenerationSpecCapabilities,
  GenerationSpecDesign,
  GenerationSpecLocale,
  ProductStructure,
} from "@/lib/tbge/spec/types";

export type PlanDraft = {
  business: GenerationSpecBusiness;
  locale: GenerationSpecLocale;
  structure: ProductStructure;
  design: GenerationSpecDesign;
  capabilities: GenerationSpecCapabilities;
};

export function isPlanDraft(value: unknown): value is PlanDraft {
  if (!value || typeof value !== "object") return false;
  const row = value as Partial<PlanDraft>;
  return (
    Boolean(row.business?.name) &&
    Boolean(row.locale?.language) &&
    Boolean(row.structure) &&
    Boolean(row.design?.templateId) &&
    Boolean(row.capabilities)
  );
}

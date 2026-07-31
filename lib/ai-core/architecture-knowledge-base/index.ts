// EDS-001 Phase A.75 — Architecture Knowledge Base (AKB)
export type {
  ArchitectureKnowledgeEntry,
  BusinessRulesKnowledgeEntry,
  ExplainableLookup,
  IndustryKnowledgeEntry,
  KnowledgeEntryBase,
  KnowledgeEntryKind,
  KnowledgeIntegrityIssue,
  LayoutFamilyKnowledgeEntry,
} from "@/lib/ai-core/architecture-knowledge-base/types";
export type { KnowledgeIntegrityReport } from "@/lib/ai-core/architecture-knowledge-base/integrity";
export {
  ARCHITECTURE_KNOWLEDGE_BASE_VERSION,
} from "@/lib/ai-core/architecture-knowledge-base/types";
export {
  ARCHITECTURE_KNOWLEDGE_ENTRIES,
  DEFAULT_INDUSTRY_ID,
  DEFAULT_STRUCTURE_TEMPLATE_ID,
} from "@/lib/ai-core/architecture-knowledge-base/catalog";
export {
  buildKnowledgeRegistry,
  getKnowledgeEntry,
  getKnowledgeRegistry,
  mergeIndustryEntry,
  resetKnowledgeRegistryForTests,
  resolveKnowledgeEntryId,
} from "@/lib/ai-core/architecture-knowledge-base/registry";
export {
  getAllowedLayoutFamilies,
  getBusinessRulesKnowledge,
  getIndustryKnowledge,
  getValidationPolicyKnowledge,
  isEditorialLayoutIndustry,
  isEditorialLayoutStructure,
  isEditorialPageTopology,
  isForbiddenPremiumTemplate,
  isForbiddenStructureTemplate,
  isLayoutFamilyAllowed,
  listKnowledgeEntries,
  normalizeRoutingIndustryId,
  resolveIndustryKnowledge,
  resolveIndustryLayoutFamily,
  resolveStructureTemplateIdForIndustry,
  resolveVisualThemePresetForIndustry,
} from "@/lib/ai-core/architecture-knowledge-base/queries";
export {
  assertKnowledgeBaseIntegrity,
  validateKnowledgeBaseIntegrity,
} from "@/lib/ai-core/architecture-knowledge-base/integrity";

import { assertKnowledgeBaseIntegrity } from "@/lib/ai-core/architecture-knowledge-base/integrity";

/** Fail fast in development if catalog integrity breaks. */
try {
  assertKnowledgeBaseIntegrity();
} catch (error) {
  console.error("[architecture-knowledge-base] integrity check failed:", error);
}

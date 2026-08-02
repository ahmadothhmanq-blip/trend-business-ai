import type { WebsiteThemePresetId } from "@/lib/website/contracts/theme";
import { WEBSITE_THEME_PRESET_IDS } from "@/lib/website/contracts/theme";
import {
  isKnownStructureTemplateId,
} from "@/lib/website/contracts/structure-registry";
import {
  ARCHITECTURE_KNOWLEDGE_ENTRIES,
  businessRules,
  DEFAULT_INDUSTRY_ID,
  DEFAULT_STRUCTURE_TEMPLATE_ID,
  layoutTaxonomy,
  styleRoutingPolicy,
  validationPolicy,
} from "@/lib/ai-core/architecture-knowledge-base/catalog";
import {
  getKnowledgeEntry,
  getKnowledgeRegistry,
  mergeIndustryEntry,
  resolveKnowledgeEntryId,
} from "@/lib/ai-core/architecture-knowledge-base/registry";
import type {
  BusinessRulesKnowledgeEntry,
  ExplainableLookup,
  IndustryKnowledgeEntry,
  ValidationPolicyKnowledgeEntry,
} from "@/lib/ai-core/architecture-knowledge-base/types";

export type ResolvedIndustry = IndustryKnowledgeEntry & {
  inheritanceChain: string[];
  resolvedAliases: string[];
};

function explain<T>(
  value: T,
  entryId: string,
  entryVersion: string,
  inheritanceChain: string[],
  aliasesUsed: string[],
  resolvedFrom: string[],
): ExplainableLookup<T> {
  return {
    value,
    entryId,
    entryVersion,
    inheritanceChain,
    aliasesUsed,
    resolvedFrom,
  };
}

export function normalizeRoutingIndustryId(raw: string): string {
  const registry = getKnowledgeRegistry();
  const resolved =
    resolveKnowledgeEntryId(raw, "industry", registry) ??
    resolveKnowledgeEntryId(raw.replace(/[_\s]+/g, "-"), "industry", registry);
  return resolved ?? raw.toLowerCase().trim().replace(/[_\s]+/g, "-");
}

export function resolveIndustryKnowledge(
  rawIndustryId: string,
): ExplainableLookup<ResolvedIndustry> {
  const registry = getKnowledgeRegistry();
  const aliasesUsed: string[] = [];
  let id = normalizeRoutingIndustryId(rawIndustryId);

  const raw = rawIndustryId.toLowerCase().trim();
  if (registry.aliasToId.has(raw)) {
    aliasesUsed.push(raw);
    id = registry.aliasToId.get(raw)!;
  }

  let entry = getKnowledgeEntry(id, registry) as IndustryKnowledgeEntry | undefined;
  if (!entry || entry.kind !== "industry") {
    entry = getKnowledgeEntry(DEFAULT_INDUSTRY_ID, registry) as IndustryKnowledgeEntry;
    return explain(
      {
        ...mergeIndustryEntry(entry, registry),
        inheritanceChain: [],
        resolvedAliases: aliasesUsed,
      },
      entry.id,
      entry.version,
      [],
      aliasesUsed,
      [`fallback:${DEFAULT_INDUSTRY_ID}`],
    );
  }

  const inheritanceChain: string[] = [];
  let cursor: IndustryKnowledgeEntry | undefined = entry;
  while (cursor?.extends) {
    inheritanceChain.push(cursor.extends);
    cursor = getKnowledgeEntry(cursor.extends, registry) as
      | IndustryKnowledgeEntry
      | undefined;
  }

  const merged = mergeIndustryEntry(entry, registry);
  return explain(
    { ...merged, inheritanceChain, resolvedAliases: aliasesUsed },
    entry.id,
    entry.version,
    inheritanceChain,
    aliasesUsed,
    [`industry:${entry.id}`],
  );
}

export function getIndustryKnowledge(
  industryId: string,
): ResolvedIndustry {
  return resolveIndustryKnowledge(industryId).value;
}

export function resolveStructureTemplateIdForIndustry(
  industryId: string,
): ExplainableLookup<string> {
  const industry = resolveIndustryKnowledge(industryId);
  const structureId = industry.value.defaultStructureTemplateId;
  const valid = isKnownStructureTemplateId(structureId)
    ? structureId
    : DEFAULT_STRUCTURE_TEMPLATE_ID;
  return explain(
    valid,
    industry.entryId,
    industry.entryVersion,
    industry.inheritanceChain,
    industry.aliasesUsed,
    [
      ...industry.resolvedFrom,
      `defaultStructureTemplateId:${structureId}`,
      valid !== structureId ? `fallback:${DEFAULT_STRUCTURE_TEMPLATE_ID}` : "",
    ].filter(Boolean),
  );
}

export function resolveIndustryLayoutFamily(
  industryId: string,
): ExplainableLookup<string> {
  const industry = resolveIndustryKnowledge(industryId);
  return explain(
    industry.value.defaultLayoutFamily,
    industry.entryId,
    industry.entryVersion,
    industry.inheritanceChain,
    industry.aliasesUsed,
    [...industry.resolvedFrom, `defaultLayoutFamily`],
  );
}

export function getAllowedLayoutFamilies(industryId: string): string[] {
  return getIndustryKnowledge(industryId).allowedLayoutFamilies;
}

export function isLayoutFamilyAllowed(
  industryId: string,
  layoutFamily: string,
): boolean {
  return getAllowedLayoutFamilies(industryId).includes(layoutFamily);
}

export function isEditorialLayoutIndustry(industryId: string): boolean {
  return getIndustryKnowledge(industryId).editorialLayoutAllowed;
}

export function isForbiddenStructureTemplate(
  industryId: string,
  structureTemplateId: string,
): boolean {
  const forbidden =
    getIndustryKnowledge(industryId).forbiddenStructureTemplateIds ?? [];
  return forbidden.includes(structureTemplateId);
}

export function isForbiddenPremiumTemplate(
  industryId: string,
  premiumTemplateId: string,
): boolean {
  const forbidden =
    getIndustryKnowledge(industryId).forbiddenPremiumTemplateIds ?? [];
  const normalized = premiumTemplateId.toLowerCase();
  return forbidden.some((token) => normalized.includes(token.toLowerCase()));
}

export function isEditorialLayoutStructure(layoutStructure: string): boolean {
  return layoutTaxonomy().editorialLayoutStructures.includes(layoutStructure);
}

export function isEditorialPageTopology(pageTopology: string): boolean {
  return layoutTaxonomy().editorialPageTopologies.includes(pageTopology);
}

export function getBusinessRulesKnowledge(): BusinessRulesKnowledgeEntry {
  return businessRules();
}

export function getValidationPolicyKnowledge(): ValidationPolicyKnowledgeEntry {
  return validationPolicy();
}

const THEME_PRESET_IDS = new Set<string>(WEBSITE_THEME_PRESET_IDS);

export function resolveVisualThemePresetForIndustry(
  industryId: string,
  style: string,
  explicitThemeId?: string | null,
): ExplainableLookup<WebsiteThemePresetId> {
  const industry = resolveIndustryKnowledge(industryId);
  const resolvedFrom = [...industry.resolvedFrom];

  if (explicitThemeId && THEME_PRESET_IDS.has(explicitThemeId)) {
    return explain(
      explicitThemeId as WebsiteThemePresetId,
      industry.entryId,
      industry.entryVersion,
      industry.inheritanceChain,
      industry.aliasesUsed,
      [...resolvedFrom, `explicitTheme:${explicitThemeId}`],
    );
  }

  const s = style.toLowerCase();
  const policy = styleRoutingPolicy();

  for (const rule of policy.rules) {
    const regex = new RegExp(rule.pattern, "i");
    if (!regex.test(s)) continue;
    if (rule.requiresEditorialIndustry && !industry.value.editorialLayoutAllowed) {
      continue;
    }
    if (
      rule.industries?.length &&
      !rule.industries.includes(industry.value.id)
    ) {
      continue;
    }
    if (rule.themeId === "editorial" && !industry.value.editorialLayoutAllowed) {
      continue;
    }
    return explain(
      rule.themeId as WebsiteThemePresetId,
      policy.id,
      policy.version,
      industry.inheritanceChain,
      industry.aliasesUsed,
      [...resolvedFrom, `style-rule:${rule.id}`],
    );
  }

  const defaultTheme = industry.value.defaultVisualThemeId as WebsiteThemePresetId;
  return explain(
    defaultTheme,
    industry.entryId,
    industry.entryVersion,
    industry.inheritanceChain,
    industry.aliasesUsed,
    [...resolvedFrom, `defaultVisualThemeId:${defaultTheme}`],
  );
}

export function listKnowledgeEntries() {
  return ARCHITECTURE_KNOWLEDGE_ENTRIES;
}

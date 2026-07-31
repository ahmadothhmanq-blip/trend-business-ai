import { ARCHITECTURE_KNOWLEDGE_ENTRIES } from "@/lib/ai-core/architecture-knowledge-base/catalog";
import type {
  ArchitectureKnowledgeEntry,
  IndustryKnowledgeEntry,
  KnowledgeEntryKind,
} from "@/lib/ai-core/architecture-knowledge-base/types";

export type KnowledgeRegistry = {
  byId: Map<string, ArchitectureKnowledgeEntry>;
  aliasToId: Map<string, string>;
  byKind: Map<KnowledgeEntryKind, ArchitectureKnowledgeEntry[]>;
};

let singletonRegistry: KnowledgeRegistry | null = null;

function unique(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

export function buildKnowledgeRegistry(
  entries: ArchitectureKnowledgeEntry[] = ARCHITECTURE_KNOWLEDGE_ENTRIES,
): KnowledgeRegistry {
  const byId = new Map<string, ArchitectureKnowledgeEntry>();
  const aliasToId = new Map<string, string>();
  const byKind = new Map<KnowledgeEntryKind, ArchitectureKnowledgeEntry[]>();

  for (const entry of entries) {
    byId.set(entry.id, entry);
    const kindList = byKind.get(entry.kind) ?? [];
    kindList.push(entry);
    byKind.set(entry.kind, kindList);

    aliasToId.set(entry.id.toLowerCase(), entry.id);
    for (const alias of entry.aliases ?? []) {
      aliasToId.set(alias.toLowerCase().trim(), entry.id);
    }
  }

  return { byId, aliasToId, byKind };
}

export function getKnowledgeRegistry(): KnowledgeRegistry {
  if (!singletonRegistry) {
    singletonRegistry = buildKnowledgeRegistry();
  }
  return singletonRegistry;
}

export function resetKnowledgeRegistryForTests(): void {
  singletonRegistry = null;
}

export function getKnowledgeEntry(
  id: string,
  registry: KnowledgeRegistry = getKnowledgeRegistry(),
): ArchitectureKnowledgeEntry | undefined {
  return registry.byId.get(id);
}

export function resolveKnowledgeEntryId(
  raw: string,
  kind: KnowledgeEntryKind,
  registry: KnowledgeRegistry = getKnowledgeRegistry(),
): string | undefined {
  const normalized = raw.toLowerCase().trim().replace(/[_\s]+/g, "-");
  const aliasHit = registry.aliasToId.get(normalized);
  if (aliasHit) {
    const entry = registry.byId.get(aliasHit);
    if (entry?.kind === kind) {
      return entry.id;
    }
  }

  const direct = registry.byId.get(normalized);
  if (direct?.kind === kind) {
    return direct.id;
  }

  return undefined;
}

/**
 * Resolve industry entry with inheritance chain (parent → child) and overrides.
 */
export function mergeIndustryEntry(
  entry: IndustryKnowledgeEntry,
  registry: KnowledgeRegistry,
): IndustryKnowledgeEntry {
  const chain: IndustryKnowledgeEntry[] = [];
  const visited = new Set<string>();
  let cursor: IndustryKnowledgeEntry | undefined = entry;

  while (cursor) {
    if (visited.has(cursor.id)) {
      throw new Error(`Circular industry inheritance at ${entry.id}`);
    }
    visited.add(cursor.id);
    chain.unshift(cursor);
    if (!cursor.extends) break;
    const parent = registry.byId.get(cursor.extends);
    if (!parent || parent.kind !== "industry") break;
    cursor = parent as IndustryKnowledgeEntry;
  }

  let merged = { ...chain[0] } as IndustryKnowledgeEntry;
  for (let i = 1; i < chain.length; i += 1) {
    const child = chain[i];
    merged = {
      ...merged,
      ...child,
      id: child.id,
      label: child.label,
      aliases: unique([...(merged.aliases ?? []), ...(child.aliases ?? [])]),
      forbiddenStructureTemplateIds: unique([
        ...(merged.forbiddenStructureTemplateIds ?? []),
        ...(child.forbiddenStructureTemplateIds ?? []),
      ]),
      forbiddenPremiumTemplateIds: unique([
        ...(merged.forbiddenPremiumTemplateIds ?? []),
        ...(child.forbiddenPremiumTemplateIds ?? []),
      ]),
      allowedLayoutFamilies:
        child.allowedLayoutFamilies ?? merged.allowedLayoutFamilies,
      defaultLayoutFamily:
        child.defaultLayoutFamily ?? merged.defaultLayoutFamily,
      defaultStructureTemplateId:
        child.defaultStructureTemplateId ?? merged.defaultStructureTemplateId,
      defaultVisualThemeId:
        child.defaultVisualThemeId ?? merged.defaultVisualThemeId,
      editorialLayoutAllowed:
        child.editorialLayoutAllowed ?? merged.editorialLayoutAllowed,
      imagePolicyId: child.imagePolicyId ?? merged.imagePolicyId,
      seoPolicyId: child.seoPolicyId ?? merged.seoPolicyId,
      accessibilityPolicyId:
        child.accessibilityPolicyId ?? merged.accessibilityPolicyId,
      localizationPolicyId:
        child.localizationPolicyId ?? merged.localizationPolicyId,
      businessRulesId: child.businessRulesId ?? merged.businessRulesId,
      extends: undefined,
      overrides: undefined,
    };
    if (child.overrides) {
      merged = {
        ...merged,
        ...(child.overrides as Partial<IndustryKnowledgeEntry>),
      };
    }
  }

  return merged;
}

export function getIndustryInheritanceChain(
  entryId: string,
  registry: KnowledgeRegistry,
): string[] {
  const chain: string[] = [];
  const visited = new Set<string>();
  let cursor = registry.byId.get(entryId) as IndustryKnowledgeEntry | undefined;
  while (cursor?.extends) {
    if (visited.has(cursor.extends)) break;
    visited.add(cursor.extends);
    chain.push(cursor.extends);
    cursor = registry.byId.get(cursor.extends) as IndustryKnowledgeEntry | undefined;
  }
  return chain;
}

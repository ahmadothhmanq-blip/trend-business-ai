import type { WebsiteFeatureId } from "@/lib/constants/website-builder";
import { WEBSITE_FEATURE_IDS } from "@/lib/constants/website-builder";
import { getCapabilityDefinition, listCapabilityDefinitions } from "@/lib/website/builder/capabilities/definitions";
import type {
  CapabilityEvidence,
  CapabilityManifestEntry,
  WebsiteCapabilityId,
  WebsiteCapabilityManifest,
} from "@/lib/website/builder/capabilities/types";
import {
  CAPABILITY_ANALYZER_SET_VERSION,
  CAPABILITY_MANIFEST_SPEC_VERSION,
} from "@/lib/website/builder/capabilities/constants";

const FEATURE_TO_CAPABILITY: Partial<Record<WebsiteFeatureId, WebsiteCapabilityId>> = {
  login: "authentication",
  dashboard: "dashboard",
  cms: "blog",
  blog: "blog",
  contact: "forms",
  booking: "booking",
  payment: "payments",
  ecommerce: "products",
  chat: "chat",
  analytics: "analytics",
  crm: "forms",
  newsletter: "newsletter",
  search: "search",
  testimonials: "testimonials",
  gallery: "gallery",
  portfolio: "portfolio",
  faq: "faq",
  pricing: "pricing",
  maps: "maps",
  seo: "seo",
  localization: "multi-language",
  membership: "authentication",
};

const FEATURE_ALIAS_INDEX = new Map<string, WebsiteFeatureId>();
for (const featureId of WEBSITE_FEATURE_IDS) {
  FEATURE_ALIAS_INDEX.set(featureId.toLowerCase(), featureId);
}
for (const definition of listCapabilityDefinitions()) {
  for (const featureId of definition.legacyFeatureIds ?? []) {
    FEATURE_ALIAS_INDEX.set(featureId.toLowerCase(), featureId);
  }
  for (const alias of definition.aliases ?? []) {
    const mapped = definition.legacyFeatureIds?.[0];
    if (mapped) FEATURE_ALIAS_INDEX.set(alias.toLowerCase(), mapped);
  }
}

export function normalizeFeatureToken(raw: string): WebsiteFeatureId | null {
  const key = raw.trim().toLowerCase();
  if (!key || key.startsWith("product:") || key.startsWith("template:")) {
    return null;
  }
  if (key.startsWith("component:") || key.startsWith("marketplace:")) {
    return null;
  }
  if (key.startsWith("feature:")) {
    return normalizeFeatureToken(key.slice("feature:".length));
  }
  return FEATURE_ALIAS_INDEX.get(key) ?? null;
}

export function capabilityIdFromFeatureId(
  featureId: WebsiteFeatureId,
): WebsiteCapabilityId | null {
  return FEATURE_TO_CAPABILITY[featureId] ?? null;
}

export function capabilityIdsFromFeatureSelection(
  rawFeatures: string[] | undefined | null,
): WebsiteCapabilityId[] {
  const ids = new Set<WebsiteCapabilityId>();
  for (const raw of rawFeatures ?? []) {
    const featureId = normalizeFeatureToken(raw);
    if (!featureId) continue;
    const capabilityId = capabilityIdFromFeatureId(featureId);
    if (capabilityId) ids.add(capabilityId);
  }
  return [...ids];
}

export function featureIdsFromCapabilityId(
  capabilityId: WebsiteCapabilityId,
): WebsiteFeatureId[] {
  const definition = getCapabilityDefinition(capabilityId);
  return definition?.legacyFeatureIds ? [...definition.legacyFeatureIds] : [];
}

export function buildSeededCapabilityEntries(
  capabilityIds: WebsiteCapabilityId[],
  sourceRef = "user-selected-feature",
): CapabilityManifestEntry[] {
  return capabilityIds.map((id) => ({
    id,
    status: "active" as const,
    confidence: "high" as const,
    score: 1,
    evidence: [
      {
        source: "setting" as const,
        ref: sourceRef,
        weight: 1,
        detail: `Seeded from feature selection (${id})`,
      },
    ],
  }));
}

export function seedManifestFromFeatures(
  rawFeatures: string[] | undefined | null,
  projectId?: string,
): WebsiteCapabilityManifest {
  const capabilityIds = capabilityIdsFromFeatureSelection(rawFeatures);
  return {
    specVersion: CAPABILITY_MANIFEST_SPEC_VERSION,
    projectId,
    generatedAt: new Date().toISOString(),
    analyzerSetVersion: CAPABILITY_ANALYZER_SET_VERSION,
    phase: "initial",
    capabilities: buildSeededCapabilityEntries(capabilityIds),
  };
}

/** All capability ids that have a legacy feature mapping (for migration checks). */
export function listBridgeableCapabilityIds(): WebsiteCapabilityId[] {
  return listCapabilityDefinitions()
    .filter((definition) => definition.legacyFeatureIds?.length)
    .map((definition) => definition.id);
}

export function mergeSeededEvidence(
  entries: CapabilityManifestEntry[],
  seeded: CapabilityManifestEntry[],
): CapabilityManifestEntry[] {
  const merged = new Map<WebsiteCapabilityId, CapabilityManifestEntry>();
  for (const entry of [...seeded, ...entries]) {
    const existing = merged.get(entry.id);
    if (!existing) {
      merged.set(entry.id, entry);
      continue;
    }
    const evidenceMap = new Map<string, CapabilityEvidence>();
    for (const item of [...existing.evidence, ...entry.evidence]) {
      evidenceMap.set(`${item.source}:${item.ref}`, item);
    }
    merged.set(entry.id, {
      ...entry,
      score: Math.max(existing.score, entry.score),
      confidence:
        existing.confidence === "high" || entry.confidence === "high"
          ? "high"
          : existing.confidence === "medium" || entry.confidence === "medium"
            ? "medium"
            : "low",
      evidence: [...evidenceMap.values()],
      status: "active",
    });
  }
  return [...merged.values()].filter((entry) => entry.confidence !== "low");
}

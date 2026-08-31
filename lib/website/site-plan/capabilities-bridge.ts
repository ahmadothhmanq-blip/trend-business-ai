import type { WebsiteCapabilityId } from "@/lib/website/builder/capabilities/types";
import type { CapabilityManifestEntry } from "@/lib/website/builder/capabilities/types";
import { CAPABILITY_MANIFEST_SPEC_VERSION } from "@/lib/website/builder/capabilities/constants";
import type { SitePlan } from "@/lib/website/site-plan/types";

/** Seed prescriptive capability manifest entries from SitePlan (WB_SITE_PLAN_V1). */
export function buildPrescriptiveCapabilityEntries(
  plan: SitePlan,
): CapabilityManifestEntry[] {
  const now = new Date().toISOString();
  return plan.capabilities.map((id) => ({
    id: id as WebsiteCapabilityId,
    status: "active" as const,
    confidence: "high" as const,
    score: 1,
    evidence: [
      {
        source: "strategy" as const,
        ref: `sitePlan:${plan.archetypeId}`,
        weight: 1,
        detail: "Prescriptive capability from SitePlan archetype",
      },
    ],
    metadata: { prescriptive: true, planHash: plan.planHash },
  }));
}

export function mergePrescriptiveCapabilities(
  existing: CapabilityManifestEntry[],
  plan: SitePlan,
): CapabilityManifestEntry[] {
  const prescriptive = buildPrescriptiveCapabilityEntries(plan);
  const byId = new Map(existing.map((e) => [e.id, e]));
  for (const entry of prescriptive) {
    if (!byId.has(entry.id)) byId.set(entry.id, entry);
  }
  return [...byId.values()];
}

export function prescriptiveManifestFromSitePlan(plan: SitePlan) {
  return {
    specVersion: CAPABILITY_MANIFEST_SPEC_VERSION,
    generatedAt: new Date().toISOString(),
    analyzerSetVersion: "site-plan-prescriptive",
    phase: "initial" as const,
    capabilities: buildPrescriptiveCapabilityEntries(plan),
  };
}

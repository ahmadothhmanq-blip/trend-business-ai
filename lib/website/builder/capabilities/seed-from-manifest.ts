import { getCapabilityDefinition } from "@/lib/website/builder/capabilities/definitions";
import { loadManifestFromProject } from "@/lib/website/builder/capabilities/manifest";
import type { GeneratedWebsiteProject } from "@/lib/website/types/generation";

/**
 * Re-seed feature tokens from an existing capability manifest before a forced rebuild.
 * Prevents losing user-selected capabilities (e.g. gallery → media tool) when V2 skin apply
 * rebuilds the manifest from post-template component IDs.
 */
export function seedFeaturesFromCapabilityManifest(
  project: GeneratedWebsiteProject,
): string[] {
  const manifest = loadManifestFromProject(project);
  if (!manifest) return [];

  const features: string[] = [];
  for (const entry of manifest.capabilities) {
    if (entry.status !== "active" || entry.confidence === "low") continue;
    const definition = getCapabilityDefinition(entry.id);
    const featureId = definition?.legacyFeatureIds?.[0];
    if (featureId) features.push(featureId);
  }
  return features;
}

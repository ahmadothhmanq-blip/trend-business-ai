import type { TemplateArchitectureVersion } from "@/lib/website/template-v2/constants";

/**
 * V1 compatibility adapter — documents that existing apply/render paths remain authoritative.
 * P0 does not wire V2 into applyStructureTemplateToProject.
 */
export const TEMPLATE_V1_APPLY_ENTRY = "applyStructureTemplateToProject";

export type TemplateV1CompatibilityMarker = {
  architectureVersion: "v1";
  applyEntry: typeof TEMPLATE_V1_APPLY_ENTRY;
};

export function createV1CompatibilityMarker(): TemplateV1CompatibilityMarker {
  return {
    architectureVersion: "v1",
    applyEntry: TEMPLATE_V1_APPLY_ENTRY,
  };
}

export function isV1Architecture(
  version: TemplateArchitectureVersion | undefined,
): boolean {
  return !version || version === "v1";
}

export function assertV1CompatibilityPath(
  version: TemplateArchitectureVersion,
): void {
  if (version !== "v1") {
    throw new Error(
      "Direct V1 apply path requested but architecture is v2 — use applyTemplateV2ToProject",
    );
  }
}

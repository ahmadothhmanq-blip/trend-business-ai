/**
 * Blueprint revision helpers — parse, stamp, and resolve revision counters.
 */

import type { BlueprintPlatformRevision } from "@/lib/website/platform/types";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";
import type { WebsiteGeneration } from "@/types/database";
import type { WebsiteMutationOperation } from "@/lib/website/platform/types";

export function readBlueprintRevisionFromGeneration(
  generation: Pick<WebsiteGeneration, "blueprint_revision" | "blueprint">,
): number {
  const column = generation.blueprint_revision;
  if (typeof column === "number" && Number.isFinite(column)) {
    return Math.max(0, Math.floor(column));
  }

  const blueprint = generation.blueprint as {
    platformRevision?: BlueprintPlatformRevision;
  } | null;
  const embedded = blueprint?.platformRevision?.revision;
  if (typeof embedded === "number" && Number.isFinite(embedded)) {
    return Math.max(0, Math.floor(embedded));
  }

  return 0;
}

export function stampPlatformRevisionOnProject(params: {
  project: GeneratedWebsiteProject;
  revision: number;
  parentRevision: number;
  operation: WebsiteMutationOperation;
}): GeneratedWebsiteProject {
  const platformRevision: BlueprintPlatformRevision = {
    revision: params.revision,
    parentRevision: params.parentRevision,
    committedAt: new Date().toISOString(),
    operation: params.operation,
  };

  return {
    ...params.project,
    platformRevision,
  } as GeneratedWebsiteProject & { platformRevision: BlueprintPlatformRevision };
}

export function nextRevision(current: number): number {
  return Math.max(0, Math.floor(current)) + 1;
}

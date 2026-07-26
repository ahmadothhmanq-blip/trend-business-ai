/**
 * App blueprint revision helpers.
 */

import type { AppBlueprintPlatformRevision, WebAppMutationOperation } from "@/lib/webapp/platform/types";
import type { WebAppBlueprint, WebAppGeneration } from "@/types/webapp";

export function readBlueprintRevisionFromGeneration(
  generation: Pick<WebAppGeneration, "blueprint_revision" | "blueprint"> & {
    blueprint_revision?: number;
  },
): number {
  const column = generation.blueprint_revision;
  if (typeof column === "number" && Number.isFinite(column)) {
    return Math.max(0, Math.floor(column));
  }

  const blueprint = generation.blueprint as {
    platformRevision?: AppBlueprintPlatformRevision;
  } | null;
  const embedded = blueprint?.platformRevision?.revision;
  if (typeof embedded === "number" && Number.isFinite(embedded)) {
    return Math.max(0, Math.floor(embedded));
  }

  return 0;
}

export function stampPlatformRevisionOnBlueprint(params: {
  blueprint: WebAppBlueprint;
  revision: number;
  parentRevision: number;
  operation: WebAppMutationOperation;
}): WebAppBlueprint {
  const platformRevision: AppBlueprintPlatformRevision = {
    revision: params.revision,
    parentRevision: params.parentRevision,
    committedAt: new Date().toISOString(),
    operation: params.operation,
  };

  return {
    ...params.blueprint,
    platformRevision,
  } as WebAppBlueprint & { platformRevision: AppBlueprintPlatformRevision };
}

export function nextRevision(current: number): number {
  return Math.max(0, Math.floor(current)) + 1;
}

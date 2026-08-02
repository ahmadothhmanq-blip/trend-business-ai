/**
 * Default Website Platform Port — wires platform services for Copilot executors.
 */

import type { WebsitePlatformPort } from "@/lib/website/contracts/platform-port";
import { commitBlueprintRevision } from "@/lib/website/platform/commit";
import {
  findIdempotentCommit,
  storeIdempotentCommit,
} from "@/lib/website/platform/idempotency";
import {
  loadWebsiteGenerationForUser,
  toWebsiteProject,
} from "@/lib/website/platform/load-generation";
import { readBlueprintRevisionFromGeneration } from "@/lib/website/platform/revision";
import { executeWebsiteEdit } from "@/lib/website/platform/services/edit-service";
import {
  executeWebsiteSeoImprove,
} from "@/lib/website/platform/services/seo-service";
import { executeWebsiteStructureMutation } from "@/lib/website/platform/services/structure-service";

const defaultWebsitePlatformPort: WebsitePlatformPort = {
  loadGeneration: loadWebsiteGenerationForUser,
  toProject: toWebsiteProject,
  readBlueprintRevision: readBlueprintRevisionFromGeneration,
  findIdempotentCommit,
  storeIdempotentCommit,
  commitBlueprint: commitBlueprintRevision,
  executeEdit: executeWebsiteEdit,
  executeSeoImprove: executeWebsiteSeoImprove,
  executeStructureMutation: executeWebsiteStructureMutation,
};

let activePort: WebsitePlatformPort = defaultWebsitePlatformPort;

export function getWebsitePlatformPort(): WebsitePlatformPort {
  return activePort;
}

/** Test hook — restore with resetWebsitePlatformPortForTests(). */
export function setWebsitePlatformPort(port: WebsitePlatformPort): void {
  activePort = port;
}

export function resetWebsitePlatformPortForTests(): void {
  activePort = defaultWebsitePlatformPort;
}

export type { WebsitePlatformPort } from "@/lib/website/contracts/platform-port";

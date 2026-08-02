/**
 * Website Platform Port — contract for Copilot and AI Core website mutations.
 *
 * Copilot imports this interface and resolves the default implementation via
 * `getWebsitePlatformPort()` from `@/lib/website/platform/port`.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { GeneratedWebsiteProject } from "@/lib/website/types";
import type { WebsiteGeneration } from "@/types/database";
import type {
  WebsiteCommitOptions,
  WebsiteCommitResult,
  IdempotencyCachedResponse,
} from "@/lib/website/platform/types";
import type { PersistWebsiteGenerationArgs } from "@/lib/website/save-generation";
import type { WebsiteEditServiceSuccess } from "@/lib/website/platform/services/edit-service";
import type { WebsiteSeoApplySuccess } from "@/lib/website/platform/services/seo-service";
import type { WebsiteStructureServiceSuccess } from "@/lib/website/platform/services/structure-service";

export type WebsitePlatformPort = {
  loadGeneration(
    supabase: SupabaseClient,
    userId: string,
    generationId: string,
  ): Promise<WebsiteGeneration | null>;

  toProject(generation: WebsiteGeneration): GeneratedWebsiteProject;

  readBlueprintRevision(generation: WebsiteGeneration): number;

  findIdempotentCommit(
    supabase: SupabaseClient,
    params: {
      userId: string;
      generationId: string;
      idempotencyKey: string;
    },
  ): Promise<IdempotencyCachedResponse | null>;

  storeIdempotentCommit(
    supabase: SupabaseClient,
    params: {
      userId: string;
      generationId: string;
      idempotencyKey: string;
      operation: string;
      response: Record<string, unknown>;
      aiRunId: string | null;
    },
  ): Promise<void>;

  commitBlueprint(params: {
    supabase: SupabaseClient;
    userId: string;
    generationId: string;
    project: GeneratedWebsiteProject;
    projectKind: PersistWebsiteGenerationArgs["projectKind"];
    input: PersistWebsiteGenerationArgs["input"];
    commit: WebsiteCommitOptions;
    buildIdempotentResponse?: (cached: Record<string, unknown>) => unknown;
  }): Promise<WebsiteCommitResult>;

  executeEdit(
    params: Parameters<
      typeof import("@/lib/website/platform/services/edit-service").executeWebsiteEdit
    >[0],
  ): Promise<WebsiteEditServiceSuccess | { ok: false; code: string; error: string }>;

  executeSeoImprove(
    params: Parameters<
      typeof import("@/lib/website/platform/services/seo-service").executeWebsiteSeoImprove
    >[0],
  ): Promise<
    | WebsiteSeoApplySuccess
    | { ok: false; code: string; error: string }
  >;

  executeStructureMutation(
    params: Parameters<
      typeof import("@/lib/website/platform/services/structure-service").executeWebsiteStructureMutation
    >[0],
  ): Promise<
    | WebsiteStructureServiceSuccess
    | { ok: false; code: string; error: string }
  >;
};

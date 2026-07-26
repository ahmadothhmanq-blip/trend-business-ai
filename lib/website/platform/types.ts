/**
 * Website platform foundation — revision model, commit contracts, mutation ops.
 * Phase 0: no Copilot UI/router; single commit boundary for blueprint mutations.
 */

import type { GenerationMode } from "@/types/database";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";
import type { WebsiteGeneration } from "@/types/database";

/** Monotonic blueprint revision metadata stored inside blueprint JSONB. */
export type BlueprintPlatformRevision = {
  revision: number;
  parentRevision: number;
  committedAt: string;
  operation: WebsiteMutationOperation;
};

export type WebsiteMutationOperation =
  | "website.edit"
  | "website.edit.ai-continue"
  | "website.copilot.command"
  | "website.manage"
  | "website.manage.cms"
  | "website.seo.apply"
  | "website.generation.save";

export type WebsiteCommitInput = {
  prompt: string;
  language: string;
  theme: string;
  features: string[];
  productId?: string;
  projectId?: string;
  mode?: GenerationMode;
  parentGenerationId?: string;
  continueInstruction?: string;
};

export type WebsiteCommitOptions = {
  /** Optimistic concurrency — reject when current revision differs. */
  expectedRevision?: number;
  /** Idempotent replay key (per user + generation). */
  idempotencyKey?: string;
  operation: WebsiteMutationOperation;
  /** Extra metadata stored on ai_runs.brief */
  mutationMeta?: Record<string, unknown>;
  /** Extra fields stored for idempotent replay (service-specific). */
  idempotencyPayload?: Record<string, unknown>;
};

export type WebsiteCommitSuccess = {
  ok: true;
  generation: WebsiteGeneration;
  project: GeneratedWebsiteProject;
  revision: number;
  aiRunId: string | null;
  fromIdempotency: boolean;
  idempotencyPayload?: Record<string, unknown>;
};

export type WebsiteCommitFailure = {
  ok: false;
  error: string;
  code: "CONFLICT" | "VALIDATION" | "SERVER";
};

export type WebsiteCommitResult = WebsiteCommitSuccess | WebsiteCommitFailure;

export type IdempotencyCachedResponse = {
  response: Record<string, unknown>;
  aiRunId: string | null;
};

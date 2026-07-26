/**
 * Webapp platform foundation — revision model, commit contracts, mutation ops.
 */

import type { GeneratedProjectFile } from "@/lib/ai/types";
import type { StructuredAppModel } from "@/lib/ai-core/app-design-platform/types";
import type { WebAppBlueprint, WebAppGeneration } from "@/types/webapp";

export type AppBlueprintPlatformRevision = {
  revision: number;
  parentRevision: number;
  committedAt: string;
  operation: WebAppMutationOperation;
};

export type WebAppMutationOperation =
  | "webapp.manage"
  | "webapp.copilot.command"
  | "webapp.generation.save";

export type WebAppCommitInput = {
  prompt: string;
  appType: string;
  language: string;
  designStyle: string;
  colorStyle: string;
  features: string[];
  productId?: string;
  projectId?: string;
  mode?: string;
  parentGenerationId?: string;
};

export type WebAppCommitOptions = {
  expectedRevision?: number;
  idempotencyKey?: string;
  operation: WebAppMutationOperation;
  mutationMeta?: Record<string, unknown>;
  idempotencyPayload?: Record<string, unknown>;
};

export type WebAppCommitPayload = {
  model: StructuredAppModel;
  files: GeneratedProjectFile[];
  blueprint: WebAppBlueprint;
};

export type WebAppCommitSuccess = {
  ok: true;
  generation: WebAppGeneration;
  model: StructuredAppModel;
  files: GeneratedProjectFile[];
  blueprint: WebAppBlueprint;
  revision: number;
  aiRunId: string | null;
  fromIdempotency: boolean;
  idempotencyPayload?: Record<string, unknown>;
};

export type WebAppCommitFailure = {
  ok: false;
  error: string;
  code: "CONFLICT" | "VALIDATION" | "SERVER";
};

export type WebAppCommitResult = WebAppCommitSuccess | WebAppCommitFailure;

export type WebAppIdempotencyCachedResponse = {
  response: Record<string, unknown>;
  aiRunId: string | null;
};

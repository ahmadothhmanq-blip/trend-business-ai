/**
 * Webapp platform foundation — Phase 4 exports.
 */

export type {
  AppBlueprintPlatformRevision,
  WebAppMutationOperation,
  WebAppCommitInput,
  WebAppCommitOptions,
  WebAppCommitPayload,
  WebAppCommitResult,
  WebAppCommitSuccess,
  WebAppCommitFailure,
} from "@/lib/webapp/platform/types";

export {
  readBlueprintRevisionFromGeneration,
  stampPlatformRevisionOnBlueprint,
  nextRevision,
} from "@/lib/webapp/platform/revision";

export {
  findWebappIdempotentCommit,
  storeWebappIdempotentCommit,
  purgeExpiredWebappIdempotentCommits,
  WEBAPP_COMMIT_IDEMPOTENCY_TTL_DAYS,
} from "@/lib/webapp/platform/idempotency";

export { recordWebappMutationRun } from "@/lib/webapp/platform/mutation-run";

export {
  commitAppBlueprintRevision,
  type CommitAppBlueprintRevisionParams,
} from "@/lib/webapp/platform/commit";

export {
  loadWebappGenerationForUser,
  toWebappPayload,
  extractVersionHistory,
} from "@/lib/webapp/platform/load-generation";

/**
 * Website platform foundation — Phase 0 exports.
 */

export type {
  BlueprintPlatformRevision,
  WebsiteMutationOperation,
  WebsiteCommitInput,
  WebsiteCommitOptions,
  WebsiteCommitResult,
  WebsiteCommitSuccess,
  WebsiteCommitFailure,
} from "@/lib/website/platform/types";

export {
  readBlueprintRevisionFromGeneration,
  stampPlatformRevisionOnProject,
  nextRevision,
} from "@/lib/website/platform/revision";

export {
  findIdempotentCommit,
  storeIdempotentCommit,
  purgeExpiredIdempotentCommits,
  WEBSITE_COMMIT_IDEMPOTENCY_TTL_DAYS,
} from "@/lib/website/platform/idempotency";

export { recordWebsiteMutationRun } from "@/lib/website/platform/mutation-run";

export {
  commitBlueprintRevision,
  type CommitBlueprintRevisionParams,
} from "@/lib/website/platform/commit";

export {
  loadWebsiteGenerationForUser,
  toWebsiteProject,
} from "@/lib/website/platform/load-generation";

export {
  executeWebsiteEdit,
  type WebsiteEditRequest,
  type WebsiteEditServiceResult,
  type WebsiteEditServiceDeps,
} from "@/lib/website/platform/services/edit-service";

export {
  executeWebsiteSeoApply,
  executeWebsiteSeoImprove,
  type WebsiteSeoApplyRequest,
  type WebsiteSeoApplyResult,
} from "@/lib/website/platform/services/seo-service";

export {
  executeWebsiteStructureMutation,
  type WebsiteManageAction,
  type WebsiteStructureServiceResult,
} from "@/lib/website/platform/services/structure-service";

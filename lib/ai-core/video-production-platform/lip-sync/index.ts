export { LipSyncError } from "@/lib/ai-core/video-production-platform/lip-sync/errors";
export type {
  LipSyncCapabilities,
  LipSyncCostEstimate,
  LipSyncHealth,
  LipSyncJobHandle,
  LipSyncJobRequest,
  LipSyncProvider,
  LipSyncProviderId,
  LipSyncProviderStatus,
} from "@/lib/ai-core/video-production-platform/lip-sync/contract";
export { heygenLipSyncConfigured, heygenLipSyncProvider, isPublicHttpsUrl } from "@/lib/ai-core/video-production-platform/lip-sync/heygen";
export { listLipSyncProviders, lipSyncProviderHealthReport, resolveLipSyncProvider } from "@/lib/ai-core/video-production-platform/lip-sync/registry";
export { buildLipSyncIdempotencyKey, clearLipSyncJobCache } from "@/lib/ai-core/video-production-platform/lip-sync/job-cache";
export { runLipSync } from "@/lib/ai-core/video-production-platform/lip-sync/service";
export type { RunLipSyncInput, RunLipSyncResult } from "@/lib/ai-core/video-production-platform/lip-sync/service";
export {
  findLipSyncJobByIdempotencyKey,
  insertLipSyncJob,
  loadOwnedMedia,
} from "@/lib/ai-core/video-production-platform/lip-sync/persist";
export type { LipSyncJobRecord } from "@/lib/ai-core/video-production-platform/lip-sync/persist";

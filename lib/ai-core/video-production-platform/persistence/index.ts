export {
  assertCanPersistArtifact,
  assertCanPersistProjectState,
  assertCanPersistProviderJob,
  assertCanPersistScene,
  buildProviderIdempotencyKey,
} from "@/lib/ai-core/video-production-platform/persistence/guards";

export {
  artifactFromMediaRow,
  audioPlanFromPlanRow,
  planFromRow,
  projectFromGenerationRow,
  providerJobFromRow,
  providerJobRecordFromRow,
  qualityReportFromRow,
  sceneFromRow,
  sceneToRow,
  scenesFromDomainOrLegacy,
} from "@/lib/ai-core/video-production-platform/persistence/mappers";
export type { ProviderJobRecord, VideoPlanRecord } from "@/lib/ai-core/video-production-platform/persistence/mappers";

export {
  findProviderJobByIdempotencyKey,
  insertPlayableArtifact,
  insertProviderJob,
  insertQualityReport,
  loadLatestQualityReport,
  insertVideoPlan,
  insertVideoScenes,
  listProviderJobsForProject,
  listDueProviderJobs,
  listPlansForProject,
  loadDomainScenes,
  loadPlanForProject,
  loadPlanById,
  loadScenesForPlan,
  resolveActivePlanId,
  findPlanByIdempotencyKey,
  nextPlanVersion,
  loadPlayableSceneArtifact,
  loadPlayableCompositeArtifact,
  loadOwnedFinalComposite,
  loadSceneById,
  listProviderJobsForScene,
  reorderVideoScenes,
  updateProviderJob,
  updateSceneRecord,
  persistDomainScene,
  deleteSceneRecord,
} from "@/lib/ai-core/video-production-platform/persistence/repository";

export { readProjectWithSceneRows, readProjectWithScenes } from "@/lib/ai-core/video-production-platform/persistence/legacy-read";

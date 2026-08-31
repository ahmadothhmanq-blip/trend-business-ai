export type {
  ModelRouterDecision,
  ModelRouterInput,
  ProviderCapability,
  ProviderCostEstimate,
  ProviderHealth,
  ProviderJobHandle,
  ProviderJobRequest,
  ProviderV2Id,
  ProviderV2Status,
  RouterQuality,
  RouterTask,
  VideoProviderV2,
} from "@/lib/ai-core/video-production-platform/provider-router/contract";
export { PROVIDER_V2_IDS, isProviderV2Id } from "@/lib/ai-core/video-production-platform/provider-router/contract";
export { ProviderRouterError } from "@/lib/ai-core/video-production-platform/provider-router/errors";
export {
  createProviderRegistry,
  estimateProviderCost,
  getProviderV2,
  listProviderRegistry,
  mapV1ResultToHandle,
  readProviderEnv,
  type ProviderEnvSnapshot,
} from "@/lib/ai-core/video-production-platform/provider-router/registry";
export { hashRouterPrompt, routeModel } from "@/lib/ai-core/video-production-platform/provider-router/router";
export {
  buildSceneProviderPrompt,
  buildSceneRouterInput,
  buildProviderJobRequestFromScene,
} from "@/lib/ai-core/video-production-platform/provider-router/scene-to-provider";
export {
  createMemoryProviderJobStore,
  createSupabaseProviderJobStore,
  persistRoutedProviderJob,
  type ProviderJobStore,
  type RoutedProviderJob,
} from "@/lib/ai-core/video-production-platform/provider-router/jobs";

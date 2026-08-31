export {
  WB_WEBSITE_CAPABILITY_MANIFEST_SETTING,
  CAPABILITY_ANALYZER_SET_VERSION,
  CAPABILITY_MANIFEST_SPEC_VERSION,
  CAPABILITY_CONFIDENCE_THRESHOLDS,
  isCapabilityToolbarEnabled,
} from "@/lib/website/builder/capabilities/constants";

export type {
  WebsiteCapabilityId,
  WebsiteCapabilityManifest,
  CapabilityManifestEntry,
  CapabilityEvidence,
  CapabilityEvidenceSource,
  CapabilityConfidence,
  CapabilityManifestPhase,
  ProjectAnalysisSignals,
} from "@/lib/website/builder/capabilities/types";

export { WEBSITE_CAPABILITY_IDS } from "@/lib/website/builder/capabilities/types";

export {
  CAPABILITY_DEFINITIONS,
  getCapabilityDefinition,
  listCapabilityDefinitions,
  type CapabilityDefinition,
} from "@/lib/website/builder/capabilities/definitions";

export {
  extractProjectSignals,
  projectSignalsHaystack,
} from "@/lib/website/builder/capabilities/signals";

export {
  CAPABILITY_DETECTION_DEFINITIONS,
  getCapabilityDetectionDefinition,
} from "@/lib/website/builder/capabilities/detection-rules";

export {
  registerCapabilityAnalyzer,
  registerCapabilityConsumer,
  getCapabilityAnalyzers,
  getCapabilityConsumers,
} from "@/lib/website/builder/capabilities/registry";

export {
  capabilityIdFromFeatureId,
  capabilityIdsFromFeatureSelection,
  seedManifestFromFeatures,
  normalizeFeatureToken,
} from "@/lib/website/builder/capabilities/feature-bridge";

export { projectCapabilityFlagsFromManifest } from "@/lib/website/builder/capabilities/flags-bridge";

export {
  WebsiteCapabilityService,
  createCapabilityService,
  refreshCapabilities,
  projectCapabilityFlags,
  filterItemsByCapabilities,
  type RefreshCapabilitiesOptions,
  type RefreshCapabilitiesResult,
  type CapabilityGatedItem,
} from "@/lib/website/builder/capabilities/service";

export {
  getCapabilityDependencyReport,
  formatCapabilityDependencyReport,
  type CapabilityDependencyReport,
} from "@/lib/website/builder/capabilities/dependency-report";

import "@/lib/website/builder/capabilities/consumers";

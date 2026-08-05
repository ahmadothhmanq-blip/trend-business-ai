/**
 * Trend Business AI Design Platform — Phase 3 Experience System
 */
export {
  TBDP_EXPERIENCE_PHASE,
  TBDP_EXPERIENCE_VERSION,
  TBDP_EXPERIENCE_PREFIX,
} from "@/lib/design-platform/experience/constants";

export * from "@/lib/design-platform/experience/core";
export * from "@/lib/design-platform/experience/motion";
export * from "@/lib/design-platform/experience/interaction";
export * from "@/lib/design-platform/experience/feedback";
export * from "@/lib/design-platform/experience/responsive";
export * from "@/lib/design-platform/experience/accessibility";
export * from "@/lib/design-platform/experience/direction";
export * from "@/lib/design-platform/experience/performance";
export {
  emitTbdpExperienceCss,
  motionDataAttributes,
  feedbackDataAttributes,
} from "@/lib/design-platform/experience/emit-css";
export {
  TBDP_BEHAVIOR_CATALOG,
  TBDP_BEHAVIOR_COUNT,
  type TbdpBehaviorCatalogEntry,
} from "@/lib/design-platform/experience/behavior-catalog";

export type {
  DetectedImageContext,
  ImageCandidate,
  ImageRejectionRecord,
  ImageSelectionRecord,
  ImageSourceTier,
  IndustryImageRulesReport,
  IndustrySlotRules,
  ResolvedSlotImage,
  ResolveSlotImageInput,
  SlotImageRule,
  SlotOrientation,
} from "@/lib/ai-core/image-engine/rules/types";

export {
  detectImageContext,
  contextFromPackage,
  PACKAGE_INDUSTRY_MAP,
  slotOrientationForKind,
} from "@/lib/ai-core/image-engine/rules/detect-context";

export {
  resolveSlotImageSource,
  inferSourceTier,
} from "@/lib/ai-core/image-engine/rules/priority-resolver";

export {
  getIndustrySlotRules,
  listSupportedIndustryRules,
} from "@/lib/ai-core/image-engine/rules/slot-rules";

export {
  isWrongIndustryUrl,
  getUrlIndustryOwners,
  isSharedStockUrl,
  urlAllowedForSlot,
} from "@/lib/ai-core/image-engine/rules/url-registry";

export {
  runIndustryImageRulesEngine,
  validateImageCandidate,
} from "@/lib/ai-core/image-engine/rules/rules-engine";

export type {
  RunIndustryImageRulesInput,
  ValidateImageCandidateInput,
  ValidateImageCandidateResult,
} from "@/lib/ai-core/image-engine/rules/rules-engine";

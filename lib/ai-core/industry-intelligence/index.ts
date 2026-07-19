/**
 * AI Industry Website Intelligence — Website Builder vertical blueprints.
 * Prompt → industry detection → strategy / template / design / optimizer.
 */

export type {
  WebsiteIndustryIntelligence,
  IndustryDetectionResult,
  IndustryDetectionSource,
} from "@/lib/ai-core/industry-intelligence/types";

export {
  WEBSITE_INDUSTRY_INTELLIGENCE,
  WEBSITE_INDUSTRY_IDS,
  PRIMARY_WEBSITE_INDUSTRIES,
  getWebsiteIndustryIntelligence,
  listWebsiteIndustryIntelligence,
  listPrimaryWebsiteIndustryIntelligence,
} from "@/lib/ai-core/industry-intelligence/profiles";

export { detectWebsiteIndustry } from "@/lib/ai-core/industry-intelligence/detect";

export {
  applyIndustryIntelligenceToBrief,
  getIndustryDetectionFromBrief,
  intelligenceToTemplateFields,
  mergeIndustryIntelligenceIntoSelection,
} from "@/lib/ai-core/industry-intelligence/apply";

import type { WebsiteThemePresetId } from "@/lib/website/contracts/theme";

export const UNIFIED_TEMPLATE_ROUTE_KEY = "unifiedTemplateRoute";

/** Authoritative pre-lock routing decision — EDS-001 Phase A. */
export type UnifiedTemplateRoute = {
  version: "1";
  industryId: string;
  structureTemplateId: string;
  layoutTemplateIntelligenceId: string;
  visualThemePresetId: WebsiteThemePresetId;
  visualThemeTemplateIntelligenceId: string;
  premiumTemplateId: string;
  layoutFamily: string;
  pageTopology: string;
  reason: string;
  confidence: number;
  reasoningChain: string[];
};

import type { BusinessIntelligenceResult } from "@/lib/ai-core/business-intelligence/types";
import type { AgencyBrandKit } from "@/lib/ai-core/agency-brand-kit/types";
import type { AgencyContentPack } from "@/lib/ai-core/content-intelligence/generate";
import type { DesignDNAPrinciples } from "@/lib/ai-core/design-dna/types";

/** Unified agency contract — single source of truth for generation quality. */
export type AgencyGenerationContract = {
  version: "1";
  createdAt: string;
  promptHash: string;
  businessIntelligence: BusinessIntelligenceResult;
  designDNA: DesignDNAPrinciples;
  brandKit: AgencyBrandKit;
  content: AgencyContentPack;
  qualityThresholds: {
    minOverallScore: number;
    minIndustryRelevance: number;
    minDesignScore: number;
    minSeoScore: number;
    requireBusinessValidation: boolean;
  };
};

export const AGENCY_CONTRACT_KEY = "agencyGenerationContract";

/**
 * Design Intelligence — backward-compatible facade over the Design Intelligence Engine (DIE).
 * EDS-004: authoritative reasoning lives in die-engine.ts.
 */

import { runDesignIntelligenceEngine } from "@/lib/ai-core/design-intelligence/die-engine";
import type { DesignIntelligenceBrief } from "@/lib/ai-core/design-intelligence/types";
import type {
  CoreBusinessProfile,
  CoreProductStrategy,
} from "@/lib/ai-core/layers/types";
import type { TemplateDNAProfile } from "@/lib/ai-core/template-intelligence/template-dna";
import type { MasterWebsitePlan } from "@/lib/ai-core/master-planner/types";
import type { WebsiteGenerationPlan } from "@/lib/ai-core/architecture-validation/types";
import type { BusinessIntelligenceProfile } from "@/lib/ai-core/business-intelligence/types";

export type RunDesignIntelligenceParams = {
  profile?: CoreBusinessProfile | null;
  strategy?: CoreProductStrategy | null;
  industryId?: string | null;
  theme?: string | null;
  designStyle?: string | null;
  preferredStyle?: string | null;
  templateDna?: TemplateDNAProfile | null;
  masterPlan?: MasterWebsitePlan | null;
  websiteGenerationPlan?: WebsiteGenerationPlan | null;
  businessProfile?: BusinessIntelligenceProfile | null;
  prompt?: string | null;
  onProgress?: (message: string) => void;
};

/**
 * Advanced AI Design Intelligence — runs before design system build.
 * @deprecated Prefer runDesignIntelligenceEngine() for structured traces and DesignSystemSpec.
 */
export function runDesignIntelligence(
  params: RunDesignIntelligenceParams,
): DesignIntelligenceBrief {
  params.onProgress?.(
    "Design Intelligence Engine: DKB policy → layout reasoning → spec lock…",
  );
  const result = runDesignIntelligenceEngine(params);
  return result.intelligence;
}

export { runDesignIntelligenceEngine } from "@/lib/ai-core/design-intelligence/die-engine";

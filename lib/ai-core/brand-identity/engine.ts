/**
 * Brand Identity Intelligence Engine — runs before Design Intelligence / design plan.
 */

import { analyzeBrandIdentity } from "@/lib/ai-core/brand-identity/analyze";
import type { BrandIdentityBrief } from "@/lib/ai-core/brand-identity/types";
import type {
  CoreBusinessProfile,
  CoreProductStrategy,
} from "@/lib/ai-core/layers/types";

export type RunBrandIdentityIntelligenceParams = {
  profile?: CoreBusinessProfile | null;
  strategy?: CoreProductStrategy | null;
  industryId?: string | null;
  theme?: string | null;
  preferredStyle?: string | null;
  onProgress?: (message: string) => void;
};

/**
 * Produce a complete professional brand identity before website design generation.
 */
export function runBrandIdentityIntelligence(
  params: RunBrandIdentityIntelligenceParams,
): BrandIdentityBrief {
  params.onProgress?.(
    "Brand Identity Intelligence: analyzing industry, audience, market position, and personality…",
  );

  const brief = analyzeBrandIdentity({
    profile: params.profile,
    strategy: params.strategy,
    industryId: params.industryId,
    theme: params.theme,
    preferredStyle: params.preferredStyle,
  });

  params.onProgress?.(
    `[brand-identity] ${brief.presetId} · ${brief.typography.pairing} · ${brief.colors.primary} · ${brief.reason}`,
  );
  params.onProgress?.(brief.summary);

  return brief;
}

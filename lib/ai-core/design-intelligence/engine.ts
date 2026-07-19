import { analyzeDesignIntelligence } from "@/lib/ai-core/design-intelligence/analyze";
import type { DesignIntelligenceBrief } from "@/lib/ai-core/design-intelligence/types";
import type {
  CoreBusinessProfile,
  CoreProductStrategy,
} from "@/lib/ai-core/layers/types";

export type RunDesignIntelligenceParams = {
  profile?: CoreBusinessProfile | null;
  strategy?: CoreProductStrategy | null;
  industryId?: string | null;
  theme?: string | null;
  designStyle?: string | null;
  preferredStyle?: string | null;
  onProgress?: (message: string) => void;
};

/**
 * Advanced AI Design Intelligence — runs before design system build.
 */
export function runDesignIntelligence(
  params: RunDesignIntelligenceParams,
): DesignIntelligenceBrief {
  params.onProgress?.(
    "Design Intelligence: analyzing industry, audience, and brand positioning…",
  );
  const brief = analyzeDesignIntelligence(params);
  params.onProgress?.(
    `[design-intelligence] ${brief.premiumStyleId} · ${brief.layoutStyle} · ${brief.reason}`,
  );
  return brief;
}

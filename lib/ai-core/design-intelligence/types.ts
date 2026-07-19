import type { DesignPresetId } from "@/lib/ai-core/design-system/types";
import type { PremiumStyleId } from "@/lib/ai-core/design-system/premium/types";
import type { LayoutVariationId } from "@/lib/ai-core/design-intelligence/layout-selection";

/** Art-director brief produced before visual generation. */
export type DesignIntelligenceBrief = {
  premiumStyleId: PremiumStyleId;
  enginePreset: DesignPresetId;
  /** Resolved industry key from Layout Selection Engine. */
  industryKey: string;
  layoutStyle: string;
  /** AI Layout Selection Engine variation. */
  layoutVariationId: LayoutVariationId;
  /** Concrete hero treatment for scaffolds. */
  heroTreatment: string;
  /** Section composition token. */
  sectionLayout: string;
  cardStyle: string;
  navigationStyle: string;
  visualStyle: string;
  colorDirection: string;
  typographyDirection: string;
  spacingDirection: string;
  animationDirection: string;
  imageStyle: string;
  componentStyle: string;
  sectionStructure: string[];
  artDirectionNotes: string[];
  audienceInsight: string;
  positioningInsight: string;
  /** Industry-safe pools for uniqueness without generic clones. */
  allowedHeroVariants: string[];
  allowedSectionLayouts: string[];
  confidence: number;
  reason: string;
};

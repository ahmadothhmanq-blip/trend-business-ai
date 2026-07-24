import { getTemplateIntelligence } from "@/lib/ai-core/template-intelligence/catalog";

/** Canonical Template Intelligence ids for core visual presets. */
export const CANONICAL_TEMPLATE_INTELLIGENCE_IDS = {
  luxuryNoir: "ti-luxury-noir",
  modernClean: "ti-modern-clean",
  creativeStudio: "ti-creative-studio",
  corporateTrust: "ti-corporate-trust",
  minimalWhite: "ti-minimal-white",
  redPremium: "ti-red-premium",
} as const;

const PRESET_TO_TEMPLATE_INTELLIGENCE: Record<string, string> = {
  luxury: CANONICAL_TEMPLATE_INTELLIGENCE_IDS.luxuryNoir,
  modern: CANONICAL_TEMPLATE_INTELLIGENCE_IDS.modernClean,
  creative: CANONICAL_TEMPLATE_INTELLIGENCE_IDS.creativeStudio,
  corporate: CANONICAL_TEMPLATE_INTELLIGENCE_IDS.corporateTrust,
  minimal: CANONICAL_TEMPLATE_INTELLIGENCE_IDS.minimalWhite,
  tech: "ti-technology-dark",
  "premium-saas": "ti-saas-growth",
  technology: "ti-technology-dark",
};

const STYLE_TO_TEMPLATE_INTELLIGENCE: Record<string, string> = {
  ...PRESET_TO_TEMPLATE_INTELLIGENCE,
};

/**
 * Map a marketplace template payload to a Template Intelligence id for visual retheme.
 */
export function resolveTemplateIntelligenceForMarketplace(input: {
  style: string;
  designPreset: string;
  marketplaceTemplateId?: string;
}): string | null {
  const candidates = [
    PRESET_TO_TEMPLATE_INTELLIGENCE[input.designPreset],
    STYLE_TO_TEMPLATE_INTELLIGENCE[input.style],
    input.marketplaceTemplateId?.includes("luxury")
      ? CANONICAL_TEMPLATE_INTELLIGENCE_IDS.luxuryNoir
      : null,
    input.marketplaceTemplateId?.includes("minimal")
      ? CANONICAL_TEMPLATE_INTELLIGENCE_IDS.minimalWhite
      : null,
    input.marketplaceTemplateId?.includes("corporate")
      ? CANONICAL_TEMPLATE_INTELLIGENCE_IDS.corporateTrust
      : null,
    input.marketplaceTemplateId?.includes("creative")
      ? CANONICAL_TEMPLATE_INTELLIGENCE_IDS.creativeStudio
      : null,
  ].filter(Boolean) as string[];

  for (const id of candidates) {
    if (getTemplateIntelligence(id)) return id;
  }
  return null;
}

/** Verify canonical showcase templates resolve and exist in catalog. */
export function verifyCanonicalTemplateIntelligenceCatalog(): {
  ok: boolean;
  missing: string[];
} {
  const missing = Object.values(CANONICAL_TEMPLATE_INTELLIGENCE_IDS).filter(
    (id) => !getTemplateIntelligence(id),
  );
  return { ok: missing.length === 0, missing };
}

import type {
  TbdpAiBridgeInput,
  TbdpAiBridgeOutput,
} from "@/lib/design-platform/integration/core/types";
import { resolveDesignContext } from "@/lib/design-platform/integration/design-resolver";
import { resolveSectorId } from "@/lib/design-platform/integration/industry-map";

const PROMPT_SECTOR_HINTS: Array<{ pattern: RegExp; sectorId: TbdpAiBridgeOutput["sectorDnaId"] }> = [
  { pattern: /\b(restaurant|cafe|dining|menu)\b/i, sectorId: "restaurant" },
  { pattern: /\b(real\s*estate|property|realtor)\b/i, sectorId: "real-estate" },
  { pattern: /\b(medical|clinic|hospital|healthcare|doctor)\b/i, sectorId: "medical" },
  { pattern: /\b(hotel|resort|hospitality)\b/i, sectorId: "hotel-resort" },
  { pattern: /\b(law\s*firm|attorney|legal)\b/i, sectorId: "law-firm" },
  { pattern: /\b(finance|bank|investment|fintech)\b/i, sectorId: "finance" },
  { pattern: /\b(education|school|university|course)\b/i, sectorId: "education" },
  { pattern: /\b(logistics|shipping|freight|delivery)\b/i, sectorId: "logistics" },
  { pattern: /\b(creative|portfolio|agency|studio)\b/i, sectorId: "creative-studio" },
  { pattern: /\b(saas|software|platform|startup)\b/i, sectorId: "saas" },
];

function inferSectorFromPrompt(prompt?: string) {
  if (!prompt) return undefined;
  for (const hint of PROMPT_SECTOR_HINTS) {
    if (hint.pattern.test(prompt)) return hint.sectorId;
  }
  return undefined;
}

/**
 * AI bridge — resolves sector DNA → experience → component registry → layout rules.
 * Never selects components randomly; all choices come from sector metadata.
 */
export function resolveAiWebsiteDesign(input: TbdpAiBridgeInput): TbdpAiBridgeOutput {
  const sectorDnaId = resolveSectorId({
    sectorId: input.sectorId ?? inferSectorFromPrompt(input.prompt),
    industryId: input.industryId,
  });

  const designContext = resolveDesignContext({
    sectorId: sectorDnaId,
    language: input.language,
    goal: input.goal,
    direction: input.direction,
  });

  const { aiSelections, components } = designContext;

  return {
    sectorDnaId,
    designContext,
    componentIds: components.preferred,
    layoutId: aiSelections.layoutId,
    pageFlow: aiSelections.pageFlow,
    heroComponent: aiSelections.heroComponent,
    navComponent: aiSelections.navComponent,
    ctaComponent: aiSelections.ctaComponent,
    motionPresets: aiSelections.motionPresets,
    cardComponent: aiSelections.cardComponent,
    primaryButton: aiSelections.primaryButton,
  };
}

import type { TbdpSectorId } from "@/lib/design-platform/sector-dna";

/**
 * Maps builder / AKB industry identifiers to TBDP sector DNA ids.
 * Unknown industries fall back to `saas` (general business default).
 */
const INDUSTRY_TO_SECTOR: Record<string, TbdpSectorId> = {
  saas: "saas",
  "software-as-a-service": "saas",
  "b2b-saas": "saas",
  "ai-startup": "saas",
  technology: "saas",
  tech: "saas",
  startup: "saas",

  restaurant: "restaurant",
  cafe: "restaurant",
  "food-beverage": "restaurant",
  hospitality: "hotel-resort",
  hotel: "hotel-resort",
  resort: "hotel-resort",
  "hotel-resort": "hotel-resort",
  lodging: "hotel-resort",

  "real-estate": "real-estate",
  realestate: "real-estate",
  property: "real-estate",
  realtor: "real-estate",

  medical: "medical",
  healthcare: "medical",
  clinic: "medical",
  dental: "medical",
  hospital: "medical",
  wellness: "medical",

  creative: "creative-studio",
  "creative-studio": "creative-studio",
  portfolio: "creative-studio",
  agency: "creative-studio",
  design: "creative-studio",

  legal: "law-firm",
  "law-firm": "law-firm",
  attorney: "law-firm",
  lawyer: "law-firm",

  finance: "finance",
  financial: "finance",
  banking: "finance",
  insurance: "finance",
  investment: "finance",
  fintech: "finance",

  education: "education",
  school: "education",
  university: "education",
  learning: "education",
  training: "education",

  logistics: "logistics",
  shipping: "logistics",
  freight: "logistics",
  supplychain: "logistics",
  "supply-chain": "logistics",
  transport: "logistics",
  delivery: "logistics",
};

const TEMPLATE_TO_SECTOR: Record<string, TbdpSectorId> = {
  "saas-enterprise": "saas",
  "ai-startup-signal": "saas",
  "restaurant-signature": "restaurant",
  "real-estate-prestige": "real-estate",
  "medical-premium": "medical",
  "creative-portfolio": "creative-studio",
  "modern-business": "saas",
};

export function normalizeIndustryId(raw?: string | null): string {
  return (raw ?? "")
    .toLowerCase()
    .trim()
    .replace(/[_\s]+/g, "-");
}

export function resolveSectorIdFromIndustry(industryId?: string | null): TbdpSectorId {
  const normalized = normalizeIndustryId(industryId);
  if (!normalized) return "saas";
  return INDUSTRY_TO_SECTOR[normalized] ?? "saas";
}

export function resolveSectorIdFromTemplate(templateId?: string | null): TbdpSectorId | undefined {
  const normalized = normalizeIndustryId(templateId);
  if (!normalized) return undefined;
  return TEMPLATE_TO_SECTOR[normalized];
}

export function resolveSectorId(input: {
  sectorId?: TbdpSectorId;
  industryId?: string | null;
  templateId?: string | null;
}): TbdpSectorId {
  if (input.sectorId) return input.sectorId;
  const fromTemplate = resolveSectorIdFromTemplate(input.templateId);
  if (fromTemplate) return fromTemplate;
  return resolveSectorIdFromIndustry(input.industryId);
}

export const TBDP_INDUSTRY_SECTOR_MAP = { ...INDUSTRY_TO_SECTOR };
export const TBDP_TEMPLATE_SECTOR_MAP = { ...TEMPLATE_TO_SECTOR };

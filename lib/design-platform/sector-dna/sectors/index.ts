import type { TbdpSectorDnaProfile } from "@/lib/design-platform/sector-dna/core/types";
import { CREATIVE_STUDIO_SECTOR_DNA } from "@/lib/design-platform/sector-dna/sectors/creative-studio";
import { EDUCATION_SECTOR_DNA } from "@/lib/design-platform/sector-dna/sectors/education";
import { FINANCE_SECTOR_DNA } from "@/lib/design-platform/sector-dna/sectors/finance";
import { HOTEL_RESORT_SECTOR_DNA } from "@/lib/design-platform/sector-dna/sectors/hotel-resort";
import { LAW_FIRM_SECTOR_DNA } from "@/lib/design-platform/sector-dna/sectors/law-firm";
import { LOGISTICS_SECTOR_DNA } from "@/lib/design-platform/sector-dna/sectors/logistics";
import { MEDICAL_SECTOR_DNA } from "@/lib/design-platform/sector-dna/sectors/medical";
import { REAL_ESTATE_SECTOR_DNA } from "@/lib/design-platform/sector-dna/sectors/real-estate";
import { RESTAURANT_SECTOR_DNA } from "@/lib/design-platform/sector-dna/sectors/restaurant";
import { SAAS_SECTOR_DNA } from "@/lib/design-platform/sector-dna/sectors/saas";

export const TBDP_SECTOR_DNA_CATALOG: TbdpSectorDnaProfile[] = [
  SAAS_SECTOR_DNA,
  RESTAURANT_SECTOR_DNA,
  REAL_ESTATE_SECTOR_DNA,
  MEDICAL_SECTOR_DNA,
  CREATIVE_STUDIO_SECTOR_DNA,
  HOTEL_RESORT_SECTOR_DNA,
  LAW_FIRM_SECTOR_DNA,
  FINANCE_SECTOR_DNA,
  EDUCATION_SECTOR_DNA,
  LOGISTICS_SECTOR_DNA,
];

export const TBDP_SECTOR_DNA_COUNT = TBDP_SECTOR_DNA_CATALOG.length;

export {
  SAAS_SECTOR_DNA,
  RESTAURANT_SECTOR_DNA,
  REAL_ESTATE_SECTOR_DNA,
  MEDICAL_SECTOR_DNA,
  CREATIVE_STUDIO_SECTOR_DNA,
  HOTEL_RESORT_SECTOR_DNA,
  LAW_FIRM_SECTOR_DNA,
  FINANCE_SECTOR_DNA,
  EDUCATION_SECTOR_DNA,
  LOGISTICS_SECTOR_DNA,
};

export function getSectorDna(
  id: TbdpSectorDnaProfile["id"],
): TbdpSectorDnaProfile | undefined {
  return TBDP_SECTOR_DNA_CATALOG.find((s) => s.id === id);
}

import type { TbdpSectorDnaProfile } from "@/lib/design-platform/sector-dna/core/types";
import { TBDP_SECTOR_DNA_CATALOG } from "@/lib/design-platform/sector-dna/sectors";

export type TbdpSectorCatalogEntry = {
  id: TbdpSectorDnaProfile["id"];
  name: string;
  experienceProfiles: TbdpSectorDnaProfile["experienceProfiles"];
  primaryGoal: string;
  confidence: number;
};

/** Official TBDP sector DNA catalog — design intelligence per industry. */
export const TBDP_SECTOR_CATALOG: TbdpSectorCatalogEntry[] = TBDP_SECTOR_DNA_CATALOG.map(
  (sector) => ({
    id: sector.id,
    name: sector.name,
    experienceProfiles: sector.experienceProfiles,
    primaryGoal: sector.growth.conversionStrategy,
    confidence: sector.ai.confidence,
  }),
);

export const TBDP_SECTOR_CATALOG_COUNT = TBDP_SECTOR_CATALOG.length;

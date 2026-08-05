/**
 * TBDP Phase 4 — Sector Design DNA System
 *
 * Design intelligence layer defining unique identity per industry.
 * References Phase 1 Foundations, Phase 2 Components, Phase 3 Experience only.
 * Isolated from website builder, V2 templates, and runtime.
 */

export {
  TBDP_SECTOR_DNA_PHASE,
  TBDP_SECTOR_DNA_VERSION,
} from "@/lib/design-platform/sector-dna/constants";

export * from "@/lib/design-platform/sector-dna/core";
export * from "@/lib/design-platform/sector-dna/experience-profiles";
export * from "@/lib/design-platform/sector-dna/sectors";
export * from "@/lib/design-platform/sector-dna/catalog";
export * from "@/lib/design-platform/sector-dna/schema";
export * from "@/lib/design-platform/sector-dna/validation";
export * from "@/lib/design-platform/sector-dna/ai";
export { resolveSectorDna } from "@/lib/design-platform/sector-dna/resolve";
export type { TbdpResolvedSectorDna, ResolveSectorDnaOptions } from "@/lib/design-platform/sector-dna/resolve";

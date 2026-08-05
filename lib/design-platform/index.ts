/**
 * Trend Business AI Design Platform (TBDP)
 *
 * Phase 1 — Foundations
 * Permanent design foundation for all Trend Business AI products.
 * Isolated, backward compatible, framework agnostic.
 *
 * @see lib/design-platform/docs/ARCHITECTURE.md
 */
export {
  TBDP_PACKAGE_ID,
  TBDP_SPEC_VERSION,
  TBDP_PHASE,
  TBDP_UI_PHASE,
  TBDP_UI_VERSION,
  TBDP_EXPERIENCE_PHASE,
  TBDP_EXPERIENCE_VERSION,
  TBDP_EXPERIENCE_PREFIX,
  TBDP_SECTOR_DNA_PHASE,
  TBDP_SECTOR_DNA_VERSION,
  TBDP_INTEGRATION_PHASE,
  TBDP_INTEGRATION_VERSION,
  TBDP_CSS_VAR_PREFIX,
} from "@/lib/design-platform/constants";

export * from "@/lib/design-platform/sector-dna";
export * from "@/lib/design-platform/integration";

export * from "@/lib/design-platform/foundations";
export * from "@/lib/design-platform/tokens";
export * from "@/lib/design-platform/validation";
export * from "@/lib/design-platform/components";
export * from "@/lib/design-platform/experience";
export type * from "@/lib/design-platform/types";

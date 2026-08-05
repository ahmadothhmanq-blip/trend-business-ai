export {
  TBDP_INTEGRATION_PHASE,
  TBDP_INTEGRATION_VERSION,
} from "@/lib/design-platform/constants";

/** Project settings key for persisted sector DNA id (builder ignores if unknown). */
export const TBDP_PROJECT_SETTING_SECTOR_DNA_ID = "tbdpSectorDnaId" as const;

/** Project settings key for resolved design context hash. */
export const TBDP_PROJECT_SETTING_DESIGN_CONTEXT_HASH = "tbdpDesignContextHash" as const;

/** Project settings key for TBDP integration version stamp. */
export const TBDP_PROJECT_SETTING_INTEGRATION_VERSION = "tbdpIntegrationVersion" as const;

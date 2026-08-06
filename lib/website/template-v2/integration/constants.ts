/** Project settings key — persisted optimized Website Blueprint (V2 design SSOT). */
export {
  WB_WEBSITE_BLUEPRINT_SETTING,
  WB_DESIGN_DIRECTOR_REPORT_SETTING,
} from "@/lib/website/template-v2/constants";

/** Project settings key — production integration pipeline version. */
export const WB_PRODUCTION_INTEGRATION_VERSION_SETTING =
  "productionIntegrationVersion";

export const PRODUCTION_INTEGRATION_VERSION = "1.0.0";

/** Disable with WB_PRODUCTION_BLUEPRINT=0 */
export function isProductionBlueprintEnabled(): boolean {
  return process.env.WB_PRODUCTION_BLUEPRINT !== "0";
}

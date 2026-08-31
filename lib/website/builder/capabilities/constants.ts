/** Project settings key — persisted capability manifest (v1). */
export const WB_WEBSITE_CAPABILITY_MANIFEST_SETTING = "websiteCapabilityManifest";

/** Bump when detection rules or manifest schema change materially. */
export const CAPABILITY_ANALYZER_SET_VERSION = "1.0.0";

export const CAPABILITY_MANIFEST_SPEC_VERSION = "1.0.0" as const;

/** Score thresholds for weighted evidence (0–1 normalized). */
export const CAPABILITY_CONFIDENCE_THRESHOLDS = {
  high: 0.6,
  medium: 0.3,
} as const;

/**
 * Capability toolbar is on by default. Set `WB_CAPABILITY_TOOLBAR=0` to restore
 * the legacy static nine-tool rail (backward compatibility).
 */
export function isCapabilityToolbarEnabled(): boolean {
  const raw = process.env.WB_CAPABILITY_TOOLBAR;
  if (raw === "0" || raw === "false") return false;
  return true;
}

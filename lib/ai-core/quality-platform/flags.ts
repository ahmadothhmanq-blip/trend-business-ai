/** QE Phase 5 — unified quality platform flags. */

export function isUnifiedQualityPlatformEnabled(): boolean {
  const value = process.env.WB_UNIFIED_QUALITY_PLATFORM;
  return value !== "0" && value !== "false";
}

export const QUALITY_PLATFORM_VERSION = "qe-5.0";

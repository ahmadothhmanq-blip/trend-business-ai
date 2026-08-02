/**
 * Quality gate enforcement flags — Q1 Foundation defaults on.
 */

export function isQualityGateEnforcementEnabled(): boolean {
  const value = process.env.WB_QUALITY_GATES;
  return value !== "0" && value !== "false";
}

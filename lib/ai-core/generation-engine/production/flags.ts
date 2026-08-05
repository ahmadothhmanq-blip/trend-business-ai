function envTruthy(name: string): boolean {
  const value = process.env[name];
  return value === "true" || value === "1";
}

/** Full production pipeline — TBGE → Master Plan → AWQE → Builder. */
export function isProductionPipelineEnabled(): boolean {
  return envTruthy("WB_PRODUCTION_PIPELINE");
}

/** Returns true when any integrated pipeline is active. */
export function isIntegratedPipelineEnabled(): boolean {
  return isProductionPipelineEnabled() || envTruthy("WB_MASTER_PLAN");
}

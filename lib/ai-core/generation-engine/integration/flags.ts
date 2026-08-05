function envTruthy(name: string): boolean {

  const value = process.env[name];

  return value === "true" || value === "1";

}



function isProductionPipelineFlag(): boolean {

  return envTruthy("WB_PRODUCTION_PIPELINE");

}



/** Master Plan integration — defaults off for backward compatibility. */

export function isMasterPlanIntegrationEnabled(): boolean {

  return envTruthy("WB_MASTER_PLAN") || isProductionPipelineFlag();

}



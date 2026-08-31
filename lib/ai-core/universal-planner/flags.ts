function envTruthy(name: string): boolean {
  const value = process.env[name];
  return value === "1" || value === "true";
}

/**
 * Global Universal Planner gate.
 * Default OFF until per-service production validation is complete.
 */
export function isUniversalPlannerEnabled(): boolean {
  return envTruthy("UNIVERSAL_PLANNER_ENABLED");
}

/**
 * Website Builder integration gate for Universal Planner.
 * Requires both global and service flag to be ON.
 */
export function isUniversalPlannerWebsiteEnabled(): boolean {
  return isUniversalPlannerEnabled() && envTruthy("UNIVERSAL_PLANNER_WEBSITE_ENABLED");
}

/**
 * App Builder integration gate for Universal Planner.
 * Requires both global and service flag to be ON.
 */
export function isUniversalPlannerAppEnabled(): boolean {
  return isUniversalPlannerEnabled() && envTruthy("UNIVERSAL_PLANNER_APP_ENABLED");
}

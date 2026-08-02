const PAID_PLAN_IDS = new Set(["pro", "business", "enterprise"]);

/** True when the user has an active paid subscription plan. */
export function isPaidWebsitePlan(planId?: string | null): boolean {
  if (!planId || planId === "free") return false;
  return PAID_PLAN_IDS.has(planId);
}

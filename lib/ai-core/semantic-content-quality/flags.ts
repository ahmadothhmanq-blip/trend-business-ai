/** QE Phase 3 — semantic content quality flags (default on). */

export function isSemanticQualityEnabled(): boolean {
  const value = process.env.WB_SEMANTIC_QUALITY;
  return value !== "0" && value !== "false";
}

/** Optional bounded LLM-lite scorer — off by default to control cost. */
export function isSemanticLlmScorerEnabled(): boolean {
  const value = process.env.WB_SEMANTIC_LLM_SCORE;
  return value === "1" || value === "true";
}

export const SEMANTIC_LLM_MAX_FILES = 2;
export const SEMANTIC_LLM_MAX_CHARS = 2500;

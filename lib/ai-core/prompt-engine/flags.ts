/**
 * Prompt Optimization Engine — feature flags (Performance Phase 2.6).
 *
 * WB_PROMPT_OPTIMIZATION=0 (default) — legacy full-metadata prompts.
 * WB_PROMPT_OPTIMIZATION=1           — compact metadata for file-generation prompts.
 */

function envTruthy(name: string): boolean {
  const value = process.env[name];
  return value === "true" || value === "1";
}

export const promptEngineFlags = {
  get promptOptimization() {
    return envTruthy("WB_PROMPT_OPTIMIZATION");
  },
} as const;

export function isPromptOptimizationEnabled(): boolean {
  return envTruthy("WB_PROMPT_OPTIMIZATION");
}

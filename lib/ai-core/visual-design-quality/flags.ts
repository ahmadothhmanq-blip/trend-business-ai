/** QE Phase 4 — visual design quality flags (default on, no LLM). */

export function isVisualDesignQualityEnabled(): boolean {
  const value = process.env.WB_VISUAL_DESIGN_QUALITY;
  return value !== "0" && value !== "false";
}

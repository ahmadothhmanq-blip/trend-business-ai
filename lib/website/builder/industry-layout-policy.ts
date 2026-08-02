/**
 * Industry layout & visual theme policies (delegates to Architecture Knowledge Base).
 */

import type { WebsiteThemePresetId } from "@/lib/website/builder/theme-catalog";
import {
  getIndustryKnowledge,
  isEditorialLayoutIndustry as akbIsEditorialLayoutIndustry,
  resolveIndustryLayoutFamily as akbResolveIndustryLayoutFamily,
  resolveVisualThemePresetForIndustry as akbResolveVisualTheme,
} from "@/lib/ai-core/architecture-knowledge-base";

import type { IndustryLayoutFamily } from "@/lib/website/contracts/layout";
export type { IndustryLayoutFamily } from "@/lib/website/contracts/layout";

/** @deprecated Use Architecture Knowledge Base editorial flags on industry entries. */
export const EDITORIAL_LAYOUT_INDUSTRIES = new Set(
  ["blog", "media", "magazine", "publishing", "journalism", "fashion", "agency"].filter(
    (id) => akbIsEditorialLayoutIndustry(id),
  ),
);

export function resolveIndustryLayoutFamily(
  industryId: string,
): IndustryLayoutFamily {
  return akbResolveIndustryLayoutFamily(industryId).value as IndustryLayoutFamily;
}

export function isEditorialLayoutIndustry(industryId: string): boolean {
  return akbIsEditorialLayoutIndustry(industryId);
}

export function resolveVisualThemePresetForIndustry(
  industryId: string,
  style: string,
  explicitThemeId?: string | null,
): WebsiteThemePresetId {
  return akbResolveVisualTheme(industryId, style, explicitThemeId).value;
}

export { getIndustryKnowledge };

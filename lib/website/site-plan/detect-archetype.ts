import {
  SITE_ARCHETYPE_REGISTRY,
  type SiteArchetypeDefinition,
} from "@/lib/website/site-plan/archetypes";
import type { SiteArchetypeId } from "@/lib/website/site-plan/types";

const ARABIC_BOOSTS: Partial<Record<SiteArchetypeId, string[]>> = {
  "real-estate": ["عقار", "عقارات"],
  "restaurant-local": ["مطعم"],
  "mobile-app-landing": ["تطبيق"],
  "electronics-retail": ["جوالات", "جوال", "موبايل", "هواتف"],
  "fashion-retail": ["أزياء", "ملابس", "فستان", "فساتين", "موضة"],
};

function scoreArchetype(def: SiteArchetypeDefinition, text: string): number {
  const lower = text.toLowerCase();
  let score = 0;
  for (const hint of def.industryHints) {
    const h = hint.toLowerCase();
    if (h.length >= 3 && lower.includes(h)) score += 2;
  }
  const boosts = ARABIC_BOOSTS[def.id];
  if (boosts) {
    for (const token of boosts) {
      if (lower.includes(token)) score += 3;
    }
  }
  return score;
}

/** Detect archetype from user prompt / industry string (no LLM). */
export function detectSiteArchetypeFromText(
  text?: string | null,
): SiteArchetypeId {
  const input = (text ?? "").trim();
  if (!input) return "general-business";

  let best: SiteArchetypeId = "general-business";
  let bestScore = 0;

  for (const def of SITE_ARCHETYPE_REGISTRY) {
    if (def.id === "general-business") continue;
    const score = scoreArchetype(def, input);
    if (score > bestScore) {
      bestScore = score;
      best = def.id;
    }
  }

  return bestScore > 0 ? best : "general-business";
}

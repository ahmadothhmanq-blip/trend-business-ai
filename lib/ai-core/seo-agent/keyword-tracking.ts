/**
 * Keyword tracking store (dashboard). Ready for Search Console sync later.
 */

import type { KeywordTrackingPoint } from "@/lib/ai-core/seo-agent/types";
import type { KeywordPlan } from "@/lib/ai-core/seo-performance/types";

type StoreState = {
  byGeneration: Map<string, KeywordTrackingPoint[]>;
};

const globalStore = globalThis as typeof globalThis & {
  __tbaSeoKeywordTracking?: StoreState;
};

function getState(): StoreState {
  if (!globalStore.__tbaSeoKeywordTracking) {
    globalStore.__tbaSeoKeywordTracking = { byGeneration: new Map() };
  }
  return globalStore.__tbaSeoKeywordTracking;
}

function hash(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i += 1) {
    h = (h + input.charCodeAt(i) * (i + 1)) % 997;
  }
  return h;
}

function intentFor(keyword: string, index: number): KeywordTrackingPoint["intent"] {
  const k = keyword.toLowerCase();
  if (k.includes("buy") || k.includes("price") || k.includes("cost")) {
    return "transactional";
  }
  if (k.includes("best") || k.includes("vs") || k.includes("near")) {
    return "commercial";
  }
  if (index === 0) return "navigational";
  return "informational";
}

/**
 * Build or refresh tracked keywords for a generation from the keyword plan.
 */
export function syncKeywordTracking(
  generationId: string,
  plan: KeywordPlan,
): KeywordTrackingPoint[] {
  const keywords = [
    plan.primary,
    ...plan.secondary.slice(0, 4),
    ...plan.longTail.slice(0, 3),
  ].filter(Boolean);

  const points: KeywordTrackingPoint[] = keywords.map((keyword, index) => {
    const base = hash(`${generationId}:${keyword}`);
    const visibility = 35 + (base % 50);
    const trendRoll = base % 3;
    return {
      keyword,
      visibility,
      trend: trendRoll === 0 ? "up" : trendRoll === 1 ? "flat" : "down",
      intent: intentFor(keyword, index),
    };
  });

  getState().byGeneration.set(generationId, points);
  return points;
}

export function getKeywordTracking(
  generationId: string,
): KeywordTrackingPoint[] {
  return getState().byGeneration.get(generationId) || [];
}

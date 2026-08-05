import { INDUSTRY_IMAGE_PROFILES } from "@/lib/ai-core/image-engine/profiles/data";
import type { ImageSlotKind } from "@/lib/ai-core/image-engine/slots";

/** Maps image URLs to the industries that own them in curated libraries. */
const URL_INDUSTRY_OWNERS = new Map<string, Set<string>>();

/** URLs shared across multiple industries (generic stock). */
const SHARED_URLS = new Set<string>();

function initUrlRegistry(): void {
  if (URL_INDUSTRY_OWNERS.size > 0) return;

  const urlCounts = new Map<string, number>();

  for (const profile of INDUSTRY_IMAGE_PROFILES) {
    for (const pool of Object.values(profile.slots)) {
      for (const url of pool) {
        urlCounts.set(url, (urlCounts.get(url) ?? 0) + 1);
        const owners = URL_INDUSTRY_OWNERS.get(url) ?? new Set<string>();
        owners.add(profile.id);
        URL_INDUSTRY_OWNERS.set(url, owners);
      }
    }
  }

  for (const [url, count] of urlCounts) {
    if (count >= 3) SHARED_URLS.add(url);
  }
}

/**
 * Returns true when a URL is exclusive to industries other than the target.
 * Prevents template images from leaking across unrelated industries.
 */
export function isWrongIndustryUrl(url: string, targetIndustryId: string): boolean {
  initUrlRegistry();
  if (!url || SHARED_URLS.has(url)) return false;

  const owners = URL_INDUSTRY_OWNERS.get(url);
  if (!owners || owners.size === 0) return false;
  if (owners.has(targetIndustryId)) return false;

  return true;
}

export function getUrlIndustryOwners(url: string): string[] {
  initUrlRegistry();
  return [...(URL_INDUSTRY_OWNERS.get(url) ?? [])];
}

export function isSharedStockUrl(url: string): boolean {
  initUrlRegistry();
  return SHARED_URLS.has(url);
}

export function urlAllowedForSlot(
  url: string,
  kind: ImageSlotKind,
  industryId: string,
  profileSlots: Record<ImageSlotKind, string[]>,
): boolean {
  const pool = profileSlots[kind] ?? [];
  if (pool.includes(url)) return true;
  if (isSharedStockUrl(url)) return true;
  if (!isWrongIndustryUrl(url, industryId)) return true;
  return false;
}

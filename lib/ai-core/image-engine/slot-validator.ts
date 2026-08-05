import type { IndustryImageProfile } from "@/lib/ai-core/image-engine/profiles/types";
import {
  IMAGE_SLOT_KINDS,
  SLOT_MIN_COUNTS,
  type ImageSlotAssignment,
  type ImageSlotKind,
  type SiteImageSlotMap,
} from "@/lib/ai-core/image-engine/slots";

export type SlotValidationIssue = {
  id: string;
  severity: "critical" | "major" | "minor";
  category:
    | "wrong-industry"
    | "duplicate"
    | "aspect-ratio"
    | "low-quality"
    | "wrong-section"
    | "missing";
  slotId: string;
  kind: ImageSlotKind;
  detail: string;
};

export type SlotValidationReport = {
  passed: boolean;
  issues: SlotValidationIssue[];
  repairs: number;
};

const PLACEHOLDER_RE =
  /placehold\.co|via\.placeholder|picsum\.photos|dummyimage|data:image\/svg/i;

const EXPECTED_ASPECT: Record<ImageSlotKind, { min: number; max: number }> = {
  hero: { min: 1.4, max: 2.2 },
  gallery: { min: 0.7, max: 2.0 },
  about: { min: 1.0, max: 2.0 },
  features: { min: 0.8, max: 1.8 },
  team: { min: 0.7, max: 1.2 },
  products: { min: 0.8, max: 1.5 },
  testimonials: { min: 0.8, max: 1.2 },
  backgrounds: { min: 1.2, max: 2.5 },
  cta: { min: 1.4, max: 2.5 },
};

function isLowQualityUrl(url: string): boolean {
  return PLACEHOLDER_RE.test(url) || !url.trim();
}

function pickReplacement(
  profile: IndustryImageProfile,
  kind: ImageSlotKind,
  used: Set<string>,
  index: number,
): string {
  const pool = profile.slots[kind] ?? profile.slots.hero;
  for (let i = 0; i < pool.length; i += 1) {
    const candidate = pool[(index + i) % pool.length]!;
    if (!used.has(candidate)) return candidate;
  }
  return pool[index % pool.length] ?? profile.slots.hero[0] ?? "";
}

/**
 * Validate semantic slot assignments and auto-repair rejected images.
 */
export function validateAndRepairSlots(
  slots: SiteImageSlotMap,
  profile: IndustryImageProfile,
): SlotValidationReport & { slots: SiteImageSlotMap } {
  const issues: SlotValidationIssue[] = [];
  const used = new Set<string>();
  const repaired: SiteImageSlotMap = {
    hero: [],
    gallery: [],
    about: [],
    features: [],
    team: [],
    products: [],
    testimonials: [],
    backgrounds: [],
    cta: [],
  };
  let repairCount = 0;

  for (const kind of IMAGE_SLOT_KINDS) {
    const minCount = SLOT_MIN_COUNTS[kind];
    const source = slots[kind];
    const next: ImageSlotAssignment[] = [];

    for (let i = 0; i < Math.max(minCount, source.length); i += 1) {
      const slot = source[i];
      let url = slot?.url ?? "";
      let alt = slot?.alt ?? `${profile.label} ${kind} photography`;
      const slotId = slot?.id ?? `${kind}-${i + 1}`;
      let rejected = false;

      if (!url || isLowQualityUrl(url)) {
        issues.push({
          id: `low-quality-${slotId}`,
          severity: kind === "hero" ? "critical" : "major",
          category: "low-quality",
          slotId,
          kind,
          detail: "Placeholder or empty image rejected.",
        });
        rejected = true;
      }

      if (
        url &&
        slot?.industryId &&
        slot.industryId !== profile.id &&
        !profile.allowReuse
      ) {
        issues.push({
          id: `wrong-industry-${slotId}`,
          severity: "major",
          category: "wrong-industry",
          slotId,
          kind,
          detail: `Image tagged for "${slot.industryId}" but profile is "${profile.id}".`,
        });
        rejected = true;
      }

      if (url && !profile.allowReuse && used.has(url)) {
        issues.push({
          id: `duplicate-${slotId}`,
          severity: "minor",
          category: "duplicate",
          slotId,
          kind,
          detail: "Duplicate image URL rejected.",
        });
        rejected = true;
      }

      if (rejected) {
        url = pickReplacement(profile, kind, used, i);
        alt = `${profile.label} ${kind} photography`;
        repairCount += 1;
      }

      if (url) {
        if (!profile.allowReuse) used.add(url);
        next.push({
          id: slotId,
          kind,
          url,
          alt,
          industryId: profile.id,
          provider: slot?.provider ?? "premium-stock",
        });
      }
    }

    while (next.length < minCount) {
      const url = pickReplacement(profile, kind, used, next.length);
      if (!url) break;
      if (!profile.allowReuse) used.add(url);
      next.push({
        id: `${kind}-${next.length + 1}`,
        kind,
        url,
        alt: `${profile.label} ${kind} photography`,
        industryId: profile.id,
        provider: "premium-stock",
      });
      repairCount += 1;
      issues.push({
        id: `missing-${kind}-${next.length}`,
        severity: kind === "hero" ? "critical" : "major",
        category: "missing",
        slotId: `${kind}-${next.length}`,
        kind,
        detail: `Filled missing ${kind} slot from industry profile.`,
      });
    }

    repaired[kind] = next;
  }

  const critical = issues.filter((i) => i.severity === "critical").length;
  return {
    passed: critical === 0 && repaired.hero.length > 0,
    issues,
    repairs: repairCount,
    slots: repaired,
  };
}

/** Soft aspect-ratio check — Unsplash URLs lack dimensions; validate w= param heuristics. */
export function checkAspectRatioHint(
  url: string,
  kind: ImageSlotKind,
): boolean {
  const range = EXPECTED_ASPECT[kind];
  const wMatch = url.match(/[?&]w=(\d+)/);
  const width = wMatch ? Number(wMatch[1]) : 1600;
  const ratio = width >= 1200 ? 16 / 9 : width >= 800 ? 4 / 5 : 1;
  return ratio >= range.min && ratio <= range.max;
}

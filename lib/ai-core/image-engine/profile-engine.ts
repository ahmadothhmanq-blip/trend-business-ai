import type { CoreAssetManifest } from "@/lib/ai-core/layers/types";
import { resolveImageProfile } from "@/lib/ai-core/image-engine/profiles";
import type { ImageProfileContext } from "@/lib/ai-core/image-engine/profiles/types";
import {
  emptySlotMap,
  flattenSlotUrls,
  IMAGE_SLOT_KINDS,
  roleToSlotKind,
  type ImageSlotAssignment,
  type ImageSlotKind,
  type SiteImageSlotMap,
} from "@/lib/ai-core/image-engine/slots";
import { runIndustryImageRulesEngine } from "@/lib/ai-core/image-engine/rules";
import { resolveIndustrySlotCounts } from "@/lib/ai-core/image-engine/industry-slot-policy";

export type ProfileEngineResult = {
  slots: SiteImageSlotMap;
  profileId: string;
  visualStyle: string;
  colorMood: string;
  usedUrls: string[];
};

function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash + seed.charCodeAt(i) * (i + 1)) % 997;
  }
  return hash;
}

function pickUnique(
  pool: string[],
  used: Set<string>,
  seed: string,
  allowReuse: boolean,
): string {
  if (!pool.length) return "";
  const start = hashSeed(seed) % pool.length;
  for (let offset = 0; offset < pool.length; offset += 1) {
    const url = pool[(start + offset) % pool.length]!;
    if (allowReuse || !used.has(url)) {
      if (!allowReuse) used.add(url);
      return url;
    }
  }
  return pool[start % pool.length]!;
}

/**
 * Build a deduplicated semantic slot map from an industry profile.
 */
export function buildSlotsFromProfile(
  ctx: ImageProfileContext,
  opts?: { projectSeed?: string },
): ProfileEngineResult {
  const resolved = resolveImageProfile(ctx);
  const { profile } = resolved;
  const used = new Set<string>();
  const slots = emptySlotMap();
  const seedBase = opts?.projectSeed || ctx.industry || profile.id;
  const slotCounts = resolveIndustrySlotCounts(ctx);

  for (const kind of IMAGE_SLOT_KINDS) {
    const pool = profile.slots[kind] ?? [];
    const count = Math.min(
      slotCounts[kind],
      pool.length > 0 ? pool.length : slotCounts[kind],
    );
    for (let i = 0; i < count; i += 1) {
      const url = pickUnique(
        pool.length ? pool : profile.slots.hero,
        used,
        `${seedBase}:${kind}:${i}`,
        profile.allowReuse === true,
      );
      if (!url) continue;
      slots[kind].push({
        id: `${kind}-${i + 1}`,
        kind,
        url,
        alt: `${profile.label} ${kind} photography`,
        industryId: profile.id,
        provider: "premium-stock",
      });
    }
  }

  const repaired = runIndustryImageRulesEngine({
    slots,
    ctx,
  });
  return {
    slots: repaired.slots,
    profileId: profile.id,
    visualStyle: profile.visualStyle,
    colorMood: profile.colorMood,
    usedUrls: flattenSlotUrls(repaired.slots),
  };
}

/**
 * Merge manifest assets into semantic slots, filling gaps from industry profile.
 */
export function hydrateSlotsFromManifest(
  manifest: CoreAssetManifest,
  ctx: ImageProfileContext,
  opts?: { projectSeed?: string },
): ProfileEngineResult {
  const base = buildSlotsFromProfile(ctx, opts);
  const slots = { ...base.slots };

  for (const item of manifest.items) {
    if (!item.url || item.role === "icon") continue;
    const kind = roleToSlotKind(item.role);
    const existing = slots[kind];
    const duplicate = existing.some((s) => s.url === item.url);
    if (duplicate) continue;
    existing.push({
      id: item.id,
      kind,
      url: item.url,
      alt: item.alt || `${kind} photography`,
      industryId: base.profileId,
      provider: item.metadata?.provider,
    });
  }

  const resolved = resolveImageProfile(ctx);
  const repaired = runIndustryImageRulesEngine({
    slots,
    ctx,
  });
  return {
    ...base,
    slots: repaired.slots,
    usedUrls: flattenSlotUrls(repaired.slots),
  };
}

/**
 * Convert semantic slots to CoreAssetManifest items for injection.
 */
export function slotsToManifestItems(
  slots: SiteImageSlotMap,
  profileId: string,
): CoreAssetManifest["items"] {
  const items: CoreAssetManifest["items"] = [];
  for (const kind of IMAGE_SLOT_KINDS) {
    for (const slot of slots[kind]) {
      items.push({
        id: slot.id,
        role:
          kind === "products"
            ? "product"
            : kind === "backgrounds"
              ? "background"
              : kind === "testimonials"
                ? "testimonial"
                : kind === "features"
                  ? "service"
                  : kind === "about" || kind === "team" || kind === "cta"
                    ? "section"
                    : kind === "gallery"
                      ? "gallery"
                      : "hero",
        name: `${kind} ${slot.id}`,
        prompt: `${profileId} ${kind} photography`,
        alt: slot.alt,
        url: slot.url,
        storagePath: null,
        status: "generated",
        mimeType: "image/jpeg",
        metadata: {
          purpose: kind === "products" ? "product" : kind === "backgrounds" ? "background" : kind === "testimonials" ? "testimonial" : kind === "features" ? "service" : kind === "gallery" ? "gallery" : kind === "hero" ? "hero" : "section",
          provider: slot.provider || "premium-stock",
          style: profileId,
          prompt: `${profileId} ${kind}`,
          section: kind,
        },
      });
    }
  }
  return items;
}

export function enrichManifestWithProfileSlots(
  manifest: CoreAssetManifest,
  ctx: ImageProfileContext,
  opts?: { projectSeed?: string },
): CoreAssetManifest {
  const hydrated = hydrateSlotsFromManifest(manifest, ctx, opts);
  const profileItems = slotsToManifestItems(hydrated.slots, hydrated.profileId);
  const byId = new Map(manifest.items.map((item) => [item.id, item]));

  for (const item of profileItems) {
    if (!byId.has(item.id)) {
      byId.set(item.id, item);
    }
  }

  return {
    ...manifest,
    items: [...byId.values()],
  };
}

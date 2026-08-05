import {
  DEFAULT_IMAGE_PROFILE,
  INDUSTRY_IMAGE_PROFILES,
} from "@/lib/ai-core/image-engine/profiles/data";
import type {
  ImageProfileContext,
  IndustryImageProfile,
  ResolvedImageProfile,
} from "@/lib/ai-core/image-engine/profiles/types";

const PROFILE_BY_ID = new Map(
  INDUSTRY_IMAGE_PROFILES.map((profile) => [profile.id, profile]),
);

function normalizeToken(value: string): string {
  return value.toLowerCase().replace(/[_\s]+/g, "-").trim();
}

function tokenize(value: string): string[] {
  return normalizeToken(value)
    .split(/[^a-z0-9-]+/)
    .filter((t) => t.length > 1);
}

/**
 * Detect the best industry image profile from business context.
 */
export function resolveImageProfile(
  ctx: ImageProfileContext,
): ResolvedImageProfile {
  const candidates = [
    ctx.routingIndustryId,
    ctx.industry,
    ctx.subcategory,
    ctx.businessType,
  ]
    .filter(Boolean)
    .map((v) => normalizeToken(v!));

  for (const candidate of candidates) {
    const exact = PROFILE_BY_ID.get(candidate);
    if (exact) {
      return { profile: exact, matchedBy: "exact", confidence: 1 };
    }
  }

  for (const candidate of candidates) {
    for (const profile of INDUSTRY_IMAGE_PROFILES) {
      if (profile.aliases.some((alias) => alias === candidate)) {
        return { profile, matchedBy: "alias", confidence: 0.95 };
      }
      if (
        profile.subcategories?.some(
          (sub) => sub === candidate || candidate.includes(sub),
        )
      ) {
        return { profile, matchedBy: "subcategory", confidence: 0.9 };
      }
    }
  }

  const haystack = candidates.join(" ");
  if (haystack) {
    let best: { profile: IndustryImageProfile; score: number } | null = null;
    for (const profile of INDUSTRY_IMAGE_PROFILES) {
      const tokens = [
        profile.id,
        ...profile.aliases,
        ...(profile.subcategories ?? []),
      ];
      const score = tokens.reduce((sum, token) => {
        if (haystack.includes(token)) return sum + token.length;
        return sum;
      }, 0);
      if (score > 0 && (!best || score > best.score)) {
        best = { profile, score };
      }
    }
    if (best) {
      return {
        profile: best.profile,
        matchedBy: "alias",
        confidence: Math.min(0.85, 0.5 + best.score / 40),
      };
    }
  }

  return {
    profile: DEFAULT_IMAGE_PROFILE,
    matchedBy: "fallback",
    confidence: 0.5,
  };
}

export function getImageProfileById(id: string): IndustryImageProfile | null {
  return PROFILE_BY_ID.get(normalizeToken(id)) ?? null;
}

export function listImageProfiles(): IndustryImageProfile[] {
  return [...INDUSTRY_IMAGE_PROFILES];
}

export {
  DEFAULT_IMAGE_PROFILE,
  INDUSTRY_IMAGE_PROFILES,
} from "@/lib/ai-core/image-engine/profiles/data";

export type {
  ImageProfileContext,
  IndustryImageProfile,
  ResolvedImageProfile,
} from "@/lib/ai-core/image-engine/profiles/types";

import type { ImageProfileContext } from "@/lib/ai-core/image-engine/profiles/types";
import { resolveImageProfile } from "@/lib/ai-core/image-engine/profiles";
import {
  IMAGE_SLOT_KINDS,
  SLOT_MIN_COUNTS,
  type ImageSlotAssignment,
  type ImageSlotKind,
  type SiteImageSlotMap,
} from "@/lib/ai-core/image-engine/slots";
import { checkAspectRatioHint } from "@/lib/ai-core/image-engine/slot-validator";
import { detectImageContext } from "@/lib/ai-core/image-engine/rules/detect-context";
import { inferSourceTier, resolveSlotImageSource } from "@/lib/ai-core/image-engine/rules/priority-resolver";
import { getIndustrySlotRules } from "@/lib/ai-core/image-engine/rules/slot-rules";
import { isWrongIndustryUrl, urlAllowedForSlot } from "@/lib/ai-core/image-engine/rules/url-registry";
import type {
  ImageCandidate,
  ImageRejectionRecord,
  ImageSelectionRecord,
  ImageSourceTier,
  IndustryImageRulesReport,
} from "@/lib/ai-core/image-engine/rules/types";

const PLACEHOLDER_RE =
  /placehold\.co|via\.placeholder|picsum\.photos|dummyimage|data:image\/svg/i;

function isLowQuality(url: string): boolean {
  return PLACEHOLDER_RE.test(url) || !url.trim();
}

function haystackForCandidate(candidate: ImageCandidate): string {
  return [candidate.url, candidate.alt ?? "", candidate.provider ?? ""]
    .join(" ")
    .toLowerCase();
}

function hasForbiddenSubject(text: string, forbidden: string[]): string | null {
  for (const subject of forbidden) {
    if (text.includes(subject.toLowerCase())) return subject;
  }
  return null;
}

function pickReplacement(
  kind: ImageSlotKind,
  industryId: string,
  used: Set<string>,
  index: number,
): { url: string; tier: ImageSourceTier } {
  const profile = resolveImageProfile({ industry: industryId }).profile;
  const pool = profile.slots[kind] ?? profile.slots.backgrounds ?? profile.slots.hero;
  for (let i = 0; i < pool.length; i += 1) {
    const candidate = pool[(index + i) % pool.length]!;
    if (!used.has(candidate)) {
      return { url: candidate, tier: "library" };
    }
  }
  const fallback = pool[index % pool.length] ?? profile.slots.hero[0] ?? "";
  return { url: fallback, tier: "library" };
}

export type ValidateImageCandidateInput = {
  candidate: ImageCandidate;
  kind: ImageSlotKind;
  industryId: string;
  subcategory: string | null;
  usedUrls: Set<string>;
  allowReuse?: boolean;
  isUserOverride?: boolean;
};

export type ValidateImageCandidateResult = {
  accepted: boolean;
  rejection?: Omit<ImageRejectionRecord, "slotId" | "kind" | "url">;
};

/**
 * Validate a single image candidate against industry rules.
 * User uploads always pass validation (highest priority).
 */
export function validateImageCandidate(
  input: ValidateImageCandidateInput,
): ValidateImageCandidateResult {
  const { candidate, kind, industryId, subcategory, usedUrls, allowReuse, isUserOverride } =
    input;

  if (isUserOverride || candidate.isUserOverride) {
    return { accepted: true };
  }

  const url = candidate.url;
  if (!url || isLowQuality(url)) {
    return {
      accepted: false,
      rejection: {
        category: "low-quality",
        detail: "Placeholder or empty image rejected.",
      },
    };
  }

  const profile = resolveImageProfile({ industry: industryId }).profile;
  const rules = getIndustrySlotRules(industryId);
  const slotRule = rules.slots[kind];
  const haystack = haystackForCandidate(candidate);

  if (candidate.industryId && candidate.industryId !== industryId && !allowReuse) {
    return {
      accepted: false,
      rejection: {
        category: "wrong-industry",
        detail: `Image tagged for "${candidate.industryId}" but business is "${industryId}".`,
      },
    };
  }

  if (isWrongIndustryUrl(url, industryId)) {
    return {
      accepted: false,
      rejection: {
        category: "wrong-industry",
        detail: `Image belongs to unrelated industry library (not "${industryId}").`,
      },
    };
  }

  if (
    !urlAllowedForSlot(url, kind, industryId, profile.slots) &&
    candidate.sourceTier !== "user"
  ) {
    return {
      accepted: false,
      rejection: {
        category: "wrong-section",
        detail: `Image not allowed for ${kind} slot in ${industryId}.`,
      },
    };
  }

  if (subcategory && rules.subcategories.length > 0) {
    const subMatch = rules.subcategories.some(
      (sub) => subcategory.includes(sub) || sub.includes(subcategory),
    );
    if (!subMatch && candidate.sourceTier === "library") {
      const subForbidden = hasForbiddenSubject(haystack, [subcategory]);
      if (subForbidden) {
        return {
          accepted: false,
          rejection: {
            category: "wrong-subcategory",
            detail: `Image conflicts with subcategory "${subcategory}".`,
          },
        };
      }
    }
  }

  const forbidden = hasForbiddenSubject(haystack, slotRule.forbiddenSubjects);
  if (forbidden) {
    return {
      accepted: false,
      rejection: {
        category: "forbidden-subject",
        detail: `Forbidden subject "${forbidden}" for ${industryId} ${kind}.`,
      },
    };
  }

  if (!allowReuse && usedUrls.has(url)) {
    return {
      accepted: false,
      rejection: {
        category: "duplicate",
        detail: "Duplicate image URL rejected.",
      },
    };
  }

  if (candidate.assignedKind && candidate.assignedKind !== kind) {
    return {
      accepted: false,
      rejection: {
        category: "wrong-section",
        detail: `Image assigned to ${candidate.assignedKind} but used in ${kind}.`,
      },
    };
  }

  if (!checkAspectRatioHint(url, kind) && slotRule.orientation !== "any") {
    return {
      accepted: false,
      rejection: {
        category: "wrong-orientation",
        detail: `Image orientation unsuitable for ${kind} (expected ${slotRule.orientation}).`,
      },
    };
  }

  const wMatch = url.match(/[?&]w=(\d+)/);
  const width = wMatch ? Number(wMatch[1]) : 1600;
  if (width < slotRule.minWidth) {
    return {
      accepted: false,
      rejection: {
        category: "low-quality",
        detail: `Image width ${width}px below minimum ${slotRule.minWidth}px.`,
      },
    };
  }

  return { accepted: true };
}

export type RunIndustryImageRulesInput = {
  slots: SiteImageSlotMap;
  ctx: ImageProfileContext;
  userOverrides?: ImageCandidate[];
};

/**
 * Run the Industry Image Rules Engine: validate all slots, auto-replace rejections,
 * and produce a full validation report.
 */
export function runIndustryImageRulesEngine(
  input: RunIndustryImageRulesInput,
): IndustryImageRulesReport & { slots: SiteImageSlotMap } {
  const detected = detectImageContext(input.ctx);
  const profile = resolveImageProfile(input.ctx).profile;
  const rules = getIndustrySlotRules(detected.industryId);
  const used = new Set<string>();
  const selected: ImageSelectionRecord[] = [];
  const rejected: ImageRejectionRecord[] = [];
  const sourceCounts: Record<ImageSourceTier, number> = {
    user: 0,
    ai: 0,
    library: 0,
    stock: 0,
  };
  let replaced = 0;

  const userBySlotId = new Map(
    (input.userOverrides ?? []).map((u) => [u.url, u]),
  );

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

  for (const kind of IMAGE_SLOT_KINDS) {
    const minCount = SLOT_MIN_COUNTS[kind];
    const source = input.slots[kind];
    const next: ImageSlotAssignment[] = [];

    for (let i = 0; i < Math.max(minCount, source.length); i += 1) {
      const slot = source[i];
      const slotId = slot?.id ?? `${kind}-${i + 1}`;
      const userOverride = slot?.isUserOverride
        ? slot
        : userBySlotId.get(slot?.url ?? "");

      const resolved = resolveSlotImageSource({
        kind,
        index: i,
        userUrl: userOverride?.url ?? (slot?.isUserOverride ? slot.url : null),
        aiUrl: slot?.sourceTier === "ai" || inferSourceTier(slot ?? {}) === "ai" ? slot?.url : null,
        libraryUrl:
          slot?.sourceTier === "library" || slot?.provider === "premium-stock"
            ? slot?.url
            : profile.slots[kind]?.[i],
        stockUrl: slot?.url,
      });

      let url = resolved?.url ?? slot?.url ?? "";
      let tier = resolved?.sourceTier ?? inferSourceTier(slot ?? {});
      let alt = slot?.alt ?? `${profile.label} ${kind} photography`;

      const validation = validateImageCandidate({
        candidate: {
          url,
          alt,
          provider: slot?.provider,
          sourceTier: tier,
          industryId: slot?.industryId,
          isUserOverride: Boolean(userOverride?.isUserOverride ?? slot?.isUserOverride),
          assignedKind: slot?.kind,
        },
        kind,
        industryId: detected.industryId,
        subcategory: detected.subcategory,
        usedUrls: used,
        allowReuse: profile.allowReuse,
        isUserOverride: Boolean(userOverride?.isUserOverride ?? slot?.isUserOverride),
      });

      if (!validation.accepted && validation.rejection) {
        const replacement = pickReplacement(kind, detected.industryId, used, i);
        rejected.push({
          slotId,
          kind,
          url,
          ...validation.rejection,
          replacedWith: replacement.url,
          replacementTier: replacement.tier,
        });
        url = replacement.url;
        tier = replacement.tier;
        alt = `${profile.label} ${kind} photography`;
        replaced += 1;
      }

      if (url) {
        if (!profile.allowReuse) used.add(url);
        sourceCounts[tier] += 1;
        selected.push({
          slotId,
          kind,
          url,
          sourceTier: tier,
          industryId: detected.industryId,
          accepted: true,
        });
        next.push({
          id: slotId,
          kind,
          url,
          alt,
          industryId: detected.industryId,
          provider: slot?.provider ?? tier,
          sourceTier: tier,
          isUserOverride: Boolean(userOverride?.isUserOverride ?? slot?.isUserOverride),
        });
      }
    }

    while (next.length < minCount) {
      const replacement = pickReplacement(kind, detected.industryId, used, next.length);
      if (!replacement.url) break;
      if (!profile.allowReuse) used.add(replacement.url);
      sourceCounts[replacement.tier] += 1;
      replaced += 1;
      const slotId = `${kind}-${next.length + 1}`;
      selected.push({
        slotId,
        kind,
        url: replacement.url,
        sourceTier: replacement.tier,
        industryId: detected.industryId,
        accepted: true,
      });
      next.push({
        id: slotId,
        kind,
        url: replacement.url,
        alt: `${profile.label} ${kind} photography`,
        industryId: detected.industryId,
        provider: replacement.tier,
        sourceTier: replacement.tier,
      });
      rejected.push({
        slotId,
        kind,
        url: "",
        category: "low-quality",
        detail: `Filled missing ${kind} slot from industry library.`,
        replacedWith: replacement.url,
        replacementTier: replacement.tier,
      });
    }

    repaired[kind] = next;
  }

  const slotCoverage: IndustryImageRulesReport["slotCoverage"] = {};
  let coverageScore = 0;
  for (const kind of IMAGE_SLOT_KINDS) {
    const required = SLOT_MIN_COUNTS[kind];
    const actual = repaired[kind].length;
    const passed = actual >= required;
    slotCoverage[kind] = { required, actual, passed };
    if (passed) coverageScore += 10;
  }

  const rejectionPenalty = Math.min(40, rejected.length * 2);
  const score = Math.max(0, Math.min(100, coverageScore + 20 - rejectionPenalty));
  const passed =
    repaired.hero.length > 0 &&
    rejected.filter((r) => r.category === "wrong-industry").length === 0 &&
    Object.values(slotCoverage).every((c) => c?.passed);

  return {
    passed,
    score,
    detected,
    profileId: profile.id,
    selected,
    rejected,
    replaced,
    sourceCounts,
    slotCoverage,
    summary: passed
      ? `Industry image rules passed for ${profile.label} (${detected.industryId}). ${selected.length} images selected, ${replaced} replaced.`
      : `Industry image rules failed for ${profile.label}: ${rejected.length} rejections.`,
    slots: repaired,
  };
}

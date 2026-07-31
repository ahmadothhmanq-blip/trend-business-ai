import type { BusinessIntelligenceProfile } from "@/lib/ai-core/business-intelligence/types";

export type BusinessQualityCheck = {
  id: string;
  label: string;
  passed: boolean;
  detail?: string;
};

export type BusinessQualityReport = {
  passed: boolean;
  score: number;
  checks: BusinessQualityCheck[];
  issues: string[];
  summary: string;
};

function haystack(values: string[]): string {
  return values.join(" ").toLowerCase();
}

function containsForbidden(text: string, forbidden: string[]): string[] {
  const lower = text.toLowerCase();
  return forbidden.filter((subject) => {
    const s = subject.trim().toLowerCase();
    if (!s) return false;
    return lower.includes(s);
  });
}

/**
 * Validate image prompts and alt text against the business profile.
 * Rejects prompts that reference forbidden subjects or lack industry context.
 */
export function validateImagePromptsAgainstProfile(params: {
  profile: BusinessIntelligenceProfile;
  prompts: Array<{ id: string; prompt: string; alt?: string; purpose?: string }>;
}): BusinessQualityReport {
  const checks: BusinessQualityCheck[] = [];
  const issues: string[] = [];
  const { profile } = params;

  const industryTokens = [
    profile.industry,
    profile.subcategory,
    ...profile.photographyStyle.slice(0, 4),
  ]
    .join(" ")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 3);

  for (const item of params.prompts) {
    const combined = `${item.prompt} ${item.alt ?? ""}`;
    const forbiddenHits = containsForbidden(
      combined,
      profile.forbiddenSubjects,
    );
    if (forbiddenHits.length) {
      checks.push({
        id: `forbidden-${item.id}`,
        label: `Image ${item.id} avoids forbidden subjects`,
        passed: false,
        detail: `Contains: ${forbiddenHits.join(", ")}`,
      });
      issues.push(
        `Image ${item.id} references forbidden subjects: ${forbiddenHits.join(", ")}`,
      );
    } else {
      checks.push({
        id: `forbidden-${item.id}`,
        label: `Image ${item.id} avoids forbidden subjects`,
        passed: true,
      });
    }

    const hasIndustryContext = industryTokens.some((t) =>
      combined.toLowerCase().includes(t),
    );
    const hasPhotoStyle = profile.photographyStyle.some((s) =>
      combined.toLowerCase().includes(s.toLowerCase().slice(0, 12)),
    );

    checks.push({
      id: `industry-${item.id}`,
      label: `Image ${item.id} reflects business domain`,
      passed: hasIndustryContext || hasPhotoStyle,
      detail:
        hasIndustryContext || hasPhotoStyle
          ? undefined
          : `Missing ${profile.industry} visual context`,
    });
    if (!hasIndustryContext && !hasPhotoStyle) {
      issues.push(
        `Image ${item.id} lacks ${profile.industry} visual context`,
      );
    }
  }

  const passedCount = checks.filter((c) => c.passed).length;
  const score =
    checks.length === 0
      ? 100
      : Math.round((passedCount / checks.length) * 100);

  return {
    passed: issues.length === 0,
    score,
    checks,
    issues,
    summary:
      issues.length === 0
        ? `All ${params.prompts.length} image prompts match ${profile.industry}.`
        : `${issues.length} image validation issue(s) for ${profile.industry}.`,
  };
}

/**
 * Validate hero, sections, CTAs, and copy signals against the business profile.
 */
export function validateWebsiteContentAgainstProfile(params: {
  profile: BusinessIntelligenceProfile;
  heroText?: string;
  sectionLabels?: string[];
  ctaLabels?: string[];
  navigationLabels?: string[];
}): BusinessQualityReport {
  const checks: BusinessQualityCheck[] = [];
  const issues: string[] = [];
  const { profile } = params;
  const hero = params.heroText ?? "";

  const forbiddenInHero = containsForbidden(hero, profile.forbiddenSubjects);
  checks.push({
    id: "hero-forbidden",
    label: "Hero avoids forbidden subjects",
    passed: forbiddenInHero.length === 0,
    detail: forbiddenInHero.length
      ? forbiddenInHero.join(", ")
      : undefined,
  });
  if (forbiddenInHero.length) {
    issues.push(`Hero contains forbidden subjects: ${forbiddenInHero.join(", ")}`);
  }

  const heroMatches =
    profile.heroMessaging.some((m) =>
      hero.toLowerCase().includes(m.toLowerCase().slice(0, 20)),
    ) ||
    hero.toLowerCase().includes(profile.industry.toLowerCase()) ||
    hero.toLowerCase().includes(profile.subcategory.toLowerCase());

  checks.push({
    id: "hero-industry",
    label: "Hero reflects business industry",
    passed: heroMatches || hero.length < 10,
    detail: heroMatches ? undefined : `Expected ${profile.industry} messaging`,
  });
  if (!heroMatches && hero.length >= 10) {
    issues.push(`Hero does not reflect ${profile.industry}`);
  }

  const sections = params.sectionLabels ?? [];
  const recommended = profile.recommendedSections.map((s) => s.toLowerCase());
  const sectionOverlap = sections.filter((s) =>
    recommended.some(
      (r) => s.toLowerCase().includes(r) || r.includes(s.toLowerCase()),
    ),
  );
  checks.push({
    id: "sections-industry",
    label: "Sections match industry blueprint",
    passed: sectionOverlap.length >= 2 || sections.length < 3,
    detail: `${sectionOverlap.length} industry-relevant sections`,
  });
  if (sectionOverlap.length < 2 && sections.length >= 3) {
    issues.push(
      `Sections lack industry-specific structure for ${profile.industry}`,
    );
  }

  const ctas = params.ctaLabels ?? [];
  const ctaHay = haystack(ctas);
  const primaryMatch = ctaHay.includes(
    profile.primaryCta.toLowerCase().slice(0, 8),
  );
  checks.push({
    id: "cta-industry",
    label: "CTA matches industry",
    passed: primaryMatch || ctas.length === 0,
    detail: primaryMatch ? undefined : `Expected "${profile.primaryCta}"`,
  });
  if (!primaryMatch && ctas.length > 0) {
    issues.push(`CTA does not match industry (expected "${profile.primaryCta}")`);
  }

  const passedCount = checks.filter((c) => c.passed).length;
  const score = Math.round((passedCount / Math.max(1, checks.length)) * 100);

  return {
    passed: issues.length === 0,
    score,
    checks,
    issues,
    summary:
      issues.length === 0
        ? `Content validation passed for ${profile.industry}.`
        : `${issues.length} content validation issue(s).`,
  };
}

/** Merge image + content validation into a single gate before publish. */
export function validateGenerationAgainstBusinessProfile(params: {
  profile: BusinessIntelligenceProfile;
  imagePrompts?: Array<{
    id: string;
    prompt: string;
    alt?: string;
    purpose?: string;
  }>;
  heroText?: string;
  sectionLabels?: string[];
  ctaLabels?: string[];
}): BusinessQualityReport {
  const imageReport = params.imagePrompts?.length
    ? validateImagePromptsAgainstProfile({
        profile: params.profile,
        prompts: params.imagePrompts,
      })
    : null;
  const contentReport = validateWebsiteContentAgainstProfile({
    profile: params.profile,
    heroText: params.heroText,
    sectionLabels: params.sectionLabels,
    ctaLabels: params.ctaLabels,
  });

  const checks = [
    ...(imageReport?.checks ?? []),
    ...contentReport.checks,
  ];
  const issues = [
    ...(imageReport?.issues ?? []),
    ...contentReport.issues,
  ];
  const scores = [imageReport?.score, contentReport.score].filter(
    (s): s is number => typeof s === "number",
  );
  const score =
    scores.length === 0
      ? contentReport.score
      : Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

  return {
    passed: issues.length === 0,
    score,
    checks,
    issues,
    summary:
      issues.length === 0
        ? `Quality validation passed · ${params.profile.industry} · score ${score}`
        : `Quality validation failed · ${issues.length} issue(s) · score ${score}`,
  };
}

/**
 * Strengthen an image prompt when validation fails — inject photography style
 * and explicit forbidden-subject guardrails.
 */
export function repairImagePromptForProfile(
  prompt: string,
  profile: BusinessIntelligenceProfile,
  sectionBrief?: string,
): string {
  const photoSubjects = profile.photographyStyle.slice(0, 3).join(", ");
  const forbidden = profile.forbiddenSubjects.slice(0, 6).join(", ");
  const brief = sectionBrief || profile.photographyStyle[0] || profile.industry;

  return [
    prompt,
    `Industry: ${profile.industry} (${profile.subcategory}).`,
    `Required visual subjects: ${photoSubjects}.`,
    `Shot: ${brief}.`,
    forbidden ? `NEVER show: ${forbidden}.` : "",
    `Audience: ${profile.audience.join(", ")}.`,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();
}

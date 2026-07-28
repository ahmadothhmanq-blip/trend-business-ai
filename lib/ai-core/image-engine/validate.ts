/**
 * Asset Quality Check — detect missing images, bad matching, low visual quality,
 * and evaluate planned prompt quality before generation.
 */

import { isPremiumStockUrl } from "@/lib/ai-core/image-engine/stock";
import type { CoreAssetManifest } from "@/lib/ai-core/layers/types";
import {
  PROMPT_QUALITY_THRESHOLD,
  scoreImagePrompt,
} from "@/lib/ai-core/image-engine/prompt-scoring";
import type { ImagePurpose } from "@/lib/ai-core/image-engine/types";

export type AssetQualityIssue = {
  id: string;
  severity: "critical" | "major" | "minor";
  category: "missing" | "placeholder" | "mismatch" | "quality" | "coverage";
  title: string;
  detail: string;
  role?: string;
};

export type AssetQualityReport = {
  passed: boolean;
  score: number;
  issues: AssetQualityIssue[];
  requiredRolesCovered: string[];
  missingRoles: string[];
  photoCount: number;
  aiGeneratedCount: number;
  stockFallbackCount: number;
  /** Average planned prompt quality score (pre-generation). */
  promptQualityScore?: number;
  summary: string;
};

const REQUIRED_ROLES = [
  "hero",
  "product",
  "service",
  "background",
  "gallery",
  "section",
  "testimonial",
] as const;

function isSvgUrl(url: string | null | undefined): boolean {
  if (!url) return true;
  return (
    url.startsWith("data:image/svg") ||
    url.includes("image/svg+xml") ||
    /placehold\.co|via\.placeholder|picsum\.photos|dummyimage/i.test(url)
  );
}

function isLowQualityHint(item: CoreAssetManifest["items"][number]): boolean {
  const prompt = `${item.prompt} ${item.metadata?.prompt || ""}`.toLowerCase();
  if (/placeholder|lorem|generic stock smile|clipart|cartoon/.test(prompt)) {
    return true;
  }
  if (item.status === "failed" || item.status === "pending") return true;
  return false;
}

/**
 * Validate photographic coverage for agency-grade websites.
 */
export function validateAssetManifest(
  manifest: CoreAssetManifest,
  opts?: {
    industry?: string | null;
    brandStyle?: string | null;
    plannedPrompts?: Array<{
      id: string;
      prompt: string;
      purpose: ImagePurpose;
      section?: string;
    }>;
  },
): AssetQualityReport {
  const issues: AssetQualityIssue[] = [];
  const photos = manifest.items.filter((i) => i.role !== "icon");
  const withUrl = photos.filter((i) => i.url && !isSvgUrl(i.url));
  const rolesWithUrl = new Set(withUrl.map((i) => i.role));

  const missingRoles = REQUIRED_ROLES.filter((r) => !rolesWithUrl.has(r));
  for (const role of missingRoles) {
    issues.push({
      id: `missing-${role}`,
      severity: role === "hero" ? "critical" : "major",
      category: "missing",
      title: `Missing ${role} visual`,
      detail: `No photographic URL for required role “${role}”.`,
      role,
    });
  }

  for (const item of photos) {
    if (!item.url || isSvgUrl(item.url)) {
      issues.push({
        id: `placeholder-${item.id}`,
        severity: item.role === "hero" ? "critical" : "major",
        category: "placeholder",
        title: `Placeholder or empty visual: ${item.name}`,
        detail: "SVG / empty / generic placeholder is not allowed for photo roles.",
        role: item.role,
      });
    }
    if (isLowQualityHint(item)) {
      issues.push({
        id: `quality-${item.id}`,
        severity: "minor",
        category: "quality",
        title: `Low visual quality signal: ${item.name}`,
        detail: "Prompt or status suggests non-premium imagery.",
        role: item.role,
      });
    }
  }

  // Bad matching: hero prompt should mention industry/offer loosely — soft check
  const hero = withUrl.find((i) => i.role === "hero");
  const industry = (opts?.industry || "").toLowerCase();
  if (hero && industry && hero.prompt) {
    const prompt = hero.prompt.toLowerCase();
    const tokens = industry.split(/[^a-z0-9]+/).filter((t) => t.length > 3);
    if (tokens.length && !tokens.some((t) => prompt.includes(t))) {
      issues.push({
        id: "mismatch-hero-industry",
        severity: "minor",
        category: "mismatch",
        title: "Hero may not match industry context",
        detail: `Hero prompt does not clearly reference industry “${opts?.industry}”.`,
        role: "hero",
      });
    }
  }

  if (withUrl.length < 6) {
    issues.push({
      id: "coverage-sparse",
      severity: "major",
      category: "coverage",
      title: "Sparse visual coverage",
      detail: `Only ${withUrl.length} photographic assets — agency sites need richer coverage.`,
    });
  }

  let promptQualityScore: number | undefined;
  if (opts?.plannedPrompts?.length) {
    const ctx = {
      businessType: opts.industry || "business",
      industry: opts.industry || "business",
      brandStyle: opts.brandStyle || "premium",
      designStyle: opts.brandStyle || "modern",
      designPreset: "modern",
      targetAudience: "customers",
      offer: "services",
      projectName: "Website",
      imageStyle: "modern" as const,
      imageRequirements: [] as string[],
      colors: { primary: "#000", secondary: "#fff" },
    };
    const scores = opts.plannedPrompts.map((p) =>
      scoreImagePrompt({
        prompt: p.prompt,
        purpose: p.purpose,
        ctx,
        sectionName: p.section,
      }),
    );
    promptQualityScore = Math.round(
      scores.reduce((sum, s) => sum + s.score, 0) / scores.length,
    );
    const weak = scores.filter((s) => !s.passed);
    if (weak.length > 0) {
      issues.push({
        id: "prompt-quality-low",
        severity: "minor",
        category: "quality",
        title: `${weak.length} planned prompt(s) below quality threshold`,
        detail: `Average prompt score ${promptQualityScore}/100 (threshold ${PROMPT_QUALITY_THRESHOLD}).`,
      });
    }
  }

  const aiGeneratedCount = withUrl.filter(
    (i) =>
      i.status === "generated" &&
      i.metadata?.provider &&
      i.metadata.provider !== "premium-stock" &&
      !isPremiumStockUrl(i.url),
  ).length;
  const stockFallbackCount = withUrl.filter(
    (i) =>
      i.metadata?.provider === "premium-stock" || isPremiumStockUrl(i.url),
  ).length;

  const critical = issues.filter((i) => i.severity === "critical").length;
  const major = issues.filter((i) => i.severity === "major").length;
  const score = Math.max(
    0,
    Math.min(100, 100 - critical * 25 - major * 12 - (issues.length - critical - major) * 4),
  );
  const passed = critical === 0 && missingRoles.filter((r) => r === "hero").length === 0;

  return {
    passed,
    score,
    issues,
    requiredRolesCovered: REQUIRED_ROLES.filter((r) => rolesWithUrl.has(r)) as string[],
    missingRoles: missingRoles as string[],
    photoCount: withUrl.length,
    aiGeneratedCount,
    stockFallbackCount,
    promptQualityScore,
    summary: passed
      ? `Asset quality ${score}/100 — ${withUrl.length} photos (${aiGeneratedCount} AI, ${stockFallbackCount} stock)${promptQualityScore != null ? ` · prompts ${promptQualityScore}/100` : ""}`
      : `Asset quality ${score}/100 — ${issues.length} issue(s); missing: ${missingRoles.join(", ") || "none"}`,
  };
}

/** Assert publishable photographic coverage (throws on critical hero failure). */
export function assertPublishableAssets(manifest: CoreAssetManifest): AssetQualityReport {
  const report = validateAssetManifest(manifest);
  const heroOk = manifest.items.some(
    (i) =>
      i.role === "hero" &&
      Boolean(i.url) &&
      !isSvgUrl(i.url),
  );
  if (!heroOk) {
    throw new Error(
      "AI Assets Engine: publishable hero image missing after generation and stock fill.",
    );
  }
  return report;
}

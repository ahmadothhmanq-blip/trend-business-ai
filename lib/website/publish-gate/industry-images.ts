import type { GeneratedWebsiteProject } from "@/lib/website/types/generation";
import {
  isForbiddenStockUrlForIndustry,
  validateStockUrlForIndustry,
} from "@/lib/ai-core/image-engine/stock";
import {
  getIndustryVisualPolicy,
  isSubjectPackPhotoUrl,
} from "@/lib/ai-core/image-engine/industry-slot-policy";
import type { PublishGateCheck } from "@/lib/website/publish-gate/types";

const SITE_IMAGES_PATH = "lib/site-images.ts";

function findSiteImagesContent(project: GeneratedWebsiteProject): string {
  const file = project.files.find(
    (f) =>
      f.path.replaceAll("\\", "/") === SITE_IMAGES_PATH ||
      f.path.replaceAll("\\", "/") === "lib/site-images.js",
  );
  return file?.content ?? "";
}

function extractConstUrl(source: string, name: string): string | null {
  const re = new RegExp(
    `export const ${name}(?::[^=]+)?\\s*=\\s*(?:"((?:\\\\.|[^"\\\\])*)"|'((?:\\\\.|[^'\\\\])*)')`,
  );
  const match = source.match(re);
  if (!match) return null;
  return (match[1] ?? match[2] ?? "").trim() || null;
}

function extractArrayUrls(source: string, name: string): string[] {
  const re = new RegExp(`export const ${name}\\s*=\\s*(\\[[\\s\\S]*?\\]) as const`);
  const match = source.match(re);
  if (!match) return [];
  try {
    const parsed = JSON.parse(match[1]!) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === "string" && Boolean(value))
      : [];
  } catch {
    return [];
  }
}

export function extractProjectImageUrls(project: GeneratedWebsiteProject): {
  hero: string | null;
  all: string[];
} {
  const source = findSiteImagesContent(project);
  if (!source) return { hero: null, all: [] };

  const hero = extractConstUrl(source, "HERO_IMAGE");
  const urls = new Set<string>();
  for (const value of [
    hero,
    extractConstUrl(source, "PRODUCT_IMAGE"),
    extractConstUrl(source, "SERVICE_IMAGE"),
    extractConstUrl(source, "BACKGROUND_IMAGE"),
    extractConstUrl(source, "BRAND_IMAGE"),
    extractConstUrl(source, "ABOUT_IMAGE"),
    ...extractArrayUrls(source, "SECTION_IMAGES"),
    ...extractArrayUrls(source, "GALLERY_IMAGES"),
    ...extractArrayUrls(source, "TEAM_IMAGES"),
    ...extractArrayUrls(source, "TESTIMONIAL_IMAGES"),
  ]) {
    if (value) urls.add(value);
  }

  return { hero, all: [...urls] };
}

export function evaluateIndustryImageGate(
  project: GeneratedWebsiteProject,
): PublishGateCheck[] {
  const routingId =
    project.settings?.businessIndustry ??
    project.businessProfile?.routingIndustryId ??
    "business";
  const { hero, all } = extractProjectImageUrls(project);
  const checks: PublishGateCheck[] = [];

  if (!all.length) {
    checks.push({
      id: "industry-images",
      passed: false,
      severity: "warning",
      message: "No site images found in lib/site-images.ts",
    });
    return checks;
  }

  const forbiddenUrls = all.filter((url) =>
    isForbiddenStockUrlForIndustry(url, routingId),
  );
  if (forbiddenUrls.length) {
    const heroBlocked = hero != null && forbiddenUrls.includes(hero);
    checks.push({
      id: "industry-images",
      passed: false,
      severity: heroBlocked ? "blocker" : "warning",
      message: heroBlocked
        ? `Hero image does not match industry "${routingId}"`
        : `${forbiddenUrls.length} image(s) appear to be from another industry`,
      details: forbiddenUrls.slice(0, 3).join(", "),
    });
  }

  if (hero) {
    const heroValidation = validateStockUrlForIndustry({
      url: hero,
      routingIndustryId: routingId,
      role: "hero",
      strictPackMatch: true,
    });
    if (!heroValidation.ok && !forbiddenUrls.includes(hero)) {
      checks.push({
        id: "industry-images",
        passed: false,
        severity: "warning",
        message: `Hero image is not from the curated ${routingId} stock pack`,
        details: heroValidation.reason,
      });
    }
  }

  const policy = getIndustryVisualPolicy(routingId);
  if (policy) {
    const subjectCount = all.filter((url) =>
      isSubjectPackPhotoUrl(url, policy.subjectPackId),
    ).length;
    const maxAllowed = policy.maxGallerySubjectUrls + 1;
    if (subjectCount > maxAllowed) {
      checks.push({
        id: "industry-images",
        passed: false,
        severity: "warning",
        message: `Too many repeating ${policy.subjectPackId} subject photos (${subjectCount}/${maxAllowed})`,
      });
    }
  }

  if (!checks.length) {
    checks.push({
      id: "industry-images",
      passed: true,
      severity: "info",
      message: `Industry image alignment OK for ${routingId}`,
    });
  }

  return checks;
}

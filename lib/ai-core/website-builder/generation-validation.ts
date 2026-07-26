/**
 * Pre-delivery validation for Website Builder generations.
 * Checks industry, images, language, RTL, pages, and hero alignment.
 */

import type { GeneratedProjectFile } from "@/lib/ai/types";
import type { AssetManifest } from "@/plugins/website/types";
import {
  detectIndustryFromPrompt,
  isArabicPrompt,
  type PromptIndustryMatch,
} from "@/lib/ai-core/website-builder/prompt-industry";
import { resolveLocaleFromLanguage } from "@/lib/ai-core/website-design-platform/i18n";

export type GenerationValidationIssue = {
  id: string;
  severity: "error" | "warning";
  message: string;
  repairTarget?: "content" | "images" | "locale" | "pages";
};

export type GenerationValidationResult = {
  passed: boolean;
  issues: GenerationValidationIssue[];
  expectedIndustry: PromptIndustryMatch | null;
};

const INDUSTRY_IMAGE_HINTS: Record<string, RegExp[]> = {
  furniture: [/furniture|sofa|living|bedroom|interior|showroom|أثاث|كنب/i],
  restaurant: [/food|dining|restaurant|chef|kitchen|plate|مطعم|طعام/i],
  technology: [
    /computer|laptop|server|office|tech|data|software|حاسوب|تكنولوجيا/i,
  ],
  saas: [/computer|laptop|office|tech|software|dashboard|data/i],
  "real-estate": [/home|house|property|interior|architecture|عقار/i],
  clinic: [/medical|health|clinic|doctor|patient|عيادة|صحة/i],
  automotive: [/car|vehicle|automotive|showroom|سيار/i],
  tourism: [/travel|destination|landscape|hotel|tour|سفر/i],
};

function fileBlob(files: GeneratedProjectFile[]): string {
  return files.map((f) => f.content).join("\n");
}

function hasRtlInFiles(files: GeneratedProjectFile[]): boolean {
  return files.some(
    (f) =>
      /dir=["']rtl["']/i.test(f.content) ||
      /direction:\s*rtl/i.test(f.content) ||
      /html\[dir="rtl"\]/i.test(f.content),
  );
}

function heroImageUrl(
  files: GeneratedProjectFile[],
  manifest?: AssetManifest | null,
): string {
  const heroFromManifest = manifest?.items?.find(
    (i) => i.role === "hero" || i.id === "hero",
  )?.url;
  if (heroFromManifest) return heroFromManifest;
  const siteImages = files.find((f) => f.path.includes("site-images"));
  if (siteImages) {
    const m = siteImages.content.match(
      /HERO_IMAGE\s*=\s*["']([^"']+)["']/,
    );
    if (m?.[1]) return m[1];
  }
  const home = files.find((f) => f.path.includes("app/page"));
  const img = home?.content.match(/src=["']([^"']+)["']/);
  return img?.[1] || "";
}

function industryMentionedInContent(
  industryId: string,
  label: string,
  blob: string,
): boolean {
  const id = industryId.toLowerCase();
  const words = [
    label.toLowerCase(),
    id,
    id.replace(/-/g, " "),
  ].filter(Boolean);
  return words.some((w) => w.length > 2 && blob.toLowerCase().includes(w));
}

/**
 * Validate a generated website against prompt expectations.
 */
export function validateWebsiteGeneration(params: {
  prompt: string;
  language: string;
  industry?: string | null;
  industryId?: string | null;
  files: GeneratedProjectFile[];
  assetManifest?: AssetManifest | null;
  expectedPages?: string[];
}): GenerationValidationResult {
  const issues: GenerationValidationIssue[] = [];
  const expected = detectIndustryFromPrompt(params.prompt);
  const blob = fileBlob(params.files);
  const locale = resolveLocaleFromLanguage(params.language);
  const arabicPrompt = isArabicPrompt(params.prompt);

  if (expected) {
    const mentioned = industryMentionedInContent(
      expected.industryId,
      expected.label,
      blob,
    );
    const wrongVertical =
      expected.industryId === "furniture" &&
      /\b(travel|tourism|destination|hotel)\b/i.test(blob) &&
      !/\bfurniture\b/i.test(blob);
    if (wrongVertical) {
      issues.push({
        id: "industry-mismatch",
        severity: "error",
        message: `Content reads like travel/tourism but prompt is ${expected.label}.`,
        repairTarget: "content",
      });
    } else if (!mentioned && expected.confidence >= 0.85) {
      issues.push({
        id: "industry-weak",
        severity: "warning",
        message: `Generated copy does not clearly reflect ${expected.label}.`,
        repairTarget: "content",
      });
    }
  }

  if (arabicPrompt || locale.rtl) {
    const arabicChars = (blob.match(/[\u0600-\u06FF]/g) || []).length;
    if (arabicChars < 40) {
      issues.push({
        id: "language-arabic",
        severity: "error",
        message: "Arabic prompt but generated copy is mostly English.",
        repairTarget: "content",
      });
    }
    if (!hasRtlInFiles(params.files)) {
      issues.push({
        id: "rtl-missing",
        severity: "error",
        message: "Arabic site missing RTL (dir=rtl) in layout or CSS.",
        repairTarget: "locale",
      });
    }
  }

  const industryKey =
    expected?.industryId ||
    (params.industryId || params.industry || "business").toLowerCase();
  const hero = heroImageUrl(params.files, params.assetManifest ?? undefined);
  if (hero && expected) {
    const hints = INDUSTRY_IMAGE_HINTS[expected.industryId] || [];
    const urlLooksWrong =
      expected.industryId === "furniture" &&
      /travel|tour|beach|mountain|airplane/i.test(hero);
    if (urlLooksWrong) {
      issues.push({
        id: "hero-image-mismatch",
        severity: "error",
        message:
          "Hero image appears unrelated to the business (travel vs furniture).",
        repairTarget: "images",
      });
    } else if (
      hints.length &&
      !hints.some((h) => h.test(hero)) &&
      /unsplash\.com/i.test(hero)
    ) {
      issues.push({
        id: "hero-image-weak",
        severity: "warning",
        message: `Hero image may not match ${expected.label} industry.`,
        repairTarget: "images",
      });
    }
  }

  const pages = params.expectedPages?.filter(Boolean) || [];
  if (pages.length) {
    const missing = pages.filter(
      (p) => !blob.toLowerCase().includes(p.toLowerCase().slice(0, 6)),
    );
    if (missing.length > pages.length / 2) {
      issues.push({
        id: "pages-missing",
        severity: "warning",
        message: `Expected pages may be missing: ${missing.slice(0, 4).join(", ")}`,
        repairTarget: "pages",
      });
    }
  }

  const errors = issues.filter((i) => i.severity === "error");
  return {
    passed: errors.length === 0,
    issues,
    expectedIndustry: expected,
  };
}

export function buildGenerationRepairInstruction(
  result: GenerationValidationResult,
): string {
  const lines = result.issues
    .filter((i) => i.severity === "error")
    .map((i) => `- ${i.message}`);
  if (!lines.length) return "";
  const industry = result.expectedIndustry?.label || "the business";
  return [
    `[validation-repair] Fix the following before delivery:`,
    ...lines,
    `Ensure all user-facing copy, navigation, buttons, and headings match ${industry}.`,
    result.issues.some((i) => i.id === "language-arabic")
      ? "Write ALL visible text in Arabic. Do not mix English unless it is a proper brand name."
      : "",
    result.issues.some((i) => i.id === "rtl-missing")
      ? "Set html lang=ar dir=rtl and mirror navigation for RTL."
      : "",
    result.issues.some((i) => i.repairTarget === "images")
      ? "Use industry-appropriate hero and section images only."
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

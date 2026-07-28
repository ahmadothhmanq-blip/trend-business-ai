import { resolveContentLanguage } from "@/lib/ai-core/content/content-language";
import type { GeneratedProjectFile } from "@/lib/ai/types";

export type WebsiteLlmStage =
  | "business-idea"
  | "strategy"
  | "design-system"
  | "blueprint"
  | "dynamic-plan"
  | "asset-plan"
  | "file-generation"
  | "quality-improve"
  | "optimizer-rewrite";

const SKIP_LANGUAGE_VALIDATION: ReadonlySet<WebsiteLlmStage> = new Set([
  "design-system",
  "dynamic-plan",
  "asset-plan",
]);

/** Common English UI labels that must not appear in Arabic-only output. */
const ENGLISH_UI_LEAK =
  /\b(home|about us|our services|services|contact us|contact|features|pricing|testimonials|get started|learn more|read more|submit|book now|faq|privacy policy|terms of service)\b/i;

const COPY_ATTR =
  /(?:title|label|placeholder|alt|description|eyebrow|headline|subheadline|cta|heading|message|aria-label|name|text|children)\s*[=:]\s*["'`]([^"'`]+)["'`]/gi;

function collectStrings(value: unknown, depth = 0): string {
  if (depth > 10) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    return value.map((item) => collectStrings(item, depth + 1)).join("\n");
  }
  if (value && typeof value === "object") {
    return Object.values(value as Record<string, unknown>)
      .map((item) => collectStrings(item, depth + 1))
      .join("\n");
  }
  return "";
}

export function countArabicCharacters(text: string): number {
  return (text.match(/[\u0600-\u06FF]/g) || []).length;
}

/** Normalize copy for consistent Arabic validation (Unicode, whitespace, bidi marks). */
export function normalizeWebsiteCopyText(text: string): string {
  return text
    .normalize("NFC")
    .replace(/[\u200E\u200F\u061C\u202A-\u202E]/g, "")
    .replace(/\u00A0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Extract user-facing copy from generated TSX/TS source for language validation.
 * Ignores imports, class names, paths, and code identifiers.
 */
export function extractUserFacingCopyFromSource(content: string): string {
  const parts: string[] = [];

  // JSX text nodes: >visible text<
  for (const match of content.matchAll(/>([^<>{}]+)</g)) {
    const text = normalizeWebsiteCopyText(match[1] ?? "");
    if (text.length < 2) continue;
    if (/^[\w\s./:@#-]+$/.test(text) && !/[\u0600-\u06FF]/.test(text)) {
      // Likely code fragment or class — skip unless mixed script
      if (!/\s/.test(text)) continue;
    }
    if (/^(import|export|return|const|function|className|href|src)$/i.test(text)) {
      continue;
    }
    parts.push(text);
  }

  // Named props that carry visible copy
  let attrMatch: RegExpExecArray | null;
  const attrRe = new RegExp(COPY_ATTR.source, COPY_ATTR.flags);
  while ((attrMatch = attrRe.exec(content)) !== null) {
    const value = normalizeWebsiteCopyText(attrMatch[1] ?? "");
    if (value.length >= 2) parts.push(value);
  }

  // String literals in metadata exports and arrays
  for (const match of content.matchAll(/["'`]([^"'`\n]{2,160})["'`]/g)) {
    const value = normalizeWebsiteCopyText(match[1] ?? "");
    if (!value) continue;
    if (
      /^(https?:|\/|@|\.\/|#([0-9a-f]{3,8})|bg-|text-|flex|grid|px-|py-|rounded|var\(--)/i.test(
        value,
      )
    ) {
      continue;
    }
    if (/^[a-z][a-z0-9_-]*$/i.test(value) && value.length < 12) continue;
    if (/[A-Za-z\u0600-\u06FF]{2,}/.test(value)) {
      parts.push(value);
    }
  }

  return normalizeWebsiteCopyText(parts.join("\n"));
}

/** Broad check — used outside strict copy validation. */
export function isUserFacingWebsiteFile(path?: string | null): boolean {
  if (!path) return true;
  if (
    /package\.json|tsconfig|eslint|tailwind\.config|postcss|next\.config|\.d\.ts$/i.test(
      path,
    )
  ) {
    return false;
  }
  if (/lib\/(db|utils|auth|api|site-images)|types\/|hooks\/use/i.test(path)) {
    return false;
  }
  return (
    /(page\.tsx|layout\.tsx|components\/(sections|layout|ui)\/|Hero|Header|Footer|Nav|Contact|Cta|Services|Features)/i.test(
      path,
    ) || path.endsWith(".tsx")
  );
}

/**
 * Files that must contain localized user-facing copy.
 * UI primitives (button, card, motion) are excluded — they have no marketing strings.
 */
export function isCopyBearingWebsiteFile(path?: string | null): boolean {
  if (!path) return true;
  if (
    /package\.json|tsconfig|eslint|tailwind|postcss|next\.config|\.d\.ts$/i.test(
      path,
    )
  ) {
    return false;
  }
  if (/^(lib|types|hooks|api|middleware)\//i.test(path)) return false;
  if (/lib\/(db|utils|auth|api|site-images)/i.test(path)) return false;
  if (
    /components\/ui\/(button|card|input|motion|section-shell)\.tsx$/i.test(path)
  ) {
    return false;
  }
  if (/page\.tsx$/i.test(path)) return true;
  if (/layout\.tsx$/i.test(path)) return true;
  if (/components\/(sections|layout)\//i.test(path)) return true;
  if (
    /(Hero|Header|Footer|Nav|Contact|Cta|Services|Features|Pricing|Testimonial|Faq|Team|Blog)/i.test(
      path,
    )
  ) {
    return true;
  }
  return false;
}

export function validateWebsiteLlmOutputLanguage(params: {
  stage: WebsiteLlmStage;
  websiteLanguage?: string | null;
  result: unknown;
  filePath?: string;
}): { valid: boolean; reason?: string } {
  if (SKIP_LANGUAGE_VALIDATION.has(params.stage)) {
    return { valid: true };
  }

  const expected = resolveContentLanguage(params.websiteLanguage);
  if (expected !== "ar") {
    return { valid: true };
  }

  if (
    params.stage === "file-generation" &&
    params.filePath &&
    !isCopyBearingWebsiteFile(params.filePath)
  ) {
    return { valid: true };
  }

  let blob = "";
  if (
    params.stage === "file-generation" &&
    params.result &&
    typeof params.result === "object" &&
    "content" in (params.result as GeneratedProjectFile)
  ) {
    const raw = String((params.result as GeneratedProjectFile).content ?? "");
    blob = extractUserFacingCopyFromSource(raw);
    // Structural files with no extracted copy yet — validate metadata strings only
    if (!blob && /layout\.tsx$/i.test(params.filePath || "")) {
      blob = extractUserFacingCopyFromSource(
        raw.match(/metadata[\s\S]*?}\s*;?/i)?.[0] || raw,
      );
    }
  } else {
    blob = collectStrings(params.result);
  }

  blob = normalizeWebsiteCopyText(blob);
  const arabicChars = countArabicCharacters(blob);
  const minChars = params.stage === "file-generation" ? 12 : 32;

  if (arabicChars < minChars) {
    return {
      valid: false,
      reason: `Language mismatch for stage "${params.stage}": expected Arabic user-facing copy but output has only ${arabicChars} Arabic characters in visible strings (minimum ${minChars}). Rewrite ALL visible strings in Modern Standard Arabic.`,
    };
  }

  const latinWords = (blob.match(/[A-Za-z]{3,}/g) || []).length;
  const arabicWords = (blob.match(/[\u0600-\u06FF]+/g) || []).length;
  if (
    params.stage === "file-generation" &&
    latinWords > 4 &&
    arabicWords > 0 &&
    latinWords > arabicWords * 2 &&
    ENGLISH_UI_LEAK.test(blob)
  ) {
    return {
      valid: false,
      reason: `Language mismatch for stage "${params.stage}": mixed English UI labels detected alongside Arabic. Replace ALL navigation, buttons, headings, and placeholders with Modern Standard Arabic.`,
    };
  }

  return { valid: true };
}

export function languageMismatchRepairHint(
  websiteLanguage: string,
  reason: string,
): string {
  const base = `${reason}\n\nREMINDER: Website output language is ${websiteLanguage}. ALL navigation, buttons, headings, body text, CTAs, forms, footer, metadata, and SEO strings must be in ${websiteLanguage} only. Ignore any English examples in upstream Strategy/Analysis JSON — treat them as structure hints only.`;

  if (resolveContentLanguage(websiteLanguage) !== "ar") {
    return base;
  }

  return `${base}

Arabic examples (use similar native phrasing):
- Navigation: الرئيسية، الخدمات، من نحن، تواصل معنا
- CTAs: ابدأ الآن، احجز موعدًا، تواصل معنا، اطلب عرضًا
- Headings: حلول احترافية لعملك · خدماتنا · لماذا نحن
- Forms: الاسم، البريد الإلكتروني، الرسالة، إرسال
- Metadata title/description: fully in Modern Standard Arabic
- Layout: <html lang="ar" dir="rtl">
Do NOT output English UI text unless it is an untranslated brand name from the brief.`;
}

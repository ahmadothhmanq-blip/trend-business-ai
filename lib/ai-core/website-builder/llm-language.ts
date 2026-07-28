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

const USER_FACING_FILE =
  /(page\.tsx|layout\.tsx|components\/(sections|layout|ui)\/|Hero|Header|Footer|Nav|Contact|Cta|Services|Features)/i;

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
  return USER_FACING_FILE.test(path) || path.endsWith(".tsx");
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
    !isUserFacingWebsiteFile(params.filePath)
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
    blob = String((params.result as GeneratedProjectFile).content ?? "");
  } else {
    blob = collectStrings(params.result);
  }

  const arabicChars = countArabicCharacters(blob);
  const minChars = params.stage === "file-generation" ? 16 : 32;
  if (arabicChars < minChars) {
    return {
      valid: false,
      reason: `Language mismatch for stage "${params.stage}": expected Arabic user-facing copy but output has only ${arabicChars} Arabic characters (minimum ${minChars}). Rewrite ALL visible strings in Modern Standard Arabic.`,
    };
  }

  return { valid: true };
}

export function languageMismatchRepairHint(
  websiteLanguage: string,
  reason: string,
): string {
  return `${reason}\n\nREMINDER: Website output language is ${websiteLanguage}. ALL navigation, buttons, headings, body text, CTAs, forms, footer, metadata, and SEO strings must be in ${websiteLanguage} only. Ignore any English examples in upstream Strategy/Analysis JSON.`;
}

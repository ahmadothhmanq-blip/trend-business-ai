import { resolveContentLanguage } from "@/lib/ai-core/content/content-language";
import {
  countArabicCharacters,
  extractUserFacingCopyFromSource,
} from "@/lib/ai-core/website-builder/llm-language";
import { isArabicPrompt } from "@/lib/ai-core/website-builder/prompt-industry";
import type {
  SemanticQualityContext,
  SemanticQualityIssue,
} from "@/lib/ai-core/semantic-content-quality/types";

const ENGLISH_LEAK =
  /\b(get started|contact us|learn more|our services|about us|welcome to)\b/i;

export function detectLocalizationQuality(
  context: SemanticQualityContext,
): SemanticQualityIssue[] {
  const issues: SemanticQualityIssue[] = [];
  const lang = resolveContentLanguage(context.language);
  const copyBearing = context.files.filter((f) =>
    /page\.tsx$|layout\.tsx$|components\/(sections|layout)\//i.test(f.path),
  );

  const userCopy = copyBearing
    .map((f) => extractUserFacingCopyFromSource(f.content))
    .join("\n");

  if (lang === "ar" || isArabicPrompt(context.prompt ?? "")) {
    const arabicCount = countArabicCharacters(userCopy);
    if (arabicCount < 40) {
      issues.push({
        id: "localization-arabic-thin",
        dimension: "localization",
        severity: "error",
        message: "Insufficient Arabic copy in user-facing content.",
        repairHint: "Rewrite hero, sections, and CTAs in Arabic.",
      });
    }

    const hasRtl = context.files.some(
      (f) =>
        /dir=["']rtl["']/i.test(f.content) ||
        /direction:\s*rtl/i.test(f.content),
    );
    if (!hasRtl) {
      issues.push({
        id: "localization-rtl-missing",
        dimension: "localization",
        severity: "warning",
        message: "RTL direction not detected for Arabic website.",
        repairHint: "Set dir=\"rtl\" on html/body or root layout.",
      });
    }
  } else if (lang !== "en") {
    if (ENGLISH_LEAK.test(userCopy) && userCopy.length > 80) {
      issues.push({
        id: "localization-english-leak",
        dimension: "localization",
        severity: "warning",
        message: `English UI phrases detected in ${lang} localized copy.`,
        repairHint: `Translate visible strings to ${lang}.`,
      });
    }
  }

  const latinInArabic =
    lang === "ar" &&
    (userCopy.match(/[A-Za-z]{4,}/g) ?? []).filter(
      (word) => !/^(class|href|src|http|next|react)$/i.test(word),
    ).length > 8;

  if (latinInArabic) {
    issues.push({
      id: "localization-mixed-script",
      dimension: "localization",
      severity: "warning",
      message: "Mixed Latin script fragments in Arabic copy.",
      repairHint: "Localize remaining English fragments.",
    });
  }

  return issues;
}

import { detectIndustryFromPrompt } from "@/lib/ai-core/website-builder/prompt-industry";
import type {
  SemanticQualityContext,
  SemanticQualityIssue,
} from "@/lib/ai-core/semantic-content-quality/types";

function copyBlob(context: SemanticQualityContext): string {
  return context.files.map((f) => f.content).join("\n").toLowerCase();
}

function industryMentioned(blob: string, industry: string): boolean {
  const tokens = industry
    .toLowerCase()
    .split(/[^a-z0-9\u0600-\u06FF]+/)
    .filter((t) => t.length > 3);
  return tokens.some((token) => blob.includes(token));
}

export function detectIndustryAlignment(
  context: SemanticQualityContext,
): SemanticQualityIssue[] {
  const issues: SemanticQualityIssue[] = [];
  const blob = copyBlob(context);
  const match =
    context.industryId || context.industry
      ? {
          id: context.industryId ?? context.industry ?? "business",
          label: context.industry ?? context.industryId ?? "business",
        }
      : context.prompt
        ? detectIndustryFromPrompt(context.prompt)
        : null;

  const industryLabel = match?.label ?? context.industry ?? "business";
  if (match && !industryMentioned(blob, industryLabel)) {
    issues.push({
      id: "industry-weak-signal",
      dimension: "industryRelevance",
      severity: "warning",
      message: `Generated copy weakly reflects expected industry (${industryLabel}).`,
      repairHint: `Weave ${industryLabel}-specific terminology into hero, services, and CTAs.`,
    });
  }

  for (const forbidden of context.forbiddenSubjects ?? []) {
    const subject = forbidden.trim().toLowerCase();
    if (!subject || !blob.includes(subject)) continue;
    issues.push({
      id: `industry-forbidden-${subject.slice(0, 10)}`,
      dimension: "industryRelevance",
      severity: "error",
      message: `Forbidden off-industry subject detected: "${forbidden}"`,
      repairHint: `Remove references to "${forbidden}" and align with ${industryLabel}.`,
    });
  }

  const toneHits = (context.toneKeywords ?? []).filter((kw) =>
    blob.includes(kw.toLowerCase()),
  );
  if ((context.toneKeywords?.length ?? 0) >= 2 && toneHits.length === 0) {
    issues.push({
      id: "industry-tone-miss",
      dimension: "industryRelevance",
      severity: "warning",
      message: "Industry tone keywords are missing from generated copy.",
      repairHint: `Include tone cues such as: ${context.toneKeywords?.slice(0, 4).join(", ")}.`,
    });
  }

  for (const section of (context.requiredSections ?? []).slice(0, 6)) {
    if (!section) continue;
    const needle = section.toLowerCase().slice(0, 14);
    if (needle.length < 4) continue;
    if (!blob.includes(needle)) {
      issues.push({
        id: `industry-section-${needle}`,
        dimension: "industryRelevance",
        severity: "warning",
        message: `Required section topic weakly covered: ${section}`,
        repairHint: `Add a dedicated section for "${section}".`,
      });
    }
  }

  return issues;
}

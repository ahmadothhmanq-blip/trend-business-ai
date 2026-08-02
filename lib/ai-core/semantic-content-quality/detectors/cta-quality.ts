import type {
  SemanticQualityContext,
  SemanticQualityIssue,
} from "@/lib/ai-core/semantic-content-quality/types";

const GENERIC_CTA_LABELS = new Set([
  "click here",
  "learn more",
  "read more",
  "submit",
  "go",
  "here",
  "link",
]);

const ACTION_VERB_PATTERN =
  /\b(book|buy|shop|order|contact|call|start|get|try|schedule|request|subscribe|sign up|join|explore|discover|احجز|تواصل|ابدأ|اشتر|سجّل|اتصل)\b/i;

function extractCtaLabels(content: string): string[] {
  const labels: string[] = [];
  const patterns = [
    /<(?:Button|a)[^>]*>([^<]{2,80})<\//gi,
    /(?:label|title|cta|children)\s*[:=]\s*["']([^"']{2,80})["']/gi,
  ];
  for (const pattern of patterns) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(content)) !== null) {
      const label = match[1]?.trim();
      if (label && label.length >= 2) labels.push(label);
    }
  }
  return labels;
}

export function detectCtaQuality(
  context: SemanticQualityContext,
): SemanticQualityIssue[] {
  const issues: SemanticQualityIssue[] = [];
  const home = context.files.find((f) => f.path.endsWith("app/page.tsx"));
  const allLabels = context.files.flatMap((f) => extractCtaLabels(f.content));
  const uniqueLabels = [...new Set(allLabels.map((l) => l.toLowerCase()))];

  if (allLabels.length === 0) {
    issues.push({
      id: "cta-missing",
      dimension: "ctaQuality",
      severity: "error",
      message: "No CTA labels detected in generated website copy.",
      repairHint: "Add a clear primary CTA in the hero and contact sections.",
      filePath: home?.path,
    });
    return issues;
  }

  const generic = uniqueLabels.filter((label) => GENERIC_CTA_LABELS.has(label));
  if (generic.length > 0) {
    issues.push({
      id: "cta-generic-label",
      dimension: "ctaQuality",
      severity: "warning",
      message: `Generic CTA labels detected: ${generic.join(", ")}`,
      repairHint: "Use action-oriented, business-specific CTA copy.",
    });
  }

  const hasActionVerb = allLabels.some((label) => ACTION_VERB_PATTERN.test(label));
  if (!hasActionVerb) {
    issues.push({
      id: "cta-weak-action",
      dimension: "ctaQuality",
      severity: "warning",
      message: "CTA labels lack clear action verbs.",
      repairHint: "Use verbs like Book, Contact, Get Started, or Shop Now.",
    });
  }

  if (context.primaryCta) {
    const primary = context.primaryCta.toLowerCase().slice(0, 16);
    const matchesPrimary = allLabels.some((label) =>
      label.toLowerCase().includes(primary),
    );
    if (!matchesPrimary && primary.length >= 4) {
      issues.push({
        id: "cta-primary-mismatch",
        dimension: "ctaQuality",
        severity: "warning",
        message: `Primary CTA "${context.primaryCta}" not reflected in generated buttons/links.`,
        repairHint: `Align hero CTA with "${context.primaryCta}".`,
        filePath: home?.path,
      });
    }
  }

  return issues;
}

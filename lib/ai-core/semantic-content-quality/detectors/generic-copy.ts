import { findContentCliches } from "@/lib/ai-core/content-intelligence/cliches";
import type {
  SemanticQualityContext,
  SemanticQualityIssue,
} from "@/lib/ai-core/semantic-content-quality/types";

const VAGUE_PHRASES = [
  "innovative solutions",
  "we help businesses",
  "your success is our priority",
  "leading provider",
  "trusted partner",
  "comprehensive solutions",
  "tailored solutions",
  "empower your",
  "transform your business",
  "click here",
  "learn more about us",
  "welcome to our website",
  "lorem ipsum",
  "your company",
  "coming soon",
  "sample text",
];

const PLACEHOLDER_PATTERN =
  /\b(TODO|FIXME|lorem ipsum|your (company|brand|name|text) here|coming soon|sample text only|placeholder)\b/i;

export function detectGenericCopy(
  context: SemanticQualityContext,
): SemanticQualityIssue[] {
  const issues: SemanticQualityIssue[] = [];
  const blob = context.files.map((f) => f.content).join("\n").toLowerCase();

  for (const cliche of findContentCliches(blob)) {
    issues.push({
      id: `generic-cliche-${cliche.slice(0, 12)}`,
      dimension: "genericCopy",
      severity: "warning",
      message: `Generic AI cliché detected: "${cliche}"`,
      repairHint: `Replace "${cliche}" with industry-specific, concrete copy.`,
    });
  }

  for (const phrase of VAGUE_PHRASES) {
    if (!blob.includes(phrase)) continue;
    issues.push({
      id: `generic-vague-${phrase.slice(0, 12)}`,
      dimension: "genericCopy",
      severity: "warning",
      message: `Vague filler phrase detected: "${phrase}"`,
      repairHint: `Rewrite copy to be specific to ${context.industry ?? "the business"}.`,
    });
  }

  if (PLACEHOLDER_PATTERN.test(blob)) {
    issues.push({
      id: "generic-placeholder",
      dimension: "genericCopy",
      severity: "error",
      message: "Placeholder or incomplete copy detected in generated files.",
      repairHint: "Replace all placeholder text with production-ready copy.",
    });
  }

  return issues;
}

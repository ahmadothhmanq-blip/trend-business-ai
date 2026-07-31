import type { GeneratedProjectFile } from "@/lib/ai/types";
import type { AgencyGenerationContract } from "@/lib/ai-core/agency-orchestrator/types";
import {
  validateGenerationAgainstBusinessProfile,
  type BusinessQualityReport,
} from "@/lib/ai-core/business-intelligence/validate";
import {
  validateAccessibility,
  repairAccessibility,
  type AccessibilityReport,
} from "@/lib/ai-core/accessibility/validate";

export type AgencyQualityReport = {
  passed: boolean;
  score: number;
  businessValidation: BusinessQualityReport | null;
  accessibilityReport: AccessibilityReport | null;
  designConsistency: {
    passed: boolean;
    issues: string[];
  };
  contentQuality: {
    passed: boolean;
    issues: string[];
  };
  seoReadiness: {
    passed: boolean;
    issues: string[];
  };
  blockers: string[];
  warnings: string[];
  summary: string;
};

function extractHeroText(files: GeneratedProjectFile[]): string {
  for (const file of files) {
    if (!/hero/i.test(file.path)) continue;
    const match = file.content.match(/>([^<]{20,120})</);
    if (match?.[1]) return match[1].trim();
  }
  const home = files.find((f) => /page\.tsx$|home/i.test(f.path));
  if (!home) return "";
  const h1 = home.content.match(/<h1[^>]*>([^<]+)</i);
  return h1?.[1]?.trim() || "";
}

function extractSectionLabels(files: GeneratedProjectFile[]): string[] {
  const labels: string[] = [];
  const headingRe = /<h2[^>]*>([^<]+)</gi;
  for (const file of files) {
    if (!/components\/|page\.tsx/.test(file.path)) continue;
    let match: RegExpExecArray | null;
    while ((match = headingRe.exec(file.content)) !== null) {
      const label = match[1].trim();
      if (label.length > 2 && label.length < 80) labels.push(label);
    }
  }
  return Array.from(new Set(labels)).slice(0, 12);
}

function extractCtaLabels(files: GeneratedProjectFile[]): string[] {
  const ctas: string[] = [];
  const buttonRe = /<(?:button|a)[^>]*>([^<]{2,40})</gi;
  for (const file of files) {
    let match: RegExpExecArray | null;
    while ((match = buttonRe.exec(file.content)) !== null) {
      const label = match[1].trim();
      if (!/menu|close|toggle|submit/i.test(label)) ctas.push(label);
    }
  }
  return Array.from(new Set(ctas)).slice(0, 8);
}

function checkDesignConsistency(
  files: GeneratedProjectFile[],
  contract: AgencyGenerationContract,
): { passed: boolean; issues: string[] } {
  const issues: string[] = [];
  const combined = files.map((f) => f.content).join("\n");
  const dna = contract.designDNA;

  if (!/className=.*(?:py-1[26]|py-2[04]|py-3[02])/.test(combined)) {
    issues.push("Missing generous section spacing (agency DNA requires breathing room)");
  }
  if (!/className=.*(?:rounded-(?:lg|xl|2xl)|rounded-\[)/.test(combined)) {
    issues.push("Missing modern border-radius on components");
  }
  if (dna.benchmark === "linear-quality" && !/dark|bg-(?:zinc|slate|neutral)-9/.test(combined)) {
    issues.push("Linear-quality DNA expects dark-first surfaces");
  }
  if (!/<h1\b/i.test(combined)) {
    issues.push("Missing H1 heading — breaks visual hierarchy");
  }
  const h1count = (combined.match(/<h1\b/gi) || []).length;
  if (h1count > 1) {
    issues.push(`Multiple H1 tags (${h1count}) — should be exactly one per page`);
  }

  return { passed: issues.length === 0, issues };
}

function checkContentQuality(
  files: GeneratedProjectFile[],
  contract: AgencyGenerationContract,
): { passed: boolean; issues: string[] } {
  const issues: string[] = [];
  const combined = files.map((f) => f.content).join("\n").toLowerCase();
  const genericPhrases = [
    "lorem ipsum",
    "your company",
    "company name",
    "placeholder text",
    "sample text",
    "todo:",
  ];
  for (const phrase of genericPhrases) {
    if (combined.includes(phrase)) {
      issues.push(`Generic placeholder detected: "${phrase}"`);
    }
  }
  const companyName = contract.brandKit.companyName.toLowerCase();
  if (!combined.includes(companyName)) {
    issues.push(`Brand name "${contract.brandKit.companyName}" not found in generated content`);
  }
  return { passed: issues.length === 0, issues };
}

function checkSeoReadiness(files: GeneratedProjectFile[]): {
  passed: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  const layout = files.find((f) => /layout\.tsx$/.test(f.path));
  const combined = files.map((f) => f.content).join("\n");

  if (!layout && !/metadata|title|description/i.test(combined)) {
    issues.push("Missing page metadata (title/description)");
  }
  if (!/application\/ld\+json|structured-data|schema\.org/i.test(combined)) {
    issues.push("Missing structured data (JSON-LD)");
  }
  if (!/og:|openGraph|twitter/i.test(combined)) {
    issues.push("Missing Open Graph / Twitter card metadata");
  }
  return { passed: issues.length === 0, issues };
}

function runAccessibilityCheck(files: GeneratedProjectFile[]): {
  passed: boolean;
  issues: string[];
  report: AccessibilityReport;
} {
  const report = validateAccessibility(files);
  return {
    passed: report.passed,
    issues: report.issues
      .filter((i) => i.severity === "blocker")
      .map((i) => i.detail),
    report,
  };
}

/**
 * Unified agency quality gate — validates business relevance, design, content, SEO, a11y.
 */
export function runAgencyQualityGate(params: {
  files: GeneratedProjectFile[];
  contract: AgencyGenerationContract;
  imagePrompts?: Array<{ id: string; prompt: string; alt?: string }>;
}): AgencyQualityReport {
  const { files, contract } = params;
  const profile = contract.businessIntelligence.profile;
  const thresholds = contract.qualityThresholds;

  const heroText = extractHeroText(files) || contract.content.hero.headline;
  const sectionLabels = extractSectionLabels(files);
  const ctaLabels = extractCtaLabels(files);

  const businessValidation = thresholds.requireBusinessValidation
    ? validateGenerationAgainstBusinessProfile({
        profile,
        imagePrompts: params.imagePrompts,
        heroText,
        sectionLabels,
        ctaLabels: ctaLabels.length ? ctaLabels : [contract.content.hero.ctaPrimary],
      })
    : null;

  const designConsistency = checkDesignConsistency(files, contract);
  const contentQuality = checkContentQuality(files, contract);
  const seoReadiness = checkSeoReadiness(files);
  const a11y = runAccessibilityCheck(files);

  const blockers: string[] = [];
  const warnings: string[] = [];

  if (businessValidation && !businessValidation.passed) {
    blockers.push(...businessValidation.issues);
  }
  if (!designConsistency.passed) {
    warnings.push(...designConsistency.issues);
  }
  if (!contentQuality.passed) {
    blockers.push(...contentQuality.issues);
  }
  if (!a11y.passed) {
    blockers.push(...a11y.issues);
  }
  if (!seoReadiness.passed) {
    warnings.push(...seoReadiness.issues);
  }
  warnings.push(
    ...a11y.report.issues
      .filter((i) => i.severity === "warning")
      .map((i) => i.detail),
  );

  const scores = [
    businessValidation?.score ?? 100,
    designConsistency.passed ? 85 : 55,
    contentQuality.passed ? 90 : 40,
    seoReadiness.passed ? 80 : 50,
    a11y.report.score,
  ];
  const score = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

  const passed =
    blockers.length === 0 &&
    score >= thresholds.minOverallScore &&
    (businessValidation?.score ?? 100) >= thresholds.minIndustryRelevance;

  return {
    passed,
    score,
    businessValidation,
    accessibilityReport: a11y.report,
    designConsistency,
    contentQuality,
    seoReadiness,
    blockers,
    warnings,
    summary: passed
      ? `Agency quality passed · score ${score} · ${contract.brandKit.companyName}`
      : `Agency quality failed · ${blockers.length} blocker(s) · score ${score}`,
  };
}

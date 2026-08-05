import { randomUUID } from "node:crypto";
import type {
  ImpactEstimate,
  ReviewArea,
  ReviewIssue,
  ReviewPriority,
  ReviewStudioInput,
  StudioImprovement,
  WebsiteAnalysis,
} from "@/lib/website/review-studio/types";
import type { WqbsBenchmarkReport } from "@/lib/website/quality-benchmark";
import { estimateImprovementImpact } from "@/lib/website/review-studio/impact/impact-estimator";
import { categorizePriority } from "@/lib/website/review-studio/recommendations/recommendation-engine";

const AREA_IMPROVEMENTS: Record<
  ReviewArea,
  { title: string; recommendation: string; patchType: "deterministic" | "targeted-regen" }
> = {
  hero: {
    title: "Strengthen hero section",
    recommendation:
      "Add a compelling H1, value proposition, and primary CTA above the fold.",
    patchType: "targeted-regen",
  },
  navigation: {
    title: "Improve navigation",
    recommendation:
      "Add persistent nav with clear labels, internal links, and mobile-friendly structure.",
    patchType: "deterministic",
  },
  cta: {
    title: "Enhance call-to-action",
    recommendation:
      "Add prominent primary and secondary CTAs with action-oriented copy.",
    patchType: "targeted-regen",
  },
  trust: {
    title: "Add trust signals",
    recommendation:
      "Include trust badges, certifications, or security indicators.",
    patchType: "targeted-regen",
  },
  testimonials: {
    title: "Add social proof",
    recommendation:
      "Include testimonials, client logos, or review quotes.",
    patchType: "targeted-regen",
  },
  pricing: {
    title: "Add pricing section",
    recommendation:
      "Create a pricing section with clear tiers and feature comparison.",
    patchType: "targeted-regen",
  },
  forms: {
    title: "Improve lead capture",
    recommendation:
      "Add a contact or lead capture form with clear value proposition.",
    patchType: "targeted-regen",
  },
  footer: {
    title: "Enhance footer",
    recommendation:
      "Add footer with navigation links, copyright, and contact info.",
    patchType: "deterministic",
  },
  seo: {
    title: "Improve SEO metadata",
    recommendation:
      "Add unique page title, meta description, and structured data.",
    patchType: "deterministic",
  },
  content: {
    title: "Expand content depth",
    recommendation:
      "Add industry-relevant copy with clear heading hierarchy.",
    patchType: "targeted-regen",
  },
  accessibility: {
    title: "Fix accessibility issues",
    recommendation:
      "Add lang attribute, ARIA labels, focus-visible styles, and alt text.",
    patchType: "deterministic",
  },
  performance: {
    title: "Optimize performance",
    recommendation:
      "Add lazy loading to images and reduce bundle size.",
    patchType: "deterministic",
  },
  localization: {
    title: "Improve localization",
    recommendation:
      "Set lang attribute and declare text direction for RTL/LTR content.",
    patchType: "deterministic",
  },
};

function groupIssuesByArea(issues: ReviewIssue[]): Map<ReviewArea, ReviewIssue[]> {
  const map = new Map<ReviewArea, ReviewIssue[]>();
  for (const issue of issues) {
    const list = map.get(issue.area) ?? [];
    list.push(issue);
    map.set(issue.area, list);
  }
  return map;
}

function targetFilesForArea(area: ReviewArea, files: ReviewStudioInput["files"]): string[] {
  const patterns: Record<ReviewArea, RegExp> = {
    hero: /page\.(tsx|jsx)/i,
    navigation: /layout/i,
    cta: /page\.(tsx|jsx)/i,
    trust: /page|about/i,
    testimonials: /page/i,
    pricing: /pricing|page/i,
    forms: /contact|form|page/i,
    footer: /layout|footer/i,
    seo: /layout|page/i,
    content: /page/i,
    accessibility: /layout|globals/i,
    performance: /globals|page/i,
    localization: /layout/i,
  };
  return files.filter((f) => patterns[area].test(f.path)).map((f) => f.path).slice(0, 3);
}

/**
 * Generate targeted improvements for hero, nav, CTA, trust, SEO, a11y, etc.
 */
export function generateImprovements(input: {
  issues: ReviewIssue[];
  analysis: WebsiteAnalysis;
  benchmark: WqbsBenchmarkReport;
  studioInput: ReviewStudioInput;
}): StudioImprovement[] {
  const grouped = groupIssuesByArea(input.issues);
  const improvements: StudioImprovement[] = [];

  for (const [area, areaIssues] of grouped) {
    const template = AREA_IMPROVEMENTS[area];
    const priority = categorizePriority(areaIssues.map((i) => i.priority));
    const targetFiles = targetFilesForArea(area, input.studioInput.files);
    const impact = estimateImprovementImpact(area, areaIssues, input.benchmark);

    improvements.push({
      id: randomUUID(),
      area,
      priority,
      title: template.title,
      description: areaIssues.map((i) => i.description).join("; "),
      recommendation: template.recommendation,
      targetFiles,
      patchType: template.patchType,
      instruction: buildImprovementInstruction(area, template.recommendation, areaIssues),
      impact,
      issueIds: areaIssues.map((i) => i.id),
    });
  }

  const priorityOrder: ReviewPriority[] = [
    "critical",
    "high",
    "medium",
    "low",
    "nice-to-have",
  ];
  improvements.sort(
    (a, b) => priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority),
  );

  return improvements;
}

function buildImprovementInstruction(
  area: ReviewArea,
  recommendation: string,
  issues: ReviewIssue[],
): string {
  return [
    `[review-studio] Targeted improvement for ${area}:`,
    recommendation,
    "Issues to address:",
    ...issues.slice(0, 5).map((i, n) => `${n + 1}. ${i.description}`),
    "Only modify files related to this area. Do not regenerate the entire website.",
  ].join("\n");
}

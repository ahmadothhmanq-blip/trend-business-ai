/**
 * Phase 6 — Website Intelligence analysis.
 */

import { suggestWebsiteImprovements } from "@/lib/ai-core/website-editor";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";
import type {
  WebsiteIntelligenceReport,
  WebsiteIntelligenceSuggestion,
} from "@/lib/ai-core/website-design-platform/types";

function gradeFromScore(score: number): WebsiteIntelligenceReport["grade"] {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 55) return "D";
  return "F";
}

export function runWebsiteIntelligence(
  project: GeneratedWebsiteProject,
): WebsiteIntelligenceReport {
  const files = project.files || [];
  const base = suggestWebsiteImprovements({ files, project });

  const suggestions: WebsiteIntelligenceSuggestion[] = base.suggestions.map(
    (s) => ({
      id: s.id,
      category: mapCategory(s.category),
      title: s.title,
      description: s.description,
      priority:
        s.priority === "high"
          ? "high"
          : s.priority === "low"
            ? "low"
            : "medium",
      command: s.command,
      impact:
        s.priority === "high"
          ? "High impact on conversion & trust"
          : "Improves polish and completeness",
    }),
  );

  const joined = files.map((f) => f.content).join("\n").toLowerCase();

  if (!/schema\.org|application\/ld\+json/.test(joined)) {
    suggestions.push({
      id: "intel-schema",
      category: "seo",
      title: "Add structured data",
      description:
        "JSON-LD schema helps search engines understand services, products, and local business.",
      priority: "high",
      command: "Add schema markup for the business",
      impact: "SEO visibility",
    });
  }

  if (!/loading=["']lazy["']|fetchpriority/.test(joined)) {
    suggestions.push({
      id: "intel-perf",
      category: "performance",
      title: "Optimize image loading",
      description:
        "Use lazy loading and priority hints on hero media for better Core Web Vitals.",
      priority: "medium",
      impact: "LCP / CLS",
    });
  }

  if (!/aria-|role=/.test(joined)) {
    suggestions.push({
      id: "intel-a11y",
      category: "accessibility",
      title: "Strengthen accessibility labels",
      description:
        "Add ARIA labels on navigation and forms for assistive tech.",
      priority: "medium",
      impact: "Inclusive UX",
    });
  }

  if (
    !suggestions.some((s) => /cta|call to action/i.test(s.title)) &&
    !/book now|get started|request a quote|contact us/i.test(joined)
  ) {
    suggestions.push({
      id: "intel-cta",
      category: "cta",
      title: "Clarify primary CTA",
      description:
        "A single dominant call-to-action improves conversion across hero and footer.",
      priority: "high",
      command: "Strengthen the primary call to action",
      impact: "Conversion",
    });
  }

  const critical = suggestions.filter((s) => s.priority === "critical").length;
  const high = suggestions.filter((s) => s.priority === "high").length;
  const medium = suggestions.filter((s) => s.priority === "medium").length;
  let score = 92 - critical * 12 - high * 6 - medium * 3;
  score = Math.max(35, Math.min(98, score));

  const strengths: string[] = [];
  if ((project.pages || []).length >= 3) strengths.push("Multi-page structure");
  if (project.seoPackage) strengths.push("SEO package present");
  if (project.designSystem) strengths.push("Design system applied");
  if (
    (project.assetManifest as { assets?: unknown[] } | undefined)?.assets
      ?.length
  )
    strengths.push("Image assets attached");
  if (project.qualityReport) strengths.push("Quality report available");

  return {
    score,
    grade: gradeFromScore(score),
    summary: `Website intelligence score ${score}/100 (${gradeFromScore(score)}). ${suggestions.length} improvement opportunities identified.`,
    suggestions: suggestions.slice(0, 16),
    strengths:
      strengths.length > 0
        ? strengths
        : ["Generated site structure is ready for polish"],
    generatedAt: new Date().toISOString(),
  };
}

function mapCategory(
  category: string,
): WebsiteIntelligenceSuggestion["category"] {
  if (category === "missing-section") return "missing-section";
  if (category === "conversion") return "conversion";
  if (category === "seo") return "seo";
  if (category === "ux" || category === "design") return "layout";
  return "layout";
}

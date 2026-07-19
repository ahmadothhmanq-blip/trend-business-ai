/**
 * Heuristic Website Audit Engine — design, UX, content, sections, mobile, conversion.
 */

import type {
  CoreBusinessProfile,
  CoreDesignSystem,
  CoreProductStrategy,
  CoreQualityReport,
} from "@/lib/ai-core/layers/types";
import type { CorePerformanceReport } from "@/lib/ai-core/performance/types";
import type { CoreSeoPackage } from "@/lib/ai-core/seo/types";
import {
  computeWebsiteQualityScore,
} from "@/lib/ai-core/optimizer/score";
import type {
  WebsiteAuditIssue,
  WebsiteAuditResult,
} from "@/lib/ai-core/optimizer/types";

export type AuditFile = { path: string; content: string };

function allContent(files: AuditFile[]): string {
  return files.map((f) => f.content).join("\n");
}

function issue(
  id: string,
  category: WebsiteAuditIssue["category"],
  severity: WebsiteAuditIssue["severity"],
  title: string,
  detail: string,
  suggestion: string,
): WebsiteAuditIssue {
  return { id, category, severity, title, detail, suggestion };
}

export function runHeuristicWebsiteAudit(params: {
  files: AuditFile[];
  strategy?: CoreProductStrategy;
  designSystem?: CoreDesignSystem;
  profile?: CoreBusinessProfile;
  qualityReport?: CoreQualityReport;
  seoPackage?: CoreSeoPackage;
  performanceReport?: CorePerformanceReport;
}): WebsiteAuditResult {
  const {
    files,
    strategy,
    designSystem,
    profile,
    qualityReport,
    seoPackage,
    performanceReport,
  } = params;
  const content = allContent(files);
  const lower = content.toLowerCase();
  const issues: WebsiteAuditIssue[] = [];
  const missingSections: string[] = [];

  // Design quality
  if (designSystem?.colors?.primary) {
    const primary = designSystem.colors.primary;
    if (
      !content.includes(primary) &&
      !content.includes("--color-primary") &&
      !/primary/i.test(content)
    ) {
      issues.push(
        issue(
          "design-primary",
          "design",
          "major",
          "Primary brand color missing",
          "Design system primary color is not reflected in generated CSS/components.",
          "Apply primary color tokens to CTAs, accents, and CSS variables.",
        ),
      );
    }
  }
  if (
    designSystem?.typography?.headingFont &&
    !lower.includes(designSystem.typography.headingFont.toLowerCase().slice(0, 8)) &&
    !/font-|next\/font/i.test(content)
  ) {
    issues.push(
      issue(
        "design-type",
        "design",
        "minor",
        "Heading font may be missing",
        "Design system heading font not detected in output.",
        "Wire the heading font into layout/globals or next/font.",
      ),
    );
  }

  // UX / mobile
  if (!/md:|sm:|lg:|@media/i.test(content)) {
    issues.push(
      issue(
        "mobile-breakpoints",
        "mobile",
        "major",
        "Weak mobile responsiveness",
        "Few responsive breakpoint utilities found.",
        "Add sm/md/lg layouts for hero, nav, and grids.",
      ),
    );
  }
  if (!/viewport/i.test(content) && !files.some((f) => f.path.includes("layout"))) {
    issues.push(
      issue(
        "mobile-viewport",
        "mobile",
        "critical",
        "Viewport / layout signals weak",
        "No viewport metadata or layout entry detected.",
        "Ensure app layout includes viewport and responsive shell.",
      ),
    );
  }

  // Content / conversion
  if (!/\b(get started|book|contact|buy|sign up|start free|request|schedule|shop now)\b/i.test(content)) {
    issues.push(
      issue(
        "conversion-cta",
        "conversion",
        "critical",
        "Primary CTA language missing",
        "No clear conversion CTA copy detected.",
        "Improve CTA buttons with action-oriented labels matching brand goals.",
      ),
    );
  }
  const home = files.find(
    (f) => f.path === "app/page.tsx" || f.path.endsWith("/page.tsx"),
  );
  if (home && home.content.trim().length < 250) {
    issues.push(
      issue(
        "content-thin-home",
        "content",
        "major",
        "Home page content is thin",
        "Home page has limited copy for trust and conversion.",
        "Expand headlines, service descriptions, and proof sections.",
      ),
    );
  }
  if (!/\b(h1|text-4xl|text-5xl|text-6xl)\b/i.test(content)) {
    issues.push(
      issue(
        "content-headline",
        "content",
        "major",
        "Weak headline hierarchy",
        "Strong display headline patterns not detected.",
        "Improve headlines with clearer value propositions.",
      ),
    );
  }

  // Missing sections
  const required = [
    ...(profile?.requiredSections ?? []),
    ...(strategy?.contentStructure ?? []),
    "Services",
    "Contact",
  ].slice(0, 10);
  for (const section of required) {
    if (!section) continue;
    const needle = section.toLowerCase().slice(0, 10);
    if (needle && !lower.includes(needle)) {
      missingSections.push(section);
      issues.push(
        issue(
          `section-${needle}`,
          "sections",
          "major",
          `Missing section: ${section}`,
          `Expected section "${section}" is weakly covered or absent.`,
          `Add a ${section} section with clear copy and CTA.`,
        ),
      );
    }
  }

  // Brand consistency
  let brandConsistent = true;
  if (designSystem?.stylePreset && issues.some((i) => i.category === "design")) {
    brandConsistent = false;
    issues.push(
      issue(
        "brand-consistency",
        "brand",
        "minor",
        "Brand consistency risk",
        "Design tokens or preset may not be consistently applied.",
        "Align colors, type, and CTA styles with the design system.",
      ),
    );
  }

  // SEO / perf signals from prior engines
  if (seoPackage?.readiness && !seoPackage.readiness.passed) {
    for (const msg of seoPackage.readiness.issues.slice(0, 4)) {
      issues.push(
        issue(
          `seo-${issues.length}`,
          "seo",
          "major",
          "SEO readiness issue",
          msg,
          "Strengthen metadata, titles, and keyword coverage.",
        ),
      );
    }
  }
  if (performanceReport && !performanceReport.passed) {
    for (const msg of performanceReport.issues.slice(0, 4)) {
      issues.push(
        issue(
          `perf-${issues.length}`,
          "performance",
          "major",
          "Performance issue",
          msg,
          "Optimize images, reduce payload, and keep mobile layouts light.",
        ),
      );
    }
  }
  if (qualityReport && !qualityReport.passed) {
    for (const msg of qualityReport.issues.slice(0, 3)) {
      issues.push(
        issue(
          `quality-${issues.length}`,
          "ux",
          "major",
          "Quality check issue",
          msg,
          "Address structural and UX gaps before publish.",
        ),
      );
    }
  }

  const scores = computeWebsiteQualityScore({
    issues,
    qualityReport,
    seoPackage,
    performanceReport,
  });

  const suggestions = Array.from(
    new Set([
      ...issues.map((i) => i.suggestion),
      ...missingSections.map((s) => `Add missing section: ${s}`),
    ]),
  ).slice(0, 12);

  return {
    scores,
    issues,
    missingSections,
    suggestions,
    brandConsistent,
    mobileReady: !issues.some(
      (i) => i.category === "mobile" && i.severity !== "minor",
    ),
    conversionReady: !issues.some(
      (i) => i.category === "conversion" && i.severity === "critical",
    ),
    source: "heuristic",
  };
}

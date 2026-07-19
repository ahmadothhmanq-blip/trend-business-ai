/**
 * Phase 11 — Publishing & performance helpers for Website Builder.
 */

import type { GeneratedProjectFile } from "@/lib/ai/types";

export type PerformanceUpgradeReport = {
  score: number;
  checks: Array<{
    id: string;
    label: string;
    passed: boolean;
    detail: string;
  }>;
  recommendations: string[];
};

/**
 * Heuristic Core Web Vitals / performance prep on generated files.
 */
export function runWebsitePerformanceUpgrade(
  files: GeneratedProjectFile[],
): PerformanceUpgradeReport {
  const joined = files.map((f) => f.content).join("\n");
  const checks = [
    {
      id: "image-lazy",
      label: "Lazy-load below-fold images",
      passed: /loading=["']lazy["']/.test(joined),
      detail: "Prefer loading=\"lazy\" on non-hero images",
    },
    {
      id: "lcp-priority",
      label: "Hero LCP priority",
      passed: /fetchPriority=["']high["']|priority=\{?true\}?/.test(joined),
      detail: "Mark hero media with high fetch priority",
    },
    {
      id: "font-display",
      label: "Font display swap",
      passed: /font-display:\s*swap|display:\s*["']swap["']/.test(joined),
      detail: "Use font-display: swap to reduce FOIT",
    },
    {
      id: "cls-sizes",
      label: "Image dimensions / sizes",
      passed: /\bwidth=\{|\bheight=\{|sizes=["']/.test(joined),
      detail: "Reserve space to limit CLS",
    },
    {
      id: "client-islands",
      label: "Limited client islands",
      passed: (joined.match(/['"]use client['"]/g) || []).length <= 12,
      detail: "Keep interactive islands lean for TTI",
    },
    {
      id: "sitemap",
      label: "Sitemap readiness",
      passed: /sitemap|robots\.txt/i.test(joined),
      detail: "Include sitemap/robots for crawlability",
    },
  ];

  const passed = checks.filter((c) => c.passed).length;
  const score = Math.round((passed / checks.length) * 100);
  const recommendations = checks
    .filter((c) => !c.passed)
    .map((c) => `${c.label}: ${c.detail}`);

  return { score, checks, recommendations };
}

/**
 * Apply safe performance patches (non-destructive) to globals/layout.
 */
export function applyPerformancePatches(
  files: GeneratedProjectFile[],
): GeneratedProjectFile[] {
  return files.map((file) => {
    if (!file.path.endsWith("globals.css") && !file.path.includes("globals.css")) {
      return file;
    }
    let css = file.content;
    if (!css.includes("/* Design Platform Performance */")) {
      css += `

/* Design Platform Performance */
img, video {
  max-width: 100%;
  height: auto;
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
`;
    }
    return { ...file, content: css };
  });
}

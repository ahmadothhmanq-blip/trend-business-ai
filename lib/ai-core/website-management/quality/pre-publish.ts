/**
 * Phase 8 — Pre-publish quality control.
 */

import type { GeneratedProjectFile } from "@/lib/ai/types";
import type {
  PrePublishQualityReport,
  SiteStructurePlan,
} from "@/lib/ai-core/website-management/types";
import { validateWebsiteLinks } from "@/lib/ai-core/website-management/links/validate";
import { runWebsitePerformanceUpgrade } from "@/lib/ai-core/website-design-platform/performance";

export function runPrePublishQualityControl(params: {
  files: GeneratedProjectFile[];
  structure?: SiteStructurePlan | null;
}): PrePublishQualityReport {
  const linkReport = validateWebsiteLinks({
    files: params.files,
    structure: params.structure,
  });
  const perf = runWebsitePerformanceUpgrade(params.files);
  const joined = params.files.map((f) => f.content).join("\n");

  const checks: PrePublishQualityReport["checks"] = [
    {
      id: "links",
      label: "Broken / missing links",
      passed: linkReport.ok,
      severity: "blocker",
      detail: linkReport.ok
        ? `Checked ${linkReport.checked} links — all resolve.`
        : `${linkReport.issues.filter((i) => i.severity === "error").length} link errors.`,
    },
    {
      id: "pages",
      label: "Navigation pages exist",
      passed: linkReport.coverage.missingRoutes.length === 0,
      severity: "blocker",
      detail:
        linkReport.coverage.missingRoutes.length === 0
          ? `${linkReport.coverage.pagesPresent} routes present.`
          : `Missing: ${linkReport.coverage.missingRoutes.join(", ")}`,
    },
    {
      id: "images",
      label: "Image references present",
      passed: /<img|next\/image|Image\s|site-images/.test(joined),
      severity: "warning",
      detail: "Hero/media imagery should be present for premium feel.",
    },
    {
      id: "seo-basics",
      label: "SEO basics",
      passed: /metadata|title:|description:|og:|sitemap/i.test(joined),
      severity: "warning",
      detail: "Metadata and sitemap readiness.",
    },
    {
      id: "mobile",
      label: "Mobile responsive patterns",
      passed: /md:|sm:|lg:|max-w-|px-6|responsive/i.test(joined),
      severity: "warning",
      detail: "Responsive utility classes detected.",
    },
    {
      id: "performance",
      label: "Performance heuristics",
      passed: perf.score >= 50,
      severity: "info",
      detail: `Performance score ${perf.score}/100.`,
    },
  ];

  const blockers = checks.filter((c) => !c.passed && c.severity === "blocker");
  const warnings = checks.filter((c) => !c.passed && c.severity === "warning");
  let score = 100 - blockers.length * 20 - warnings.length * 8;
  score = Math.max(20, Math.min(100, score));

  return {
    ready: blockers.length === 0,
    score,
    checks,
    linkReport,
    summary: blockers.length
      ? `Not ready to publish — ${blockers.length} blocker(s).`
      : warnings.length
        ? `Publishable with ${warnings.length} warning(s).`
        : "Quality checks passed — ready to publish.",
  };
}

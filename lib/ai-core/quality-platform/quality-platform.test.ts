import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  collapseOverlappingMessages,
  dedupeRepairInstructions,
  dedupeStrings,
  issueFingerprint,
} from "@/lib/ai-core/quality-platform/heuristics";
import { buildUnifiedRepairQueue } from "@/lib/ai-core/quality-platform/repair-queue";
import {
  buildUnifiedQualityReport,
  createQualityTelemetry,
} from "@/lib/ai-core/quality-platform/report";
import { toQualityDashboardModel } from "@/lib/ai-core/quality-platform/dashboard";
import type { QualityReport } from "@/lib/website/types/layers";

const SAMPLE_FILES = [
  {
    path: "app/page.tsx",
    content: `
      export default function Page() {
        return (
          <main>
            <h1>Premium Furniture Showroom</h1>
            <p>Handcrafted collections for modern homes.</p>
            <button>Book Visit</button>
          </main>
        );
      }
    `,
  },
  {
    path: "app/layout.tsx",
    content: `
      export const metadata = { title: "Furniture Showroom", description: "Premium furniture collections." };
      export default function Layout({ children }) { return <html><body>{children}</body></html>; }
    `,
  },
];

function structuralReport(overrides: Partial<QualityReport> = {}): QualityReport {
  return {
    passed: true,
    dimensions: [],
    weakSections: [],
    improveApplied: false,
    issues: [],
    ...overrides,
  };
}

describe("quality-platform heuristics", () => {
  it("dedupes near-duplicate messages", () => {
    const messages = [
      "Hero CTA is weak — use action-oriented copy.",
      "Hero CTA is weak: use action-oriented copy!",
      "Missing meta description on homepage.",
    ];
    const deduped = dedupeStrings(messages);
    assert.equal(deduped.length, 2);
  });

  it("collapses overlapping CTA and heading findings", () => {
    const collapsed = collapseOverlappingMessages([
      "Improve primary CTA copy on hero section.",
      "Hero button label is generic — strengthen CTA.",
      "Heading hierarchy skips h2 on homepage.",
      "Visual hierarchy: add subheading under hero h1.",
    ]);
    assert.ok(collapsed.length <= 3);
    assert.ok(collapsed.some((m) => /cta/i.test(m)));
  });

  it("dedupes repair instructions by fingerprint", () => {
    const instructions = [
      "Strengthen hero CTA with action-oriented label.",
      "Strengthen hero CTA with action-oriented label!",
      "Add meta description to layout metadata.",
    ];
    const deduped = dedupeRepairInstructions(instructions);
    assert.equal(deduped.length, 2);
    assert.ok(issueFingerprint(instructions[0]) === issueFingerprint(instructions[1]));
  });
});

describe("quality-platform repair queue", () => {
  it("merges structural and semantic repairs without duplication", () => {
    const structural = structuralReport({
      passed: false,
      weakSections: ["hero"],
      issues: ["Hero section needs stronger CTA."],
    });
    const semantic = {
      passed: false,
      summary: "Semantic content needs improvement.",
      issues: [
        {
          id: "cta-1",
          dimension: "ctaQuality" as const,
          severity: "warning" as const,
          message: "Hero CTA is weak — use action-oriented copy.",
          repairHint: "Use a specific CTA label.",
        },
      ],
      weakSections: ["hero"],
      scores: {
        overall: 62,
        genericCopy: 60,
        industryRelevance: 68,
        ctaQuality: 55,
        headingHierarchy: 70,
        semanticSeo: 65,
        crossPageConsistency: 72,
        localization: 70,
      },
    };

    const queue = buildUnifiedRepairQueue({
      structural,
      semantic,
      language: "en",
    });

    assert.ok(queue.instruction.length > 0);
    assert.ok(queue.dedupedCount >= 0);
    assert.ok(queue.items.length >= 1);
  });
});

describe("quality-platform report", () => {
  it("builds deterministic unified report and dashboard model", () => {
    const structural = structuralReport({
      passed: true,
      seoReadinessScore: 78,
      weakSections: ["footer"],
      issues: ["Footer missing contact link."],
    });

    const repair = buildUnifiedRepairQueue({ structural, language: "en" });

    const reportA = buildUnifiedQualityReport({
      structural,
      files: SAMPLE_FILES,
      repairQueue: repair.items,
      repairInstruction: repair.instruction,
      dedupedCount: repair.dedupedCount,
      durationMs: 42,
      modules: {
        structural: true,
        semantic: false,
        visual: false,
        accessibility: true,
      },
    });

    const reportB = buildUnifiedQualityReport({
      structural,
      files: SAMPLE_FILES,
      repairQueue: repair.items,
      repairInstruction: repair.instruction,
      dedupedCount: repair.dedupedCount,
      durationMs: 42,
      modules: {
        structural: true,
        semantic: false,
        visual: false,
        accessibility: true,
      },
    });

    assert.deepEqual(reportA.scores, reportB.scores);
    assert.equal(reportA.telemetry.scoreStabilityHash, reportB.telemetry.scoreStabilityHash);
    assert.ok(reportA.scores.overall >= 0 && reportA.scores.overall <= 100);
    assert.equal(reportA.trace.version, "qe-5.0");

    const dashboard = toQualityDashboardModel(reportA);
    assert.equal(dashboard.overallScore, reportA.scores.overall);
    assert.ok(dashboard.dimensions.length > 0);
    assert.equal(typeof dashboard.publishReady, "boolean");
  });

  it("produces stable telemetry hash for identical scores", () => {
    const scores = {
      build: 80,
      validation: 85,
      content: 78,
      seo: 76,
      accessibility: 82,
      ux: 79,
      ui: 81,
      overall: 80,
    };
    const telemetryA = createQualityTelemetry({
      durationMs: 10,
      repairQueue: [],
      dedupedCount: 0,
      scores,
    });
    const telemetryB = createQualityTelemetry({
      durationMs: 99,
      repairQueue: [],
      dedupedCount: 0,
      scores,
    });
    assert.equal(telemetryA.scoreStabilityHash, telemetryB.scoreStabilityHash);
  });
});

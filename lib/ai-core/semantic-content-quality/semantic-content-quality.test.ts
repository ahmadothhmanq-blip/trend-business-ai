import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { runSemanticContentQuality } from "@/lib/ai-core/semantic-content-quality/analyze";
import { buildSemanticRepairInstruction } from "@/lib/ai-core/semantic-content-quality/build-repair";
import { detectGenericCopy } from "@/lib/ai-core/semantic-content-quality/detectors/generic-copy";
import { detectCtaQuality } from "@/lib/ai-core/semantic-content-quality/detectors/cta-quality";
import { detectHeadingHierarchy } from "@/lib/ai-core/semantic-content-quality/detectors/heading-hierarchy";
import { computeSemanticQualityScores } from "@/lib/ai-core/semantic-content-quality/score";

const SAMPLE_FILES = [
  {
    path: "app/page.tsx",
    content: `
      export default function Page() {
        return (
          <main>
            <h1>Premium Furniture Showroom in Riyadh</h1>
            <h2>Handcrafted Living Collections</h2>
            <p>Discover premium sofas, dining sets, and bedroom furniture crafted for modern Saudi homes.</p>
            <button>Book Showroom Visit</button>
          </main>
        );
      }
    `,
  },
  {
    path: "app/layout.tsx",
    content: `
      export const metadata = {
        title: "Premium Furniture Showroom Riyadh",
        description: "Explore handcrafted furniture collections, showroom appointments, and delivery across Saudi Arabia.",
      };
      export default function Layout({ children }) { return <html><body>{children}</body></html>; }
    `,
  },
];

const GENERIC_FILES = [
  {
    path: "app/page.tsx",
    content: `
      export default function Page() {
        return (
          <main>
            <h1>Welcome to our website</h1>
            <p>We help businesses succeed with innovative solutions and world-class service.</p>
            <a href="#">Click here</a>
          </main>
        );
      }
    `,
  },
];

describe("semantic content quality detectors", () => {
  it("flags generic copy and weak CTAs", () => {
    const genericIssues = detectGenericCopy({
      files: GENERIC_FILES,
      industry: "furniture",
    });
    assert.ok(genericIssues.some((i) => i.dimension === "genericCopy"));

    const ctaIssues = detectCtaQuality({ files: GENERIC_FILES });
    assert.ok(ctaIssues.length > 0);
  });

  it("passes heading hierarchy for structured sample", () => {
    const issues = detectHeadingHierarchy({ files: SAMPLE_FILES });
    const errors = issues.filter((i) => i.severity === "error");
    assert.equal(errors.length, 0);
  });
});

describe("semantic content quality engine", () => {
  it("scores good furniture copy higher than generic filler", async () => {
    const good = await runSemanticContentQuality({
      files: SAMPLE_FILES,
      prompt: "luxury furniture showroom in Riyadh",
      language: "en",
      industryId: "furniture",
      industry: "furniture",
      brandName: "Riyadh Home",
      seoFocus: ["furniture", "showroom"],
      primaryCta: "Book Showroom Visit",
    });

    const weak = await runSemanticContentQuality({
      files: GENERIC_FILES,
      prompt: "luxury furniture showroom in Riyadh",
      language: "en",
      industryId: "furniture",
      industry: "furniture",
    });

    assert.ok(good.scores.overall > weak.scores.overall);
    assert.ok(weak.issues.length > good.issues.length);
  });

  it("produces deterministic scores for identical input", async () => {
    const params = {
      files: SAMPLE_FILES,
      prompt: "furniture showroom",
      industryId: "furniture",
    };
    const first = await runSemanticContentQuality(params);
    const second = await runSemanticContentQuality(params);
    assert.deepEqual(first.scores, second.scores);
    assert.equal(first.issues.length, second.issues.length);
  });

  it("builds repair instructions from issues", () => {
    const scores = computeSemanticQualityScores([
      {
        id: "cta-missing",
        dimension: "ctaQuality",
        severity: "error",
        message: "No CTA labels detected",
        repairHint: "Add a primary CTA",
      },
    ]);
    const instruction = buildSemanticRepairInstruction({
      passed: false,
      scores,
      issues: [
        {
          id: "cta-missing",
          dimension: "ctaQuality",
          severity: "error",
          message: "No CTA labels detected",
          repairHint: "Add a primary CTA",
        },
      ],
      weakSections: ["No CTA labels detected"],
      summary: "test",
    });
    assert.match(instruction, /semantic-quality/);
    assert.match(instruction, /CTA/);
  });
});

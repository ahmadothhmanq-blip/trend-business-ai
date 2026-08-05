import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import type { GeneratedProjectFile } from "@/lib/ai/types";
import {
  runWebsiteReview,
  applySelectedImprovements,
  analyzeWebsite,
  compareVersions,
  rollbackToVersion,
  listVersions,
  clearReviewSessions,
  groupByPriority,
  REVIEW_AREAS,
} from "@/lib/website/review-studio";

const sampleFiles: GeneratedProjectFile[] = [
  {
    path: "app/layout.tsx",
    content: `<html><body><div>{children}</div></body></html>`,
    language: "tsx",
  },
  {
    path: "app/page.tsx",
    content: `<div><p>Welcome to our site</p><img src="/hero.jpg" /></div>`,
    language: "tsx",
  },
  {
    path: "app/globals.css",
    content: `body { margin: 0; font-family: sans-serif; }`,
    language: "css",
  },
];

const improvedFiles: GeneratedProjectFile[] = [
  {
    path: "app/layout.tsx",
    content: `<html lang="en"><body><header><nav aria-label="Main"><a href="/">Home</a></nav></header><main>{children}</main><footer>© 2026</footer></body></html>`,
    language: "tsx",
  },
  {
    path: "app/page.tsx",
    content: `export const metadata = { title: "Acme", description: "Best platform" };
      <main><h1>Revenue Platform</h1><p>Transform your business today with our enterprise solution.</p>
      <button>Get Started</button><img src="/hero.jpg" alt="Dashboard" loading="lazy" /></main>`,
    language: "tsx",
  },
  {
    path: "app/globals.css",
    content: `:root { --primary: #0066ff; } body { margin: 0; } :focus-visible { outline: 2px solid var(--primary); }`,
    language: "css",
  },
];

afterEach(() => {
  clearReviewSessions();
});

describe("AI Website Review Studio — Phase 1", () => {
  it("exports review areas and constants", () => {
    assert.equal(REVIEW_AREAS.length, 13);
  });

  it("analyzes website structure", () => {
    const analysis = analyzeWebsite({ files: sampleFiles });
    assert.ok(analysis.dimensions.length === 10);
    assert.ok(analysis.fileCount === 3);
    assert.ok(analysis.pageCount >= 1);
  });

  it("runs full website review", async () => {
    const result = await runWebsiteReview({
      label: "Test Site",
      files: sampleFiles,
      language: "English",
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;

    assert.ok(result.review.overallScore >= 0);
    assert.ok(result.review.insights.overallReview.length > 0);
    assert.ok(result.review.insights.strengths.length >= 0);
    assert.ok(result.review.insights.businessInsights.length > 0);
    assert.ok(result.review.improvements.length > 0);
    assert.equal(result.meta.providerIndependent, true);
    assert.equal(result.versions.length, 1);
    assert.equal(result.currentVersion.versionNumber, 1);
  });

  it("categorizes improvements by priority", async () => {
    const result = await runWebsiteReview({ files: sampleFiles });
    assert.equal(result.ok, true);
    if (!result.ok) return;

    const groups = groupByPriority(result.review.improvements);
    assert.ok(groups.critical.length + groups.high.length + groups.medium.length > 0);
    for (const imp of result.review.improvements) {
      assert.ok(imp.impact.qualityGain >= 0);
      assert.ok(imp.impact.estimatedTimeMinutes > 0);
      assert.ok(imp.impact.estimatedRisk);
    }
  });

  it("applies deterministic improvements and creates version 2", async () => {
    const review = await runWebsiteReview({ files: sampleFiles });
    assert.equal(review.ok, true);
    if (!review.ok) return;

    const deterministic = review.review.improvements.filter(
      (i) => i.patchType === "deterministic",
    );
    assert.ok(deterministic.length > 0);

    const applied = await applySelectedImprovements({
      request: {
        sessionId: review.meta.sessionId,
        improvementIds: deterministic.slice(0, 2).map((i) => i.id),
      },
    });
    assert.equal(applied.ok, true);
    if (!applied.ok) return;

    assert.equal(applied.version.versionNumber, 2);
    assert.ok(applied.comparison.summary.includes("v1"));
    assert.ok(applied.appliedChanges.length > 0);
    assert.equal(listVersions(review.meta.sessionId).length, 2);
  });

  it("supports version rollback", async () => {
    const review = await runWebsiteReview({ files: sampleFiles });
    assert.equal(review.ok, true);
    if (!review.ok) return;

    const v1Id = review.currentVersion.id;
    const deterministic = review.review.improvements.filter((i) => i.patchType === "deterministic");

    await applySelectedImprovements({
      request: {
        sessionId: review.meta.sessionId,
        improvementIds: [deterministic[0].id],
      },
    });

    const rolled = rollbackToVersion(review.meta.sessionId, v1Id);
    assert.equal(rolled.versionNumber, 1);
  });

  it("compares before and after quality scores", async () => {
    const beforeReview = await runWebsiteReview({ files: sampleFiles });
    const afterReview = await runWebsiteReview({ files: improvedFiles });
    assert.equal(beforeReview.ok, true);
    assert.equal(afterReview.ok, true);
    if (!beforeReview.ok || !afterReview.ok) return;

    const comparison = compareVersions(beforeReview.currentVersion, afterReview.currentVersion);
    assert.ok(comparison.qualityDifference !== 0 || comparison.summary.length > 0);
    assert.ok("seoDifference" in comparison);
    assert.ok("accessibilityDifference" in comparison);
    assert.ok(afterReview.review.overallScore >= beforeReview.review.overallScore);
  });

  it("rejects targeted-regen without executor", async () => {
    const review = await runWebsiteReview({ files: sampleFiles });
    assert.equal(review.ok, true);
    if (!review.ok) return;

    const targeted = review.review.improvements.filter((i) => i.patchType === "targeted-regen");
    if (targeted.length === 0) return;

    const applied = await applySelectedImprovements({
      request: {
        sessionId: review.meta.sessionId,
        improvementIds: targeted.map((i) => i.id),
      },
    });
    assert.equal(applied.ok, false);
    if (applied.ok) return;
    assert.ok(applied.errors[0].includes("executor"));
  });

  it("fails on empty input", async () => {
    const result = await runWebsiteReview({ files: [] });
    assert.equal(result.ok, false);
  });

  it("is provider and framework independent", async () => {
    const result = await runWebsiteReview({ files: sampleFiles });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.meta.providerIndependent, true);
    assert.equal(result.meta.frameworkIndependent, true);
  });
});

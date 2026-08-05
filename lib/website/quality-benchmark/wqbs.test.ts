import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { GeneratedProjectFile } from "@/lib/ai/types";
import {
  runWebsiteQualityBenchmark,
  compareWebsiteQuality,
  extractArtifactSignals,
  evaluateAllCategories,
  WQBS_PASS_THRESHOLD,
  WQBS_CATEGORIES,
  WQBS_BENCHMARK_MODES,
} from "@/lib/website/quality-benchmark";

const strongWebsiteFiles: GeneratedProjectFile[] = [
  {
    path: "app/layout.tsx",
    content: `<html lang="en"><body><header><nav aria-label="Main"><a href="/">Home</a><a href="/pricing">Pricing</a></nav></header><main>{children}</main><footer>© 2026</footer></body></html>`,
    language: "tsx",
  },
  {
    path: "app/page.tsx",
    content: `
      export const metadata = { title: "Acme SaaS", description: "Enterprise platform" };
      export default function Page() {
        return (
          <main>
            <section><h1>Revenue Platform</h1><p>Transform your business with our enterprise SaaS solution trusted by leading companies worldwide.</p>
            <button>Get Started</button><button>Book Demo</button></section>
            <section><h2>Pricing</h2><p>Plans for every team</p></section>
            <section><h2>Testimonials</h2><p>Trusted by 500+ companies</p></section>
            <form><input aria-label="Email" /><button>Contact Us</button></form>
            <img src="/hero.jpg" alt="Dashboard" loading="lazy" />
          </main>
        );
      }
    `,
    language: "tsx",
  },
  {
    path: "app/globals.css",
    content: `
      :root { --color-primary: #0066ff; --spacing-md: 1rem; }
      body { font-family: 'Inter', sans-serif; margin: 0; }
      h1 { font-family: 'Inter', sans-serif; }
      :focus-visible { outline: 2px solid var(--color-primary); }
      @media (max-width: 768px) { .grid { flex-direction: column; } }
      @media (max-width: 1024px) { .container { padding: 1rem; } }
    `,
    language: "css",
  },
  {
    path: "app/about/page.tsx",
    content: `<main><h1>About</h1><p>We are a certified secure company with award-winning support.</p><a href="/">Back home</a></main>`,
    language: "tsx",
  },
];

const weakWebsiteFiles: GeneratedProjectFile[] = [
  {
    path: "app/page.tsx",
    content: `<div><p>Welcome</p><img src="/x.jpg" /></div>`,
    language: "tsx",
  },
];

describe("Website Quality Benchmark System (WQBS)", () => {
  it("exports constants and categories", () => {
    assert.equal(WQBS_CATEGORIES.length, 8);
    assert.equal(WQBS_BENCHMARK_MODES.length, 3);
    assert.ok(WQBS_PASS_THRESHOLD >= 60);
  });

  it("extracts artifact signals from files", () => {
    const signals = extractArtifactSignals(strongWebsiteFiles);
    assert.ok(signals.hasNav);
    assert.ok(signals.hasMain);
    assert.ok(signals.langAttribute);
    assert.ok(signals.ctaCount > 0);
    assert.ok(signals.wordCount > 50);
  });

  it("evaluates all 8 benchmark categories", () => {
    const signals = extractArtifactSignals(strongWebsiteFiles);
    const evaluations = evaluateAllCategories(signals);
    assert.equal(evaluations.length, 8);
    for (const cat of evaluations) {
      assert.ok(cat.score >= 0 && cat.score <= 100);
      assert.ok(cat.subDimensions.length > 0);
    }
  });

  it("runs full benchmark on strong website", async () => {
    const result = await runWebsiteQualityBenchmark({
      id: "strong-saas",
      label: "Strong SaaS",
      mode: "standard",
      files: strongWebsiteFiles,
      language: "English",
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;

    assert.ok(result.report.scores.overall >= 60);
    assert.equal(result.report.meta.providerIndependent, true);
    assert.equal(result.report.meta.frameworkIndependent, true);
    assert.ok(result.executiveSummary.headline.includes("/100"));
    assert.ok(result.technicalSummary.subDimensionBreakdown.length > 20);
    assert.ok(result.developerSummary.fixQueue.length >= 0);
    assert.equal(result.report.categories.length, 8);
  });

  it("scores weak website lower than strong website", async () => {
    const [strong, weak] = await Promise.all([
      runWebsiteQualityBenchmark({ files: strongWebsiteFiles, mode: "standard" }),
      runWebsiteQualityBenchmark({ files: weakWebsiteFiles, mode: "standard" }),
    ]);
    assert.equal(strong.ok, true);
    assert.equal(weak.ok, true);
    if (!strong.ok || !weak.ok) return;
    assert.ok(strong.report.scores.overall > weak.report.scores.overall);
  });

  it("quick mode evaluates subset of categories", async () => {
    const result = await runWebsiteQualityBenchmark({
      files: strongWebsiteFiles,
      mode: "quick",
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.report.categories.length, 4);
  });

  it("generates recommendations for weak dimensions", async () => {
    const result = await runWebsiteQualityBenchmark({
      files: weakWebsiteFiles,
      mode: "enterprise",
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.ok(result.report.recommendations.length > 0);
    assert.ok(result.report.recommendations[0].priority);
    assert.ok(result.report.recommendations[0].recommendation);
    assert.ok(result.report.recommendations[0].estimatedEffort);
  });

  it("compares generated vs reference website", async () => {
    const comparison = await compareWebsiteQuality({
      generated: { files: weakWebsiteFiles, mode: "standard" },
      reference: { files: strongWebsiteFiles, mode: "standard" },
      referenceLabel: "Reference SaaS",
    });
    assert.ok("overallGap" in comparison);
    if (!("overallGap" in comparison)) return;
    assert.ok(comparison.overallGap > 0);
    assert.ok(comparison.weaknesses.length > 0);
    assert.ok(comparison.qualityGap.includes("below"));
  });

  it("fails on empty input", async () => {
    const result = await runWebsiteQualityBenchmark({ files: [] });
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.ok(result.errors.length > 0);
  });

  it("is provider and framework independent", async () => {
    const result = await runWebsiteQualityBenchmark({ files: strongWebsiteFiles });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.report.meta.providerIndependent, true);
    assert.equal(result.report.meta.frameworkIndependent, true);
  });
});

/**
 * QE Phase 4 — Visual Design & UX benchmark.
 * Run: npx tsx scripts/benchmark-visual-design-quality.mjs
 */
import assert from "node:assert/strict";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { performance } from "node:perf_hooks";
import { runVisualDesignQuality } from "../lib/ai-core/visual-design-quality/analyze.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));

const PREMIUM = [
  {
    path: "app/globals.css",
    content:
      ":root { --color-primary: #123; --font-heading: 'Space Grotesk'; --section-y: 5rem; }",
  },
  {
    path: "components/layout/Header.tsx",
    content:
      '<header class="sticky top-0 backdrop-blur"><nav class="container mx-auto hidden md:flex gap-6"><a href="/">Home</a></nav><button class="md:hidden" aria-label="Menu">Menu</button></header>',
  },
  {
    path: "components/sections/Hero.tsx",
    content:
      '<section class="min-h-screen py-24 bg-cover"><div class="container max-w-5xl mx-auto"><h1 class="text-5xl font-[family-name:var(--font-heading)]">Studio</h1><p class="text-lg text-muted-foreground leading-relaxed">Crafted spaces.</p><button class="rounded-lg shadow-md">Book</button></div></section>',
  },
  {
    path: "app/page.tsx",
    content:
      'export default function Page(){return <main class="flex flex-col md:grid"><section class="py-20 gap-8"/></main>;}',
  },
];

const WEAK = [
  {
    path: "app/page.tsx",
    content: "<main><p>Hi</p><button>Go</button></main>",
  },
];

const startedAt = performance.now();
const premium = runVisualDesignQuality({ files: PREMIUM, brandName: "Studio" });
const weak = runVisualDesignQuality({ files: WEAK, brandName: "Studio" });

assert.ok(premium.scores.overall > weak.scores.overall);

const report = {
  phase: "QE-4",
  timestamp: new Date().toISOString(),
  totalLatencyMs: Math.round(performance.now() - startedAt),
  additionalTokenUsage: 0,
  llmCalls: 0,
  visualConsistencyDelta: premium.scores.crossPageConsistency - weak.scores.crossPageConsistency,
  responsiveQualityDelta: premium.scores.responsiveLayout - weak.scores.responsiveLayout,
  heroQualityDelta: premium.scores.heroQuality - weak.scores.heroQuality,
  navigationQualityDelta: premium.scores.navigationUx - weak.scores.navigationUx,
  ctaPlacementDelta: premium.scores.ctaPlacement - weak.scores.ctaPlacement,
  typographyScoreDelta: premium.scores.typographyHierarchy - weak.scores.typographyHierarchy,
  layoutScoreDelta: premium.scores.layout - weak.scores.layout,
  uxScoreDelta: premium.scores.ux - weak.scores.ux,
  overallDelta: premium.scores.overall - weak.scores.overall,
  premium,
  weak,
};

const outDir = join(__dirname, "benchmark-results");
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, `benchmark-visual-design-quality-${Date.now()}.json`);
writeFileSync(outPath, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
console.log(`Wrote ${outPath}`);

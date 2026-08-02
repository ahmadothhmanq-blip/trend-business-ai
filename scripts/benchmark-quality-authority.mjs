/**
 * QE Phase 2 Q1 — Quality Authority micro-benchmark.
 * Run: npx tsx scripts/benchmark-quality-authority.mjs
 */
import assert from "node:assert/strict";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  classifyValidationGateIssues,
  computeUnifiedQualityScores,
  verifyPostRepair,
} from "../lib/ai-core/quality-authority/index.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));

const fixtures = [
  {
    name: "clean-build",
    issues: [],
    expectedBlockers: 0,
    expectedWarnings: 0,
  },
  {
    name: "missing-file-blocker",
    issues: ["Missing required production file: app/page.tsx"],
    expectedBlockers: 1,
    expectedWarnings: 0,
  },
  {
    name: "mixed-blockers-warnings",
    issues: [
      'components/Hero.tsx: missing project import "@/components/ui/button" (resolved candidates not in tree).',
      "components/Hero.tsx: Generated file contains placeholder or incomplete content.",
      'Duplicate basename "Card.tsx" in components/a/Card.tsx and components/b/Card.tsx.',
    ],
    expectedBlockers: 1,
    expectedWarnings: 2,
  },
];

let gatePass = 0;
let falsePositiveBlock = 0;
let falseNegativeBlock = 0;

for (const fixture of fixtures) {
  const gate = classifyValidationGateIssues(fixture.issues);
  if (
    gate.blockers.length === fixture.expectedBlockers &&
    gate.warnings.length === fixture.expectedWarnings
  ) {
    gatePass += 1;
  } else if (gate.blockers.length > fixture.expectedBlockers) {
    falsePositiveBlock += 1;
  } else {
    falseNegativeBlock += 1;
  }
}

const repairScenarios = [
  {
    before: [
      "Missing required production file: app/page.tsx",
      'components/Hero.tsx: missing project import "@/components/ui/button" (resolved candidates not in tree).',
    ],
    after: [
      "components/Hero.tsx: Generated file contains placeholder or incomplete content.",
    ],
    expectAccepted: true,
  },
  {
    before: [
      "components/Hero.tsx: Generated file contains placeholder or incomplete content.",
    ],
    after: [
      'components/Hero.tsx: missing project import "@/components/ui/button" (resolved candidates not in tree).',
    ],
    expectAccepted: false,
  },
];

let repairPass = 0;
for (const scenario of repairScenarios) {
  const result = verifyPostRepair({
    beforeIssues: scenario.before,
    afterIssues: scenario.after,
  });
  if (result.accepted === scenario.expectAccepted) repairPass += 1;
}

const scoreSamples = Array.from({ length: 20 }, (_, index) =>
  computeUnifiedQualityScores({
    validationIssues: index % 3 === 0 ? [] : [`warning-${index}`],
    qualityReport: { passed: true, seoReadinessScore: 70 + index },
    optimizationScores: { design: 75, ux: 74, seo: 72, performance: 70, overall: 74 },
    finalQualityScores: {
      design: 76,
      ux: 75,
      seo: 73,
      conversion: 72,
      performance: 71,
      overall: 74,
    },
  }),
);

const overallScores = scoreSamples.map((sample) => sample.overall);
const scoreSpread =
  Math.max(...overallScores) - Math.min(...overallScores);
const scoreConsistent = scoreSpread < 40;

const report = {
  phase: "QE-2-Q1",
  timestamp: new Date().toISOString(),
  gateClassification: {
    fixtures: fixtures.length,
    pass: gatePass,
    falsePositiveBlock,
    falseNegativeBlock,
    successRate: gatePass / fixtures.length,
  },
  postRepairVerification: {
    scenarios: repairScenarios.length,
    pass: repairPass,
    successRate: repairPass / repairScenarios.length,
  },
  scoreConsistency: {
    samples: scoreSamples.length,
    minOverall: Math.min(...overallScores),
    maxOverall: Math.max(...overallScores),
    spread: scoreSpread,
    consistent: scoreConsistent,
  },
};

assert.equal(gatePass, fixtures.length);
assert.equal(repairPass, repairScenarios.length);
assert.equal(scoreConsistent, true);

const outDir = join(__dirname, "benchmark-results");
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, `benchmark-quality-authority-${Date.now()}.json`);
writeFileSync(outPath, JSON.stringify(report, null, 2));

console.log(JSON.stringify(report, null, 2));
console.log(`Wrote ${outPath}`);

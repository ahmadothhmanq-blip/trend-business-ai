import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isPaidWebsitePlan } from "@/lib/ai-core/quality-authority/billing";
import {
  classifyValidationGateIssues,
  evaluateProjectQualityGate,
} from "@/lib/ai-core/quality-authority/gates";
import { computeUnifiedQualityScores } from "@/lib/ai-core/quality-authority/score";
import { verifyPostRepair } from "@/lib/ai-core/quality-authority/verification";

describe("quality-authority gates", () => {
  it("classifies missing files and broken imports as blockers", () => {
    const result = classifyValidationGateIssues([
      "Missing required production file: app/page.tsx",
      'components/Hero.tsx: missing project import "@/components/ui/button" (resolved candidates not in tree).',
      "components/Hero.tsx: Generated file contains placeholder or incomplete content.",
    ]);

    assert.equal(result.blockers.length, 2);
    assert.equal(result.warnings.length, 1);
    assert.equal(result.passed, false);
  });

  it("treats duplicate basenames as warnings", () => {
    const result = evaluateProjectQualityGate([
      'Duplicate basename "Card.tsx" in components/a/Card.tsx and components/b/Card.tsx.',
    ]);
    assert.equal(result.passed, true);
    assert.equal(result.warnings.length, 1);
  });
});

describe("quality-authority verification", () => {
  it("accepts repair when blockers decrease", () => {
    const result = verifyPostRepair({
      beforeIssues: [
        "Missing required production file: app/page.tsx",
        "components/Hero.tsx: missing project import \"@/components/ui/button\" (resolved candidates not in tree).",
      ],
      afterIssues: [
        "components/Hero.tsx: Generated file contains placeholder or incomplete content.",
      ],
    });

    assert.equal(result.accepted, true);
    assert.equal(result.rolledBack, false);
  });

  it("rejects repair when new blockers appear", () => {
    const result = verifyPostRepair({
      beforeIssues: [
        "components/Hero.tsx: Generated file contains placeholder or incomplete content.",
      ],
      afterIssues: [
        'components/Hero.tsx: missing project import "@/components/ui/button" (resolved candidates not in tree).',
      ],
    });

    assert.equal(result.accepted, false);
    assert.equal(result.rolledBack, true);
    assert.ok(result.regressionIssues.length > 0);
  });
});

describe("quality-authority scores", () => {
  it("returns a single consistent overall score", () => {
    const scores = computeUnifiedQualityScores({
      validationIssues: [],
      qualityReport: { passed: true, seoReadinessScore: 80 },
      optimizationScores: { design: 85, ux: 82, seo: 78, performance: 74, overall: 80 },
      finalQualityScores: {
        design: 86,
        ux: 84,
        seo: 82,
        conversion: 79,
        performance: 76,
        overall: 83,
      },
    });

    assert.ok(scores.overall >= 0 && scores.overall <= 100);
    assert.equal(typeof scores.build, "number");
    assert.equal(typeof scores.validation, "number");
    assert.equal(typeof scores.seo, "number");
    assert.equal(typeof scores.accessibility, "number");
  });
});

describe("quality-authority billing", () => {
  it("detects paid plans", () => {
    assert.equal(isPaidWebsitePlan("pro"), true);
    assert.equal(isPaidWebsitePlan("business"), true);
    assert.equal(isPaidWebsitePlan("free"), false);
    assert.equal(isPaidWebsitePlan(undefined), false);
  });
});

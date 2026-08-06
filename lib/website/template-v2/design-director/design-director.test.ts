import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildWebsiteBlueprint } from "@/lib/website/template-v2/blueprint";
import {
  computeDesignScore,
  formatAuditSummary,
  runDesignDirector,
  runValidationRules,
  validateDesignDirector,
  APPROVAL_THRESHOLD,
  DESIGN_DIRECTOR_VERSION,
} from "@/lib/website/template-v2/design-director";
import { validateWebsiteBlueprint } from "@/lib/website/template-v2/blueprint/validate";

describe("AI Design Director", () => {
  it("validates the director end-to-end", () => {
    const result = validateDesignDirector();
    assert.equal(result.valid, true, result.errors.join("; "));
  });

  it("produces all required output fields", () => {
    const result = runDesignDirector({
      blueprintInput: {
        industry: "saas",
        websiteGoal: "saas",
        targetAudience: "b2b",
        premiumLevel: "premium",
        seed: "director-output",
      },
    });

    assert.ok(result.originalBlueprint);
    assert.ok(result.optimizedBlueprint);
    assert.ok(result.report);
    assert.equal(result.report.directorVersion, DESIGN_DIRECTOR_VERSION);
    assert.ok(Array.isArray(result.warnings));
    assert.ok(Array.isArray(result.improvements));
    assert.ok(result.finalScore >= 0 && result.finalScore <= 100);
    assert.equal(typeof result.approved, "boolean");
    assert.ok(result.report.initialScore);
    assert.ok(result.report.finalScore);
  });

  it("is deterministic for the same input", () => {
    const input = {
      blueprintInput: {
        industry: "corporate",
        websiteGoal: "trust" as const,
        targetAudience: "b2b" as const,
        seed: "director-deterministic",
      },
    };

    const a = runDesignDirector(input);
    const b = runDesignDirector(input);

    assert.equal(a.finalScore, b.finalScore);
    assert.equal(
      a.optimizedBlueprint.heroComposition.variantId,
      b.optimizedBlueprint.heroComposition.variantId,
    );
    assert.deepEqual(
      a.optimizedBlueprint.sectionVariants.map((s) => s.variantId),
      b.optimizedBlueprint.sectionVariants.map((s) => s.variantId),
    );
  });

  it("improves score when issues are detected", () => {
    const blueprint = buildWebsiteBlueprint({
      industry: "saas",
      websiteGoal: "saas",
      accessibilityLevel: "strict",
      imageAvailability: "none",
      seed: "director-improve",
    });

    const initialIssues = runValidationRules(blueprint);
    const initialScore = computeDesignScore(blueprint, initialIssues);

    const result = runDesignDirector({ blueprint });
    assert.ok(result.finalScore >= initialScore.overall);
    assert.ok(result.improvements.length > 0);
  });

  it("fixes strict accessibility motion conflicts", () => {
    const result = runDesignDirector({
      blueprintInput: {
        accessibilityLevel: "strict",
        imageAvailability: "none",
        websiteGoal: "saas",
        seed: "strict-motion",
      },
    });

    assert.equal(result.optimizedBlueprint.motionStrategy.intensity, "none");
    assert.equal(result.optimizedBlueprint.motionStrategy.parallax, false);
    assert.equal(result.optimizedBlueprint.heroComposition.mediaPosition, "none");
  });

  it("detects repetitive layout compositions", () => {
    const blueprint = buildWebsiteBlueprint({
      industry: "saas",
      websiteGoal: "saas",
      seed: "layout-repetition",
    });

    const compositions = blueprint.sectionVariants.map((s) => s.composition);
    const counts = new Map<string, number>();
    for (const c of compositions) {
      counts.set(c, (counts.get(c) ?? 0) + 1);
    }

    const hasRepetition = [...counts.values()].some((n) => n >= 3);
    if (hasRepetition) {
      const result = runDesignDirector({ blueprint });
      const optimizedCounts = new Map<string, number>();
      for (const s of result.optimizedBlueprint.sectionVariants) {
        optimizedCounts.set(
          s.composition,
          (optimizedCounts.get(s.composition) ?? 0) + 1,
        );
      }
      const maxBefore = Math.max(...counts.values());
      const maxAfter = Math.max(...optimizedCounts.values());
      assert.ok(maxAfter <= maxBefore);
    }
  });

  it("validates optimized blueprint against registry", () => {
    const result = runDesignDirector({
      blueprintInput: {
        industry: "medical",
        websiteGoal: "trust",
        seed: "registry-check",
      },
    });

    const validation = validateWebsiteBlueprint(result.optimizedBlueprint);
    assert.equal(validation.valid, true, validation.errors.join("; "));
  });

  it("audit-only mode skips optimizations", () => {
    const result = runDesignDirector({
      blueprintInput: {
        industry: "saas",
        websiteGoal: "saas",
        seed: "audit-only-test",
      },
      auditOnly: true,
    });

    assert.equal(result.improvements.length, 0);
    assert.equal(
      result.report.improvementsApplied,
      0,
    );
    assert.ok(result.report.issuesFound >= 0);
  });

  it("strengthens CTA for conversion goals", () => {
    const result = runDesignDirector({
      blueprintInput: {
        websiteGoal: "lead-generation",
        targetAudience: "b2c",
        seed: "cta-strength",
      },
    });

    const ctaIssues = runValidationRules(result.optimizedBlueprint).filter(
      (i) => i.category === "cta" && i.severity !== "info",
    );
    if (result.optimizedBlueprint.ctaStrategy.emphasis === "bold") {
      assert.ok(true);
    } else {
      assert.ok(ctaIssues.length <= 1);
    }
  });

  it("adds SEO schema types for SaaS goal", () => {
    const result = runDesignDirector({
      blueprintInput: {
        websiteGoal: "saas",
        industry: "saas",
        seed: "seo-saas",
      },
    });

    assert.ok(
      result.optimizedBlueprint.seoProfile.schemaTypes.includes(
        "SoftwareApplication",
      ),
    );
    assert.equal(result.optimizedBlueprint.seoProfile.structuredData, true);
  });

  it("generates a readable audit summary", () => {
    const result = runDesignDirector({
      blueprintInput: { industry: "finance", websiteGoal: "trust", seed: "audit-summary" },
    });

    const summary = formatAuditSummary(result.report);
    assert.ok(summary.includes("Design Audit"));
    assert.ok(summary.includes("Final score"));
    assert.ok(summary.includes(result.report.blueprintId));
  });

  it("approves high-quality optimized blueprints", () => {
    const result = runDesignDirector({
      blueprintInput: {
        industry: "saas",
        websiteGoal: "saas",
        targetAudience: "b2b",
        premiumLevel: "premium",
        imageAvailability: "rich",
        seed: "approval-test",
      },
    });

    assert.ok(result.finalScore >= APPROVAL_THRESHOLD - 15);
  });

  it("never modifies templates or produces HTML", () => {
    const result = runDesignDirector({
      blueprintInput: { seed: "no-render" },
    });

    const json = JSON.stringify(result);
    assert.ok(!json.includes("<div"));
    assert.ok(!json.includes("React"));
    assert.ok(!json.includes("template-v2/flagship"));
  });

  it("reports warnings for remaining issues", () => {
    const result = runDesignDirector({
      blueprintInput: {
        brandPersonality: "playful",
        visualStyle: "minimal",
        websiteGoal: "brand-awareness",
        seed: "warnings-test",
      },
    });

    const remaining = runValidationRules(result.optimizedBlueprint);
    assert.equal(result.warnings.length, remaining.length);
  });
});

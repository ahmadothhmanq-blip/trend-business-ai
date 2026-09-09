import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  clearAnalyzeAppDescriptionCache,
  heuristicAppDescriptionInsight,
  isDescriptionReadyForTags,
  normalizeAppDescriptionInsight,
  normalizeAppTags,
  analyzeAppDescription,
} from "@/lib/webapp/suggest-app-tags";

describe("analyzeAppDescription", () => {
  it("normalizes and caps tags at 3 unique labels", () => {
    assert.deepEqual(
      normalizeAppTags(["marketplace", "Marketplace", "Fleet Tracking!", "CRM", "Extra"]),
      ["Marketplace", "Fleet Tracking", "CRM"],
    );
  });

  it("requires a minimum description length", () => {
    assert.equal(isDescriptionReadyForTags("short"), false);
    assert.equal(
      isDescriptionReadyForTags("A booking app for boutique fitness studios"),
      true,
    );
  });

  it("heuristics infer type, industry, complexity, build time, and tags", () => {
    const insight = heuristicAppDescriptionInsight(
      "A two-sided marketplace connecting local chefs with customers for private dining experiences with payments and role-based access.",
    );
    assert.equal(insight.appType, "Marketplace");
    assert.equal(insight.industry, "Hospitality");
    assert.ok(["Low", "Medium", "High"].includes(insight.complexity));
    assert.match(insight.estimatedBuildTime, /min/);
    assert.ok(insight.tags.includes("Marketplace"));
    assert.ok(insight.tags.length <= 3);
  });

  it("localizes heuristic insight for Arabic descriptions", () => {
    const insight = heuristicAppDescriptionInsight(
      "تطبيق حجوزات لمواعيد عيادة طبية مع تقويم وإشعارات للمرضى",
    );
    assert.equal(insight.appType, "نظام حجوزات");
    assert.equal(insight.industry, "رعاية صحية");
    assert.ok(["منخفض", "متوسط", "مرتفع"].includes(insight.complexity));
    assert.match(insight.estimatedBuildTime, /دقائق|دقيقة/);
    assert.ok(insight.tags.some((tag) => /حجز|صحة|لوحة/.test(tag)));
  });

  it("localizes when preferred language is Arabic", () => {
    const insight = heuristicAppDescriptionInsight(
      "A booking system for dental clinics with appointments and reminders",
      { language: "Arabic" },
    );
    assert.equal(insight.appType, "نظام حجوزات");
    assert.equal(insight.industry, "رعاية صحية");
    assert.ok(["منخفض", "متوسط", "مرتفع"].includes(insight.complexity));
  });

  it("normalizes partial AI payloads with heuristic fallbacks", () => {
    const insight = normalizeAppDescriptionInsight(
      { appType: "crm", complexity: "high", tags: ["Pipeline"] },
      "A CRM for freelancers to manage leads and invoices",
    );
    assert.equal(insight.appType, "CRM");
    assert.equal(insight.complexity, "High");
    assert.equal(insight.estimatedBuildTime, "~15–25 min");
    assert.ok(insight.tags.includes("Pipeline"));
    assert.ok(insight.industry.length > 0);
  });

  it("caches repeated analyses in-process", async () => {
    clearAnalyzeAppDescriptionCache();
    const description =
      "An operations dashboard for a logistics company to track shipments and drivers.";
    const first = await analyzeAppDescription(description);
    const second = await analyzeAppDescription(description);
    assert.deepEqual(
      {
        appType: first.appType,
        industry: first.industry,
        complexity: first.complexity,
        tags: first.tags,
      },
      {
        appType: second.appType,
        industry: second.industry,
        complexity: second.complexity,
        tags: second.tags,
      },
    );
    assert.equal(second.cached, true);
    assert.ok(first.tags.length <= 3);
  });

  it("returns empty insight for tiny descriptions", async () => {
    clearAnalyzeAppDescriptionCache();
    const result = await analyzeAppDescription("Hi");
    assert.deepEqual(result.tags, []);
    assert.equal(result.appType, "");
  });
});

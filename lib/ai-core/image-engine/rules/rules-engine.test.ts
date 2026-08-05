import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildSlotsFromProfile } from "@/lib/ai-core/image-engine/profile-engine";
import { listImageProfiles } from "@/lib/ai-core/image-engine/profiles";
import { emptySlotMap } from "@/lib/ai-core/image-engine/slots";
import {
  detectImageContext,
  getIndustrySlotRules,
  isWrongIndustryUrl,
  resolveSlotImageSource,
  runIndustryImageRulesEngine,
  validateImageCandidate,
} from "@/lib/ai-core/image-engine/rules";

describe("Industry Image Rules Engine — detection", () => {
  it("detects restaurant industry and visual style", () => {
    const ctx = detectImageContext({
      industry: "restaurant",
      subcategory: "fine-dining",
      visualStyle: "warm editorial",
    });
    assert.equal(ctx.industryId, "restaurant");
    assert.ok(ctx.visualStyle.length > 0);
    assert.ok(ctx.confidence >= 0.9);
  });

  it("detects hotel from hospitality alias", () => {
    const ctx = detectImageContext({ industry: "hospitality" });
    assert.equal(ctx.industryId, "hotel");
  });

  it("lists rules for all required industries", () => {
    const required = [
      "fashion",
      "gaming",
      "restaurant",
      "medical",
      "hotel",
      "real-estate",
      "finance",
      "education",
      "ecommerce",
      "saas",
      "corporate",
      "automotive",
      "beauty",
      "fitness",
      "law",
      "construction",
      "travel",
      "creative-agency",
    ];
    const profileIds = new Set(listImageProfiles().map((p) => p.id));
    for (const id of required) {
      assert.ok(profileIds.has(id), `missing industry profile: ${id}`);
      const rules = getIndustrySlotRules(id);
      assert.ok(rules.slots.hero.allowedSubjects.length > 0);
      assert.ok(rules.slots.cta.forbiddenSubjects.length > 0);
    }
  });
});

describe("Industry Image Rules Engine — priority", () => {
  it("resolves user upload over AI, library, and stock", () => {
    const resolved = resolveSlotImageSource({
      kind: "hero",
      index: 0,
      userUrl: "https://example.com/user.jpg",
      aiUrl: "https://example.com/ai.jpg",
      libraryUrl: "https://example.com/lib.jpg",
      stockUrl: "https://example.com/stock.jpg",
    });
    assert.equal(resolved?.sourceTier, "user");
    assert.equal(resolved?.url, "https://example.com/user.jpg");
  });

  it("falls through to library when user and AI absent", () => {
    const resolved = resolveSlotImageSource({
      kind: "hero",
      index: 0,
      libraryUrl: "https://example.com/lib.jpg",
      stockUrl: "https://example.com/stock.jpg",
    });
    assert.equal(resolved?.sourceTier, "library");
  });
});

describe("Industry Image Rules Engine — validation", () => {
  it("rejects placeholder images", () => {
    const result = validateImageCandidate({
      candidate: { url: "https://via.placeholder.com/800x600" },
      kind: "hero",
      industryId: "medical",
      subcategory: null,
      usedUrls: new Set(),
    });
    assert.equal(result.accepted, false);
    assert.equal(result.rejection?.category, "low-quality");
  });

  it("accepts user override regardless of industry mismatch", () => {
    const result = validateImageCandidate({
      candidate: {
        url: "https://via.placeholder.com/800x600",
        isUserOverride: true,
      },
      kind: "hero",
      industryId: "medical",
      subcategory: null,
      usedUrls: new Set(),
      isUserOverride: true,
    });
    assert.equal(result.accepted, true);
  });

  it("rejects duplicate URLs", () => {
    const url = "https://images.unsplash.com/photo-test?w=1600";
    const result = validateImageCandidate({
      candidate: { url },
      kind: "gallery",
      industryId: "finance",
      subcategory: null,
      usedUrls: new Set([url]),
    });
    assert.equal(result.accepted, false);
    assert.equal(result.rejection?.category, "duplicate");
  });

  it("prevents cross-industry exclusive URLs", () => {
    const { slots } = buildSlotsFromProfile({ industry: "restaurant" });
    const medicalUrl = buildSlotsFromProfile({ industry: "medical" }).slots.hero[0]!.url;
    if (isWrongIndustryUrl(medicalUrl, "restaurant")) {
      const result = validateImageCandidate({
        candidate: { url: medicalUrl },
        kind: "hero",
        industryId: "restaurant",
        subcategory: null,
        usedUrls: new Set(),
      });
      assert.equal(result.accepted, false);
    }
    assert.ok(slots.hero.length >= 1);
  });
});

describe("Industry Image Rules Engine — full run", () => {
  it("produces validation report for medical industry", () => {
    const { slots } = buildSlotsFromProfile(
      { industry: "medical" },
      { projectSeed: "rules-test-medical" },
    );
    const report = runIndustryImageRulesEngine({
      slots,
      ctx: { industry: "medical" },
    });
    assert.equal(report.detected.industryId, "medical");
    assert.ok(report.selected.length > 0);
    assert.ok(report.profileId, "medical");
    assert.ok(report.slots.hero.length >= 1);
    assert.ok(report.slotCoverage.hero?.passed);
  });

  it("repairs wrong-industry hero for restaurant", () => {
    const slots = emptySlotMap();
    const medicalHero = buildSlotsFromProfile({ industry: "medical" }).slots.hero[0]!;
    slots.hero.push({
      ...medicalHero,
      kind: "hero",
      industryId: "medical",
    });

    const report = runIndustryImageRulesEngine({
      slots,
      ctx: { industry: "restaurant" },
    });
    assert.equal(report.detected.industryId, "restaurant");
    assert.ok(report.replaced >= 1);
    assert.ok(report.slots.hero[0]!.url.includes("unsplash.com"));
  });
});

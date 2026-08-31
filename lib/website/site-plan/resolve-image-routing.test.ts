import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveImageRoutingFromContext } from "@/lib/website/site-plan/resolve-image-routing";
import { resolvePremiumStockUrl } from "@/lib/ai-core/image-engine/stock";

describe("resolveImageRoutingFromContext", () => {
  it("routes Arabic mobile retail prompt to electronics-retail", () => {
    const routing = resolveImageRoutingFromContext({
      prompt: "موقع لشركة موبايل بيع جوالات وإصلاح",
    });
    assert.equal(routing.archetypeId, "electronics-retail");
    assert.equal(routing.routingIndustryId, "electronics-retail");
  });

  it("routes English phone store prompt to electronics-retail", () => {
    const routing = resolveImageRoutingFromContext({
      prompt: "Mobile phone store with repair and trade-in",
    });
    assert.equal(routing.archetypeId, "electronics-retail");
    assert.equal(routing.routingIndustryId, "electronics-retail");
  });

  it("keeps mobile app landing separate from phone retail", () => {
    const routing = resolveImageRoutingFromContext({
      prompt: "Landing page for a fitness mobile app",
    });
    assert.equal(routing.archetypeId, "mobile-app-landing");
    assert.equal(routing.routingIndustryId, "technology");
  });

  it("routes Arabic clothing company to fashion-retail stock", () => {
    const routing = resolveImageRoutingFromContext({
      prompt: "شركة ملابس نسائية وأزياء عصرية في جدة",
    });
    assert.equal(routing.archetypeId, "fashion-retail");
    assert.equal(routing.routingIndustryId, "fashion");
  });

  it("routes Arabic furniture company to furniture stock", () => {
    const routing = resolveImageRoutingFromContext({
      prompt: "شركة مفروشات وبيع أثاث منزلي وغرف نوم في الرياض",
    });
    assert.equal(routing.routingIndustryId, "furniture");
    assert.match(routing.industryLabel, /Furniture/i);
  });

  it("prefers explicit automotive industryId over generic business fallback", () => {
    const routing = resolveImageRoutingFromContext({
      prompt: "General business website",
      industryId: "automotive",
      businessIndustry: "automotive",
    });
    assert.equal(routing.routingIndustryId, "automotive");
    assert.match(routing.industryLabel, /Automotive/i);
  });

  it("routes car company prompt to automotive stock", () => {
    const routing = resolveImageRoutingFromContext({
      prompt: "Create a website for a car company called Apex Motors",
    });
    assert.equal(routing.routingIndustryId, "automotive");
  });

  it("auto-detects law firm without manual industry table", () => {
    const routing = resolveImageRoutingFromContext({
      prompt: "Law firm website for corporate litigation and legal advisory",
    });
    assert.equal(routing.routingIndustryId, "law");
  });

  it("auto-detects gym fitness without manual industry table", () => {
    const routing = resolveImageRoutingFromContext({
      prompt: "Gym and personal training studio in Dubai",
    });
    assert.notEqual(routing.routingIndustryId, "business");
  });

  it("auto-detects Arabic law firm without manual industry table", () => {
    const routing = resolveImageRoutingFromContext({
      prompt: "موقع لمكتب محاماة متخصص في القضايا التجارية والاستشارات القانونية",
    });
    assert.equal(routing.routingIndustryId, "law");
  });
});

describe("resolvePremiumStockUrl electronics-retail", () => {
  it("returns smartphone photography for electronics retail hero", () => {
    const url = resolvePremiumStockUrl({
      industry: "business",
      routingIndustryId: "electronics-retail",
      role: "hero",
      seed: "hero",
    });
    assert.match(url, /images\.unsplash\.com\/photo-/);
    assert.ok(
      [
        "photo-1511707171634-5f897ff02aa9",
        "photo-1592750475338-74b7b21085ab",
      ].some((id) => url.includes(id)),
    );
    assert.match(url, /w=2400/);
  });
});

describe("resolvePremiumStockUrl fashion", () => {
  it("returns fashion photography for clothing retail hero", () => {
    const url = resolvePremiumStockUrl({
      industry: "fashion-retail",
      routingIndustryId: "fashion",
      role: "hero",
      seed: "hero",
    });
    assert.ok(
      [
        "photo-1515372039744-b8f02a3ae446",
        "photo-1515886657613-9f3515b0c78f",
        "photo-1483985988355-763728e1935b",
      ].some((id) => url.includes(id)),
    );
    assert.doesNotMatch(url, /photo-1511707171634/);
  });
});

describe("resolvePremiumStockUrl automotive", () => {
  it("returns vehicle photography for automotive hero", () => {
    const url = resolvePremiumStockUrl({
      industry: "business",
      routingIndustryId: "automotive",
      role: "hero",
      seed: "hero",
    });
    assert.match(url, /images\.unsplash\.com\/photo-/);
    assert.doesNotMatch(url, /photo-1497366811353/);
  });
});

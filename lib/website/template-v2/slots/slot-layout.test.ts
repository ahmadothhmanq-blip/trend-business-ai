import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ctaRowAlignClass,
  hasSlotImage,
  heroBleedSectionClass,
  heroEmptyCopyClass,
  splitSectionGridClass,
} from "@/lib/website/template-v2/slots/slot-layout";
import { resolveSlotImageStrict } from "@/lib/website/template-v2/slots/slot-utils";

describe("slot-layout", () => {
  it("hasSlotImage is true when preferred URL is set", () => {
    assert.equal(hasSlotImage("hero", 0, "https://cdn.example/hero.jpg"), true);
  });

  it("hasSlotImage is false when preferred is whitespace-only", () => {
    assert.equal(hasSlotImage("hero", 0, "   "), Boolean(resolveSlotImageStrict("hero", 0, "   ")));
  });

  it("splitSectionGridClass keeps asymmetric split profile without visual", () => {
    assert.match(splitSectionGridClass(false, "gap-12", "split-asymmetric"), /df-hero-split-empty/);
    assert.doesNotMatch(splitSectionGridClass(false, "gap-12", "split-asymmetric"), /df-hero-editorial/);
    assert.match(splitSectionGridClass(true), /lg:grid-cols-2/);
  });

  it("splitSectionGridClass uses trust profile for medical heroes", () => {
    assert.match(splitSectionGridClass(false, "gap-10", "trust-authority"), /df-hero-trust-empty/);
  });

  it("heroBleedSectionClass uses immersive bleed profile without visual", () => {
    assert.match(heroBleedSectionClass(false), /df-hero-bleed-empty-section/);
    assert.match(heroBleedSectionClass(true), /min-h-\[100svh\]/);
  });

  it("heroEmptyCopyClass is left-aligned for sector profiles", () => {
    assert.match(heroEmptyCopyClass(false, "split-asymmetric"), /df-hero-split-empty-copy/);
    assert.match(heroEmptyCopyClass(false, "bleed-immersive"), /df-hero-bleed-empty-copy/);
    assert.equal(heroEmptyCopyClass(true, "split-asymmetric"), "");
  });

  it("ctaRowAlignClass preserves sector alignment without centering", () => {
    assert.equal(ctaRowAlignClass(false, "mt-8"), "mt-8");
    assert.equal(ctaRowAlignClass(true, "mt-8"), "mt-8");
  });
});

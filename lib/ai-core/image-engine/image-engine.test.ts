import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildSlotsFromProfile } from "@/lib/ai-core/image-engine/profile-engine";
import { resolveImageProfile, listImageProfiles } from "@/lib/ai-core/image-engine/profiles";
import { flattenSlotUrls } from "@/lib/ai-core/image-engine/slots";
import { validateAndRepairSlots } from "@/lib/ai-core/image-engine/slot-validator";
import { resolveSlotImage, slotImages } from "@/lib/site-images";

describe("Image Engine — industry profiles", () => {
  it("resolves restaurant industry profile", () => {
    const resolved = resolveImageProfile({ industry: "restaurant" });
    assert.equal(resolved.profile.id, "restaurant");
    assert.ok(resolved.confidence >= 0.9);
  });

  it("resolves hotel from hospitality alias", () => {
    const resolved = resolveImageProfile({ industry: "hospitality" });
    assert.equal(resolved.profile.id, "hotel");
  });

  it("lists all required industries", () => {
    const ids = new Set(listImageProfiles().map((p) => p.id));
    for (const id of [
      "gaming",
      "restaurant",
      "medical",
      "hotel",
      "finance",
      "real-estate",
      "education",
      "creative-agency",
      "ecommerce",
      "saas",
      "corporate",
      "automotive",
      "law",
      "beauty",
      "fitness",
      "construction",
      "travel",
      "fashion",
    ]) {
      assert.ok(ids.has(id), `missing profile: ${id}`);
    }
  });
});

describe("Image Engine — semantic slots", () => {
  it("builds unique slot URLs per industry", () => {
    const { slots, usedUrls } = buildSlotsFromProfile(
      { industry: "medical" },
      { projectSeed: "test-medical" },
    );
    assert.ok(slots.hero.length >= 1);
    assert.ok(slots.gallery.length >= 12);
    const flat = flattenSlotUrls(slots);
    assert.equal(flat.length, usedUrls.length);
    assert.equal(new Set(usedUrls).size, usedUrls.length);
  });

  it("validates and repairs duplicate slots", () => {
    const { slots, profileId } = buildSlotsFromProfile({ industry: "finance" });
    const profile = resolveImageProfile({ industry: "finance" }).profile;
    slots.hero.push({ ...slots.hero[0]!, id: "hero-dup" });
    const report = validateAndRepairSlots(slots, profile);
    assert.ok(report.repairs >= 1);
    assert.ok(report.slots.hero.length >= 1);
    assert.notEqual(profileId, "");
  });

  it("exposes resolveSlotImage from site-images", () => {
    const hero = resolveSlotImage("hero", 0);
    assert.ok(hero.includes("images.unsplash.com"));
    assert.ok(slotImages("gallery").length >= 3);
  });
});

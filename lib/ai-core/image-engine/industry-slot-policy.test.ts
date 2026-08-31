import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  capSubjectSparingGalleryUrls,
  getIndustryVisualPolicy,
  isHeroDominantIndustry,
  isSubjectSparingIndustry,
  resolveIndustrySlotCounts,
  resolveRequiredPhotoRoleCounts,
  resolveStockIndustryForRole,
} from "@/lib/ai-core/image-engine/industry-slot-policy";

describe("industry-slot-policy", () => {
  it("marks automotive as hero-dominant", () => {
    assert.equal(isHeroDominantIndustry("automotive"), true);
    assert.equal(isSubjectSparingIndustry("automotive"), true);
    assert.equal(isSubjectSparingIndustry("restaurant"), false);
  });

  it("defines law subject-sparing policy", () => {
    const policy = getIndustryVisualPolicy("law");
    assert.ok(policy);
    assert.equal(policy?.subjectPackId, "law");
    assert.equal(policy?.heroDominant, false);
    assert.equal(isSubjectSparingIndustry("law"), true);
  });

  it("limits automotive slot counts", () => {
    const counts = resolveIndustrySlotCounts({
      routingIndustryId: "automotive",
    });
    assert.equal(counts.hero, 1);
    assert.equal(counts.gallery, 0);
    assert.equal(counts.products, 1);
    assert.equal(counts.testimonials, 4);
  });

  it("routes non-hero automotive roles to business stock", () => {
    assert.equal(resolveStockIndustryForRole("automotive", "hero"), "automotive");
    assert.equal(resolveStockIndustryForRole("automotive", "section"), "business");
    assert.equal(resolveStockIndustryForRole("automotive", "testimonial"), "business");
  });

  it("routes law team/testimonial to business stock", () => {
    assert.equal(resolveStockIndustryForRole("law", "hero"), "law");
    assert.equal(resolveStockIndustryForRole("law", "testimonial", "testimonials"), "business");
  });

  it("reduces required gallery photos for automotive", () => {
    const counts = resolveRequiredPhotoRoleCounts("automotive");
    assert.equal(counts.hero, 1);
    assert.equal(counts.gallery, 0);
    assert.equal(counts.section, 1);
  });

  it("caps automotive gallery to hero reuse only", () => {
    const hero = "https://images.unsplash.com/photo-hero";
    assert.deepEqual(
      capSubjectSparingGalleryUrls("automotive", hero, [
        "https://images.unsplash.com/photo-a",
        "https://images.unsplash.com/photo-b",
      ]),
      [hero],
    );
  });

  it("caps law gallery subject photos", () => {
    const lawA =
      "https://images.unsplash.com/photo-1589829545856-d10d557cf57f?w=1600";
    const lawB =
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1600";
    const lawC =
      "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1600";
    const lawD =
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1600";
    const business =
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1600";

    const capped = capSubjectSparingGalleryUrls("law", lawA, [
      lawB,
      lawC,
      lawD,
      business,
    ]);
    const subjectCount = capped.filter(
      (url) =>
        url.includes("photo-145010") ||
        url.includes("photo-152179") ||
        url.includes("photo-145416"),
    ).length;
    assert.equal(subjectCount, 2);
    assert.ok(capped.includes(business));
  });
});

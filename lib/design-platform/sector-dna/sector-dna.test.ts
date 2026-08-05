import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  TBDP_SECTOR_DNA_PHASE,
  TBDP_SECTOR_DNA_VERSION,
  TBDP_SECTOR_CATALOG,
  TBDP_SECTOR_CATALOG_COUNT,
  TBDP_SECTOR_DNA_CATALOG,
  TBDP_SECTOR_DNA_COUNT,
  TBDP_EXPERIENCE_PROFILE_CATALOG,
  TBDP_EXPERIENCE_PROFILE_COUNT,
  getSectorDna,
  getExperienceProfile,
  selectSectorDesign,
  resolveSectorDna,
  validateSectorDna,
  assertSectorDnaCatalog,
} from "@/lib/design-platform/sector-dna";

const REQUIRED_SECTOR_IDS = [
  "saas",
  "restaurant",
  "real-estate",
  "medical",
  "creative-studio",
  "hotel-resort",
  "law-firm",
  "finance",
  "education",
  "logistics",
] as const;

const REQUIRED_DIMENSIONS = [
  "personality",
  "visual",
  "components",
  "experience",
  "growth",
  "ai",
] as const;

describe("TBDP Phase 4 — Sector Design DNA", () => {
  it("exports phase constants", () => {
    assert.equal(TBDP_SECTOR_DNA_PHASE, "sector-dna-4");
    assert.equal(TBDP_SECTOR_DNA_VERSION, "4.0.0");
  });

  it("has 10 sector DNA profiles", () => {
    assert.equal(TBDP_SECTOR_DNA_COUNT, 10);
    assert.equal(TBDP_SECTOR_CATALOG_COUNT, 10);
  });

  it("has 10 experience profiles", () => {
    assert.equal(TBDP_EXPERIENCE_PROFILE_COUNT, 10);
  });

  it("catalog contains all required sectors", () => {
    const ids = TBDP_SECTOR_DNA_CATALOG.map((s) => s.id);
    for (const id of REQUIRED_SECTOR_IDS) {
      assert.ok(ids.includes(id));
    }
  });

  it("validates entire sector catalog", () => {
    assert.doesNotThrow(() => assertSectorDnaCatalog(TBDP_SECTOR_DNA_CATALOG));
  });

  for (const id of REQUIRED_SECTOR_IDS) {
    it(`sector ${id} has all DNA dimensions`, () => {
      const sector = getSectorDna(id);
      assert.ok(sector);
      for (const dim of REQUIRED_DIMENSIONS) {
        assert.ok(sector![dim]);
      }
      assert.ok(sector!.personality.brand);
      assert.ok(sector!.visual.typographyProfile);
      assert.ok(sector!.components.preferredComponents.length > 0);
      assert.ok(sector!.experience.experienceProfiles.length > 0);
      assert.ok(sector!.growth.conversionStrategy);
      assert.ok(sector!.ai.layoutIds.length > 0);
    });

    it(`sector ${id} references valid experience profiles`, () => {
      const sector = getSectorDna(id)!;
      for (const profileId of sector.experienceProfiles) {
        assert.ok(getExperienceProfile(profileId));
      }
    });
  }

  it("validates individual sector via Zod", () => {
    const saas = getSectorDna("saas")!;
    const result = validateSectorDna(saas);
    assert.equal(result.ok, true);
  });

  it("selectSectorDesign resolves AI recommendations", () => {
    const result = selectSectorDesign({ sectorId: "saas", goal: "conversion" });
    assert.equal(result.sector.id, "saas");
    assert.ok(result.selections.layoutId);
    assert.ok(result.selections.heroComponent);
    assert.ok(result.selections.motionPresets.length > 0);
    assert.ok(result.metadata.confidence > 0);
  });

  it("selectSectorDesign handles RTL direction", () => {
    const result = selectSectorDesign({ sectorId: "medical", direction: "rtl" });
    assert.match(result.selections.typographyProfile, /rtl|arabic/);
  });

  it("resolveSectorDna bridges to Phase 1–3", () => {
    const resolved = resolveSectorDna("finance", { direction: "ltr" });
    assert.ok(resolved.foundations.meta.packageId);
    assert.equal(resolved.experience.direction, "ltr");
    assert.equal(resolved.sector.id, "finance");
  });

  it("sector catalog matches DNA catalog", () => {
    assert.deepEqual(
      TBDP_SECTOR_CATALOG.map((s) => s.id).sort(),
      TBDP_SECTOR_DNA_CATALOG.map((s) => s.id).sort(),
    );
  });

  it("each sector has unique id", () => {
    const ids = TBDP_SECTOR_DNA_CATALOG.map((s) => s.id);
    assert.equal(new Set(ids).size, ids.length);
  });

  it("experience catalog has unique ids", () => {
    const ids = TBDP_EXPERIENCE_PROFILE_CATALOG.map((p) => p.id);
    assert.equal(new Set(ids).size, ids.length);
  });
});

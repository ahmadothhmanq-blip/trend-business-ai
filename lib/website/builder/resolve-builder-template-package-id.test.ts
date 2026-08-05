import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getLegacyBuilderTemplatePackageMap,
  resolveBuilderTemplatePackageId,
} from "@/lib/website/builder/resolve-builder-template-package-id";
import { resolveBuilderTemplateRuntimeModel } from "@/lib/website/builder/template-runtime.server";

describe("resolveBuilderTemplatePackageId", () => {
  it("returns installed package ids unchanged", () => {
    assert.equal(resolveBuilderTemplatePackageId("corporate-business"), "corporate-business");
    assert.equal(resolveBuilderTemplatePackageId("restaurant-premium"), "restaurant-premium");
    assert.equal(resolveBuilderTemplatePackageId("saas-enterprise"), "saas-enterprise");
  });

  it("supersedes legacy installed ids to flagship packages", () => {
    assert.equal(resolveBuilderTemplatePackageId("modern-business"), "corporate-business");
    assert.equal(resolveBuilderTemplatePackageId("restaurant-signature"), "restaurant-premium");
  });

  it("maps legacy premium template ids to installed packages", () => {
    assert.equal(resolveBuilderTemplatePackageId("restaurant"), "restaurant-premium");
    assert.equal(resolveBuilderTemplatePackageId("real-estate"), "real-estate-prestige");
    assert.equal(resolveBuilderTemplatePackageId("healthcare"), "medical-premium");
    assert.equal(resolveBuilderTemplatePackageId("medical"), "medical-premium");
    assert.equal(resolveBuilderTemplatePackageId("creative"), "creative-portfolio");
    assert.equal(resolveBuilderTemplatePackageId("agency"), "creative-portfolio");
    assert.equal(resolveBuilderTemplatePackageId("saas"), "saas-enterprise");
    assert.equal(resolveBuilderTemplatePackageId("luxury-business"), "corporate-business");
  });

  it("keeps legacy map keys unique with single package targets per legacy id", () => {
    const map = getLegacyBuilderTemplatePackageMap();
    const legacyIds = Object.keys(map);
    assert.equal(new Set(legacyIds).size, legacyIds.length);
    for (const legacyId of legacyIds) {
      assert.equal(resolveBuilderTemplatePackageId(legacyId), map[legacyId]);
    }
  });

  it("resolves legacy restaurant package via template runtime server", async () => {
    const result = await resolveBuilderTemplateRuntimeModel("restaurant");
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.templateId, "restaurant-premium");
  });
});

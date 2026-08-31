import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getLegacyBuilderTemplatePackageMap,
  resolveBuilderTemplatePackageId,
  resolveInstalledBuilderTemplatePackageId,
} from "@/lib/website/builder/resolve-builder-template-package-id";
import { isVisualSkinV2PackageId } from "@/lib/website/visual-skin/theme-bridge";

const INTERNAL_FALLBACK_ID = "_generation-default";

describe("resolveBuilderTemplatePackageId", () => {
  it("keeps visual-skin flagship packages on themselves (never generation fallback)", () => {
    assert.equal(resolveBuilderTemplatePackageId("ai-startup-signal"), "ai-startup-signal");
    assert.equal(resolveBuilderTemplatePackageId("corporate-business"), "corporate-business");
    assert.equal(resolveBuilderTemplatePackageId("saas-enterprise"), "saas-enterprise");
    assert.equal(resolveBuilderTemplatePackageId("hotel-resort-premium"), "hotel-resort-premium");
    assert.equal(resolveBuilderTemplatePackageId("creative-agency-premium"), "creative-agency-premium");
    assert.ok(isVisualSkinV2PackageId("ai-startup-signal"));
  });

  it("maps legacy industry aliases to internal fallback", () => {
    assert.equal(resolveBuilderTemplatePackageId("restaurant"), INTERNAL_FALLBACK_ID);
    assert.equal(resolveBuilderTemplatePackageId("real-estate"), INTERNAL_FALLBACK_ID);
    assert.equal(resolveBuilderTemplatePackageId("healthcare"), INTERNAL_FALLBACK_ID);
    assert.equal(resolveBuilderTemplatePackageId("medical"), INTERNAL_FALLBACK_ID);
    assert.equal(resolveBuilderTemplatePackageId("creative"), INTERNAL_FALLBACK_ID);
    assert.equal(resolveBuilderTemplatePackageId("agency"), INTERNAL_FALLBACK_ID);
    assert.equal(resolveBuilderTemplatePackageId("saas"), INTERNAL_FALLBACK_ID);
    assert.equal(resolveBuilderTemplatePackageId("gaming"), INTERNAL_FALLBACK_ID);
    assert.equal(resolveBuilderTemplatePackageId("technology"), INTERNAL_FALLBACK_ID);
    assert.equal(resolveBuilderTemplatePackageId("tech"), INTERNAL_FALLBACK_ID);
    assert.equal(resolveBuilderTemplatePackageId("luxury-business"), INTERNAL_FALLBACK_ID);
  });

  it("keeps legacy map keys unique and free of visual-skin package ids", () => {
    const map = getLegacyBuilderTemplatePackageMap();
    const legacyIds = Object.keys(map);
    assert.equal(new Set(legacyIds).size, legacyIds.length);
    for (const legacyId of legacyIds) {
      assert.equal(isVisualSkinV2PackageId(legacyId), false);
      assert.equal(resolveBuilderTemplatePackageId(legacyId), INTERNAL_FALLBACK_ID);
    }
  });

  it("resolves installed flagship packages without generation fallback remap", () => {
    assert.equal(
      resolveInstalledBuilderTemplatePackageId("corporate-business"),
      "corporate-business",
    );
    assert.equal(
      resolveInstalledBuilderTemplatePackageId("saas-enterprise"),
      "saas-enterprise",
    );
    assert.equal(
      resolveInstalledBuilderTemplatePackageId("ai-startup-signal"),
      "ai-startup-signal",
    );
    assert.equal(
      resolveInstalledBuilderTemplatePackageId("modern-business"),
      "corporate-business",
    );
    assert.equal(
      resolveInstalledBuilderTemplatePackageId("restaurant"),
      INTERNAL_FALLBACK_ID,
    );
  });
});

import assert from "node:assert/strict";
import path from "node:path";
import { describe, it } from "node:test";
import {
  inspectTemplatePackageArchitecture,
  loadTemplateV2Package,
  readTemplatePackageManifestRaw,
} from "@/lib/website/template-v2/loader/load-v2-package";
import {
  hashPresentationProfile,
  hashTemplateV2PackageBundle,
} from "@/lib/website/template-v2/loader/presentation-hash";
import { resolveWbTemplatesRoot } from "@/lib/website/template-engine/constants.server";
import { SAMPLE_V1_PACKAGE_DIR, SAMPLE_V2_PACKAGE_DIR } from "@/lib/website/template-v2/test-fixtures";

describe("loadTemplateV2Package", () => {
  it("loads a valid V2 fixture package", async () => {
    const result = await loadTemplateV2Package(SAMPLE_V2_PACKAGE_DIR);

    assert.equal(result.ok, true);
    if (!result.ok) return;

    assert.equal(result.bundle.packageId, "sample-v2-package");
    assert.equal(result.bundle.architectureVersion, "v2");
    assert.equal(result.bundle.presentation.hero.componentId, "hero-primary");
    assert.ok(result.bundle.flows.home);
    assert.equal(result.bundle.componentRegistry.components.length, 6);
  });

  it("rejects V1 packages", async () => {
    const result = await loadTemplateV2Package(SAMPLE_V1_PACKAGE_DIR);

    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.match(result.error, /not a V2 template/);
  });

  it("reads raw manifest without engine strict parser", async () => {
    const manifest = await readTemplatePackageManifestRaw(SAMPLE_V2_PACKAGE_DIR);
    assert.equal(manifest.architecture?.version, "v2");
    assert.equal(manifest.presentation?.file, "presentation/presentation.json");
  });

  it("inspects architecture version from disk", async () => {
    const v2 = await inspectTemplatePackageArchitecture(SAMPLE_V2_PACKAGE_DIR);
    assert.equal(v2.architectureVersion, "v2");

    const v1 = await inspectTemplatePackageArchitecture(SAMPLE_V1_PACKAGE_DIR);
    assert.equal(v1.architectureVersion, "v1");
    assert.equal(v1.packageId, "sample-v1-package");
  });

  it("produces stable presentation hashes", async () => {
    const result = await loadTemplateV2Package(SAMPLE_V2_PACKAGE_DIR);
    assert.equal(result.ok, true);
    if (!result.ok) return;

    const hashA = hashPresentationProfile(result.bundle.presentation);
    const hashB = hashPresentationProfile(result.bundle.presentation);
    assert.equal(hashA, hashB);
    assert.equal(hashA.length, 16);

    const bundleHash = hashTemplateV2PackageBundle(result.bundle);
    assert.equal(bundleHash.length, 16);
  });
});

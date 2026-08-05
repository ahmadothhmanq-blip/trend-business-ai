import assert from "node:assert/strict";
import path from "node:path";
import { describe, it } from "node:test";
import {
  detectArchitectureVersionFromManifest,
  validateTemplateV2Package,
} from "@/lib/website/template-v2/validation/validate-v2-package";
import { readTemplatePackageManifestRaw } from "@/lib/website/template-v2/loader/load-v2-package";
import { resolveWbTemplatesRoot } from "@/lib/website/template-engine/constants.server";
import { SAMPLE_V2_PACKAGE_DIR } from "@/lib/website/template-v2/test-fixtures";

describe("validateTemplateV2Package", () => {
  it("passes validation for the sample V2 fixture", async () => {
    const manifest = await readTemplatePackageManifestRaw(SAMPLE_V2_PACKAGE_DIR);
    const result = await validateTemplateV2Package(SAMPLE_V2_PACKAGE_DIR, manifest);
    assert.equal(result.valid, true);
    assert.equal(result.architectureVersion, "v2");
    assert.equal(result.issues.length, 0);
  });

  it("skips validation for V1 packages", async () => {
    const templatesRoot = resolveWbTemplatesRoot();
    const packageDir = path.join(templatesRoot, "modern-business");
    const manifest = await readTemplatePackageManifestRaw(packageDir);

    const result = await validateTemplateV2Package(packageDir, manifest);

    assert.equal(result.valid, true);
    assert.equal(result.architectureVersion, "v1");
    assert.equal(result.issues.length, 0);
  });

  it("detects architecture version from manifest", () => {
    assert.equal(
      detectArchitectureVersionFromManifest({ architecture: { version: "v2" } }),
      "v2",
    );
    assert.equal(detectArchitectureVersionFromManifest({}), "v1");
    assert.equal(
      detectArchitectureVersionFromManifest({ architecture: { version: "v1" } }),
      "v1",
    );
  });

  it("reports missing V2 manifest fields", async () => {
    const result = await validateTemplateV2Package(SAMPLE_V2_PACKAGE_DIR, {
      specVersion: "3.0.0",
      id: "incomplete-v2",
      version: "1.0.0",
      name: "Incomplete",
      description: "Missing V2 fields",
      architecture: { version: "v2" },
    });

    assert.equal(result.valid, false);
    assert.equal(result.architectureVersion, "v2");
    assert.ok(result.issues.some((i) => i.code === "manifest.missing_v2_field"));
  });
});

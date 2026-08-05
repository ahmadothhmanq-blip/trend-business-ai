import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  resolveTemplateArchitecture,
  resolveTemplateArchitectureFromManifest,
  shouldUseV1Apply,
  shouldUseV2Apply,
} from "@/lib/website/template-v2/router/resolve-template-architecture";
import { SAMPLE_V2_FIXTURES_ROOT } from "@/lib/website/template-v2/test-fixtures";

describe("resolveTemplateArchitecture", () => {
  it("defaults to v1 for packages without architecture.version v2", async () => {
    const result = await resolveTemplateArchitecture({
      manifest: {
        specVersion: "2.0.0",
        id: "modern-business",
        version: "2.0.0",
        name: "Corporate Command",
        description: "V1 package",
      },
    });

    assert.equal(result.architectureVersion, "v1");
    assert.equal(result.packageId, "modern-business");
    assert.match(result.reason, /default v1/);
  });

  it("routes to v2 when manifest declares architecture.version v2", async () => {
    const result = await resolveTemplateArchitecture({
      packageId: "sample-v2-package",
      templatesRoot: SAMPLE_V2_FIXTURES_ROOT,
    });

    assert.equal(result.architectureVersion, "v2");
    assert.equal(result.packageId, "sample-v2-package");
  });

  it("falls back to v1 when settings pin v2 but package is v1", () => {
    const result = resolveTemplateArchitectureFromManifest(
      {
        specVersion: "2.0.0",
        id: "modern-business",
        version: "2.0.0",
        name: "Corporate Command",
        description: "V1 package",
      },
      { templateArchitectureVersion: "v2" },
    );

    assert.equal(result.architectureVersion, "v1");
    assert.match(result.reason, /safe fallback/);
  });

  it("routes to v2 when settings pin v2 and package supports v2", () => {
    const result = resolveTemplateArchitectureFromManifest(
      {
        specVersion: "3.0.0",
        id: "sample-v2-package",
        version: "1.0.0",
        name: "Sample V2",
        description: "V2 package",
        architecture: { version: "v2" },
      },
      { templateArchitectureVersion: "v2" },
    );

    assert.equal(result.architectureVersion, "v2");
  });

  it("exposes apply path helpers", () => {
    assert.equal(shouldUseV1Apply("v1"), true);
    assert.equal(shouldUseV1Apply("v2"), false);
    assert.equal(shouldUseV2Apply("v2"), true);
    assert.equal(shouldUseV2Apply("v1"), false);
  });
});

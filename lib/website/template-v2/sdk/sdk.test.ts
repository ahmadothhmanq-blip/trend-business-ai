import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { defineTemplateV2 } from "@/lib/website/template-v2/sdk/define-template";
import { validateDefinedTemplateV2 } from "@/lib/website/template-v2/sdk/validate-template";
import { WB_TEMPLATE_V2_SPEC_VERSION } from "@/lib/website/template-v2/constants";
import { loadTemplateV2Package } from "@/lib/website/template-v2/loader/load-v2-package";
import { SAMPLE_V2_PACKAGE_DIR } from "@/lib/website/template-v2/test-fixtures";

describe("template V2 SDK", () => {
  it("defineTemplateV2 produces spec 3.0.0 manifest and file payloads", async () => {
    const loaded = await loadTemplateV2Package(SAMPLE_V2_PACKAGE_DIR);
    assert.equal(loaded.ok, true);
    if (!loaded.ok) return;

    const defined = defineTemplateV2({
      id: loaded.bundle.packageId,
      version: loaded.bundle.manifest.version,
      name: loaded.bundle.manifest.name,
      description: loaded.bundle.manifest.description,
      presentation: loaded.bundle.presentation,
      tokens: loaded.bundle.tokens,
      motion: loaded.bundle.motion,
      responsive: loaded.bundle.responsive,
      components: loaded.bundle.componentRegistry.components,
      flows: loaded.bundle.flows,
    });

    assert.equal(defined.specVersion, WB_TEMPLATE_V2_SPEC_VERSION);
    assert.equal(defined.manifest.architecture?.version, "v2");
    assert.equal(defined.manifest.presentation?.file, "presentation/presentation.json");
    assert.ok(defined.manifest.pageFlows?.home);
  });

  it("validateDefinedTemplateV2 accepts a well-formed package", async () => {
    const loaded = await loadTemplateV2Package(SAMPLE_V2_PACKAGE_DIR);
    assert.equal(loaded.ok, true);
    if (!loaded.ok) return;

    const defined = defineTemplateV2({
      id: loaded.bundle.packageId,
      version: loaded.bundle.manifest.version,
      name: loaded.bundle.manifest.name,
      description: loaded.bundle.manifest.description,
      presentation: loaded.bundle.presentation,
      tokens: loaded.bundle.tokens,
      motion: loaded.bundle.motion,
      responsive: loaded.bundle.responsive,
      components: loaded.bundle.componentRegistry.components,
      flows: loaded.bundle.flows,
    });

    const validation = validateDefinedTemplateV2(defined);
    assert.equal(validation.valid, true);
    assert.equal(validation.issues.length, 0);
  });

  it("validateDefinedTemplateV2 reports registry mismatches", () => {
    const defined = defineTemplateV2({
      id: "broken-package",
      version: "1.0.0",
      name: "Broken",
      description: "Missing hero in registry",
      presentation: {
        packageId: "wrong-id",
        layout: {
          defaultLayoutId: "default",
          regions: { main: { role: "main" } },
        },
        navigation: { componentId: "nav-missing" },
        hero: { componentId: "hero-missing", region: "main" },
        footer: { componentId: "footer-missing", region: "footer" },
        homeFlow: { regions: { main: ["hero-missing"] } },
      },
      tokens: {
        colors: { primary: "#000" },
        typography: { display: "Inter", body: "Inter" },
      },
      motion: { preset: "none" },
      responsive: {
        breakpoints: [{ name: "sm", minWidth: 640 }],
      },
      components: [],
      flows: {
        home: { pageId: "home", layoutId: "default", regions: { main: [] } },
      },
    });

    const validation = validateDefinedTemplateV2(defined);
    assert.equal(validation.valid, false);
    assert.ok(validation.issues.length > 0);
  });
});

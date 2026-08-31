import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { seedFeaturesFromCapabilityManifest } from "@/lib/website/builder/capabilities/seed-from-manifest";
import { persistManifestToProject, MANIFEST_WRITE_TOKEN } from "@/lib/website/builder/capabilities/manifest";
import { buildSeededCapabilityEntries } from "@/lib/website/builder/capabilities/feature-bridge";
import { CAPABILITY_ANALYZER_SET_VERSION, CAPABILITY_MANIFEST_SPEC_VERSION } from "@/lib/website/builder/capabilities/constants";
import type { GeneratedWebsiteProject } from "@/lib/website/types/generation";

function projectWithSeededGallery(): GeneratedWebsiteProject {
  const base: GeneratedWebsiteProject = {
    projectKind: "website",
    title: "Gallery Co",
    description: "",
    pages: [],
    sections: [],
    colorPalette: [],
    typography: [],
    components: [],
    content: [],
    seo: [],
    roadmap: [],
    files: [],
  };

  return persistManifestToProject(MANIFEST_WRITE_TOKEN, base, {
    specVersion: CAPABILITY_MANIFEST_SPEC_VERSION,
    generatedAt: new Date().toISOString(),
    analyzerSetVersion: CAPABILITY_ANALYZER_SET_VERSION,
    phase: "final",
    capabilities: buildSeededCapabilityEntries(["gallery", "booking"], "user-selected-feature"),
  });
}

describe("seedFeaturesFromCapabilityManifest", () => {
  it("maps active manifest capabilities back to legacy feature tokens", () => {
    const features = seedFeaturesFromCapabilityManifest(projectWithSeededGallery());
    assert.ok(features.includes("gallery"));
    assert.ok(features.includes("booking"));
  });

  it("returns empty array when manifest is missing", () => {
    const project: GeneratedWebsiteProject = {
      projectKind: "website",
      title: "Empty",
      description: "",
      pages: [],
      sections: [],
      colorPalette: [],
      typography: [],
      components: [],
      content: [],
      seo: [],
      roadmap: [],
      files: [],
    };
    assert.deepEqual(seedFeaturesFromCapabilityManifest(project), []);
  });
});

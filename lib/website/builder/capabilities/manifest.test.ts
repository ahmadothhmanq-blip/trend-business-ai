import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ManifestWriteViolationError,
} from "@/lib/website/builder/capabilities/immutable";
import {
  attachWebsiteCapabilityManifest,
  ensureProjectWithCapabilityManifest,
  loadManifestFromProject,
  persistManifestToProject,
  readWebsiteCapabilityManifest,
} from "@/lib/website/builder/capabilities/manifest";
import { MANIFEST_WRITE_TOKEN } from "@/lib/website/builder/capabilities/manifest-write-token";
import { buildFinalCapabilityManifest } from "@/lib/website/builder/capabilities/scoring";
import { extractProjectSignals } from "@/lib/website/builder/capabilities/signals";
import type { GeneratedWebsiteProject } from "@/lib/website/types/generation";

const baseProject: GeneratedWebsiteProject = {
  projectKind: "website",
  title: "Manifest Test",
  description: "test",
  pages: ["home"],
  sections: [],
  colorPalette: [],
  typography: [],
  components: [],
  content: [],
  seo: [],
  roadmap: [],
  files: [
    {
      path: "app/pricing/page.tsx",
      content: "export default function Pricing() { return <div>Pricing</div>; }",
      language: "tsx",
    },
  ],
};

describe("manifest persistence (single module)", () => {
  it("freezes manifest on read and write", () => {
    const signals = extractProjectSignals(baseProject);
    const manifest = buildFinalCapabilityManifest(signals, "test-id");
    const persisted = persistManifestToProject(
      MANIFEST_WRITE_TOKEN,
      baseProject,
      manifest,
    );
    const loaded = loadManifestFromProject(persisted);
    assert.ok(loaded);
    assert.throws(() => {
      (loaded as { phase: string }).phase = "initial";
    });
  });

  it("blocks unauthorized persist attempts", () => {
    const signals = extractProjectSignals(baseProject);
    const manifest = buildFinalCapabilityManifest(signals, "test-id");
    assert.throws(
      () => persistManifestToProject(Symbol("fake"), baseProject, manifest),
      ManifestWriteViolationError,
    );
  });

  it("blocks deprecated attachWebsiteCapabilityManifest", () => {
    const signals = extractProjectSignals(baseProject);
    const manifest = buildFinalCapabilityManifest(signals, "test-id");
    assert.throws(
      () => attachWebsiteCapabilityManifest(baseProject, manifest),
      ManifestWriteViolationError,
    );
  });

  it("blocks deprecated ensureProjectWithCapabilityManifest", () => {
    assert.throws(
      () => ensureProjectWithCapabilityManifest(baseProject),
      ManifestWriteViolationError,
    );
  });

  it("readWebsiteCapabilityManifest is a frozen alias", () => {
    const signals = extractProjectSignals(baseProject);
    const manifest = buildFinalCapabilityManifest(signals, "test-id");
    const persisted = persistManifestToProject(
      MANIFEST_WRITE_TOKEN,
      baseProject,
      manifest,
    );
    const viaAlias = readWebsiteCapabilityManifest(persisted);
    assert.ok(viaAlias);
    assert.equal(viaAlias.phase, "final");
    assert.throws(() => {
      (viaAlias as { phase: string }).phase = "initial";
    });
  });
});

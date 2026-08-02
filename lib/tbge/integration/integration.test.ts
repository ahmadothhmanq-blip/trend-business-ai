import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import {
  mapWebsiteInputToTbgeBrief,
  mapWebsiteModeToTbge,
  mapWebsiteProfileToTbge,
} from "@/lib/tbge/integration/brief-mapper";
import {
  compareFilePaths,
  scoreOutputQuality,
} from "@/lib/tbge/integration/metrics";
import { mapTbgeSpecToWebsiteProject } from "@/lib/tbge/integration/result-mapper";
import {
  resolveWebsiteTbgeRoute,
  shouldRouteWebsiteToTbgePrimary,
  shouldRunTbgeShadowMode,
} from "@/lib/tbge/integration/router";
import { runWebsiteGenerationWithShadowMode } from "@/lib/tbge/integration/shadow-mode";
import { createTestGenerationSpec } from "@/lib/tbge/spec/fixtures/test-spec";
import type { WebsiteGenerationInput } from "@/lib/website/types";

const ORIGINAL_ENV = { ...process.env };

function restoreEnv() {
  for (const key of Object.keys(process.env)) {
    if (!(key in ORIGINAL_ENV)) delete process.env[key];
  }
  for (const [key, value] of Object.entries(ORIGINAL_ENV)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}

const sampleInput: WebsiteGenerationInput = {
  prompt: "Create a website for a gaming company",
  projectType: "business",
  projectKind: "website",
  language: "English",
  theme: "dark",
  features: ["contact"],
};

describe("TBGE website integration routing", () => {
  afterEach(restoreEnv);

  it("defaults to legacy route when flags are off", () => {
    delete process.env.TBGE_ENABLED;
    assert.equal(resolveWebsiteTbgeRoute().mode, "legacy");
    assert.equal(shouldRouteWebsiteToTbgePrimary(), false);
    assert.equal(shouldRunTbgeShadowMode(), false);
  });

  it("routes to tbge-primary when TBGE_ENABLED is on", () => {
    process.env.TBGE_ENABLED = "1";
    assert.equal(shouldRouteWebsiteToTbgePrimary(), true);
    assert.equal(resolveWebsiteTbgeRoute().mode, "tbge-primary");
  });

  it("never routes to shadow when TBGE is enabled (legacy bypassed)", () => {
    process.env.TBGE_ENABLED = "1";
    process.env.TBGE_PLANNING = "1";
    process.env.TBGE_ASSEMBLY = "1";
    process.env.TBGE_SHADOW_MODE = "1";
    assert.equal(shouldRunTbgeShadowMode(), false);
    assert.equal(resolveWebsiteTbgeRoute().mode, "tbge-primary");
    assert.equal(shouldRouteWebsiteToTbgePrimary(), true);
  });
});

describe("TBGE website integration mappers", () => {
  it("maps website input to TBGE brief", () => {
    const brief = mapWebsiteInputToTbgeBrief(sampleInput);
    assert.equal(brief.productId, "website-builder");
    assert.equal(brief.prompt, sampleInput.prompt);
    assert.equal(mapWebsiteModeToTbge(), "generate");
    assert.equal(mapWebsiteProfileToTbge(sampleInput), "professional");
  });

  it("maps TBGE spec to website project", () => {
    const spec = createTestGenerationSpec();
    const project = mapTbgeSpecToWebsiteProject({
      spec,
      files: [{ path: "package.json", content: "{}", language: "json" }],
      prompt: sampleInput.prompt,
    });
    assert.equal(project.title, spec.business.name);
    assert.equal(project.files.length, 1);
  });
});

describe("TBGE shadow mode", () => {
  it("returns legacy result when TBGE shadow run fails", async () => {
    const legacy = await runWebsiteGenerationWithShadowMode({
      pluginInput: sampleInput,
      providerName: "deepseek",
      runLegacy: async () => ({
        projectKind: "website",
        title: "Legacy",
        description: "Legacy project",
        pages: ["/"],
        sections: ["Hero"],
        colorPalette: [],
        typography: [],
        components: [],
        content: [],
        seo: [],
        roadmap: [],
        files: [{ path: "app/page.tsx", content: "legacy", language: "tsx" }],
        progressEvents: [],
        usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        generationTimeMs: 10,
        provider: "deepseek",
      }),
      options: {},
    });

    assert.equal(legacy.legacy.title, "Legacy");
    assert.ok(legacy.shadowMetrics);
  });
});

describe("TBGE integration metrics", () => {
  it("scores output quality", () => {
    const score = scoreOutputQuality([
      { path: "a.ts", content: "export const a = 1;", language: "ts" },
    ]);
    assert.ok(score > 0);
  });

  it("compares file paths between legacy and TBGE", () => {
    const comparison = compareFilePaths(
      [{ path: "a.ts", content: "a", language: "ts" }],
      [
        { path: "a.ts", content: "a", language: "ts" },
        { path: "b.ts", content: "b", language: "ts" },
      ],
    );
    assert.equal(comparison.sharedPaths.length, 1);
    assert.equal(comparison.tbgeOnlyPaths.length, 1);
  });
});

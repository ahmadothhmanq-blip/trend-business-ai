import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { FLAGSHIP_V2_PACKAGE_IDS } from "@/lib/website/template-v2/generation/v2-generation-bridge";
import {
  compareAllGoldenPreviews,
  comparePreviewHtmlToGolden,
  goldenPreviewPath,
  loadGoldenBaseline,
} from "./compare-golden";
import {
  FROZEN_FLAGSHIP_PACKAGE_IDS,
  FROZEN_MODULE_PATHS,
  WEBSITE_BUILDER_V1_VERSION,
} from "./manifest";

const root = join(import.meta.dirname, "..", "..", "..");

describe("Website Builder v1 baseline", () => {
  it("declares v1 version", () => {
    assert.equal(WEBSITE_BUILDER_V1_VERSION, "1.0.0");
  });

  it("frozen flagships match v2 generation bridge", () => {
    assert.deepEqual(
      [...FROZEN_FLAGSHIP_PACKAGE_IDS].sort(),
      [...FLAGSHIP_V2_PACKAGE_IDS].sort(),
    );
  });

  it("golden baseline covers all flagships", () => {
    const golden = loadGoldenBaseline();
    assert.equal(golden.version, WEBSITE_BUILDER_V1_VERSION);
    assert.deepEqual(
      [...golden.flagships].sort(),
      [...FROZEN_FLAGSHIP_PACKAGE_IDS].sort(),
    );
    for (const id of FROZEN_FLAGSHIP_PACKAGE_IDS) {
      assert.ok(golden.templates[id], `missing golden entry for ${id}`);
    }
  });

  it("all frozen module paths exist on disk", () => {
    for (const rel of FROZEN_MODULE_PATHS) {
      const abs = join(root, rel);
      assert.ok(existsSync(abs), `frozen module missing: ${rel}`);
    }
  });

  it("golden preview snapshots exist and match hashes", () => {
    const golden = loadGoldenBaseline();
    for (const packageId of golden.flagships) {
      const path = goldenPreviewPath(packageId);
      assert.ok(existsSync(path), `golden preview missing: ${packageId}`);
      const html = readFileSync(path, "utf8");
      const result = comparePreviewHtmlToGolden(packageId, html, golden);
      assert.ok(
        result.passed,
        `golden preview hash mismatch for ${packageId}:\n${result.failures.map((f) => f.field).join(", ")}`,
      );
    }
  });

  it("live flagship previews match golden visual regression baseline", () => {
    const previewRoot = join(
      root,
      "scripts",
      "benchmark-results",
      "flagship-previews",
    );
    if (!existsSync(previewRoot)) {
      return;
    }
    const result = compareAllGoldenPreviews(previewRoot);
    assert.ok(
      result.passed,
      `visual regression failed:\n${result.failures.map((f) => `${f.packageId}.${f.field}`).join("\n")}`,
    );
  });
});

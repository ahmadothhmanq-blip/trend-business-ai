import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  assertV1CompatibilityPath,
  createV1CompatibilityMarker,
  isV1Architecture,
  TEMPLATE_V1_APPLY_ENTRY,
} from "@/lib/website/template-v2/compatibility/v1-adapter";

describe("v1 compatibility adapter", () => {
  it("creates a V1 compatibility marker", () => {
    const marker = createV1CompatibilityMarker();
    assert.equal(marker.architectureVersion, "v1");
    assert.equal(marker.applyEntry, TEMPLATE_V1_APPLY_ENTRY);
    assert.equal(marker.applyEntry, "applyStructureTemplateToProject");
  });

  it("identifies V1 architecture versions", () => {
    assert.equal(isV1Architecture("v1"), true);
    assert.equal(isV1Architecture(undefined), true);
    assert.equal(isV1Architecture("v2"), false);
  });

  it("asserts V1 path and rejects V2 direct V1 apply", () => {
    assert.doesNotThrow(() => assertV1CompatibilityPath("v1"));
    assert.throws(
      () => assertV1CompatibilityPath("v2"),
      /use applyTemplateV2ToProject/,
    );
  });
});

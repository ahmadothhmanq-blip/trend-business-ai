import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { validateAssemblyOutput } from "@/lib/tbge/assembly/validate";
import { createTestGenerationSpec } from "@/lib/tbge/spec/fixtures/test-spec";

describe("validateAssemblyOutput", () => {
  it("accepts complete required artifacts", () => {
    const spec = createTestGenerationSpec();
    const result = validateAssemblyOutput(spec, [
      { path: "package.json", content: "{}" },
    ]);
    assert.equal(result.valid, true);
  });

  it("rejects missing required artifacts", () => {
    const spec = createTestGenerationSpec();
    const result = validateAssemblyOutput(spec, []);
    assert.equal(result.valid, false);
  });

  it("rejects duplicate paths", () => {
    const spec = createTestGenerationSpec();
    const result = validateAssemblyOutput(spec, [
      { path: "package.json", content: "{}" },
      { path: "package.json", content: "{}" },
    ]);
    assert.equal(result.valid, false);
  });
});

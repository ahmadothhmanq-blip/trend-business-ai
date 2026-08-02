import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { validateDependencyGraph } from "@/lib/tbge/assembly/dependency-graph";
import { createFullAssemblyTestSpec } from "@/lib/tbge/spec/fixtures/assembly-spec";

describe("dependency graph", () => {
  it("validates and schedules levels for full graph", () => {
    const spec = createFullAssemblyTestSpec();
    const result = validateDependencyGraph(spec.fileGraph);
    assert.equal(result.valid, true);
    if (result.valid) {
      assert.ok(result.levels.length >= 5);
      assert.equal(result.levels.flat().length, spec.fileGraph.length);
    }
  });

  it("detects missing dependencies", () => {
    const result = validateDependencyGraph([
      {
        path: "a.ts",
        generator: "scaffold-static",
        deps: ["missing.ts"],
        wave: "static-scaffold",
        priority: 0,
      },
    ]);
    assert.equal(result.valid, false);
    if (!result.valid) {
      assert.ok(result.errors.some((error) => error.includes("Missing dependency")));
    }
  });

  it("detects dependency cycles", () => {
    const result = validateDependencyGraph([
      {
        path: "a.ts",
        generator: "scaffold-static",
        deps: ["b.ts"],
        wave: "static-scaffold",
        priority: 0,
      },
      {
        path: "b.ts",
        generator: "scaffold-css",
        deps: ["a.ts"],
        wave: "static-scaffold",
        priority: 1,
      },
    ]);
    assert.equal(result.valid, false);
    if (!result.valid) {
      assert.ok(result.errors.some((error) => error.includes("cycle")));
    }
  });
});

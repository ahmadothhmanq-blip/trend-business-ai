import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createGeneratorRegistry } from "@/lib/tbge/assembly/registry";
import type { GeneratorPlugin } from "@/lib/tbge/assembly/generators/types";

describe("generator registry", () => {
  it("registers built-in generators", () => {
    const registry = createGeneratorRegistry();
    assert.equal(registry.has("scaffold-static"), true);
    assert.equal(registry.has("page-home"), true);
    assert.ok(registry.list().length >= 10);
  });

  it("allows adapter overrides", () => {
    const override: GeneratorPlugin = {
      id: "scaffold-static",
      label: "override",
      generate({ node }) {
        return { path: node.path, content: "{}", language: "json" };
      },
    };
    const registry = createGeneratorRegistry([override]);
    const plugin = registry.resolve("scaffold-static");
    assert.equal(plugin?.label, "override");
  });
});

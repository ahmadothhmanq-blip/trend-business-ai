import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createComponentRegistry } from "@/lib/tbge/composer/registry";
import { createComposerTestSpec } from "@/lib/tbge/spec/fixtures/composer-spec";

describe("component registry", () => {
  it("resolves section plugins by priority", () => {
    const registry = createComponentRegistry();
    const hero = registry.resolveSection("Hero");
    assert.equal(hero.id, "section-hero");
  });

  it("resolves gaming industry pattern", () => {
    const registry = createComponentRegistry();
    const spec = createComposerTestSpec();
    const pattern = registry.resolvePattern(spec);
    assert.equal(pattern.id, "gaming");
  });
});

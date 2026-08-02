import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createComponentRegistry } from "@/lib/tbge/composer/registry";
import { composeSectionsForPage } from "@/lib/tbge/composer/section-engine";
import { createComposerTestSpec } from "@/lib/tbge/spec/fixtures/composer-spec";

describe("section composition engine", () => {
  it("composes ordered sections with variants", () => {
    const spec = createComposerTestSpec();
    const registry = createComponentRegistry();
    const pattern = registry.resolvePattern(spec).compose(spec);
    const page = spec.structure.pages[0]!;

    const sections = composeSectionsForPage({
      spec,
      page,
      registry,
      industryPattern: pattern,
    });

    assert.equal(sections.length, 3);
    assert.equal(sections[0]?.type, "hero");
    assert.ok(sections[0]?.variant.componentType);
    assert.ok(sections.every((section) => section.layout.breakpoints.lg > 0));
  });
});

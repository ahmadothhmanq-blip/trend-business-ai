import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { composeTheme } from "@/lib/tbge/composer/theme";
import { createComposerTestSpec } from "@/lib/tbge/spec/fixtures/composer-spec";

describe("theme composition", () => {
  it("maps design tokens to css variables", () => {
    const spec = createComposerTestSpec();
    const theme = composeTheme(spec);
    assert.equal(theme.templateId, spec.design.templateId);
    assert.equal(theme.cssVariables["--color-primary"], spec.design.tokens.primary);
    assert.equal(theme.typography.headingFont, spec.design.headingFont ?? "Inter, system-ui, sans-serif");
  });
});

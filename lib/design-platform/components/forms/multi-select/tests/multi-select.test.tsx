import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { MultiSelect } from "../component";

describe("MultiSelect", () => {
  it("renders with data-tbdp-component marker", () => {
    const html = renderToStaticMarkup(
      <MultiSelect>Test</MultiSelect>,
    );
    assert.ok(html.includes('data-tbdp-component="multi-select"'));
    assert.ok(html.includes("data-tbdp-ui"));
  });

  it("exports token and variant modules", async () => {
    const tokens = await import("../tokens");
    const variants = await import("../variants");
    assert.ok(tokens);
    assert.ok(variants);
  });
});

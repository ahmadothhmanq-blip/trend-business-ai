import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { ChartsWrapper } from "../component";

describe("ChartsWrapper", () => {
  it("renders with data-tbdp-component marker", () => {
    const html = renderToStaticMarkup(
      <ChartsWrapper>Test</ChartsWrapper>,
    );
    assert.ok(html.includes('data-tbdp-component="charts-wrapper"'));
    assert.ok(html.includes("data-tbdp-ui"));
  });

  it("exports token and variant modules", async () => {
    const tokens = await import("../tokens");
    const variants = await import("../variants");
    assert.ok(tokens);
    assert.ok(variants);
  });
});

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { ProductCard } from "../component";

describe("ProductCard", () => {
  it("renders with data-tbdp-component marker", () => {
    const html = renderToStaticMarkup(
      <ProductCard>Test</ProductCard>,
    );
    assert.ok(html.includes('data-tbdp-component="product-card"'));
    assert.ok(html.includes("data-tbdp-ui"));
  });

  it("exports token and variant modules", async () => {
    const tokens = await import("../tokens");
    const variants = await import("../variants");
    assert.ok(tokens);
    assert.ok(variants);
  });
});

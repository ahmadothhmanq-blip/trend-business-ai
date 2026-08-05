import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { MegaMenu } from "../component";

describe("MegaMenu", () => {
  it("renders with data-tbdp-component marker", () => {
    const html = renderToStaticMarkup(
      <MegaMenu>Test</MegaMenu>,
    );
    assert.ok(html.includes('data-tbdp-component="mega-menu"'));
    assert.ok(html.includes("data-tbdp-ui"));
  });

  it("exports token and variant modules", async () => {
    const tokens = await import("../tokens");
    const variants = await import("../variants");
    assert.ok(tokens);
    assert.ok(variants);
  });
});

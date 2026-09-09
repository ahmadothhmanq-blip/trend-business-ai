import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { injectPublicAppDemoBanner } from "@/lib/webapp/public-demo-banner";

describe("public demo banner", () => {
  it("injects sticky demo ribbon into body", () => {
    const html = injectPublicAppDemoBanner(
      "<!doctype html><html><body><div id='app'></div></body></html>",
      { title: "Sales CRM" },
    );
    assert.match(html, /data-tbai-demo-banner="1"/);
    assert.match(html, /Demo preview/);
    assert.match(html, /Sales CRM/);
    assert.match(html, /<body[^>]*>[\s\S]*data-tbai-demo-banner/);
  });

  it("uses Arabic copy when locale hints Arabic", () => {
    const html = injectPublicAppDemoBanner("<body></body>", {
      localeHint: "Arabic",
    });
    assert.match(html, /معاينة تجريبية/);
  });
});

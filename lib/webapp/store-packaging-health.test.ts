import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildWebAppMobileStoreFiles } from "@/lib/ai/webapp-mobile-store";
import { inspectMobileStorePackaging } from "@/lib/webapp/store-packaging-health";

describe("mobile store packaging health", () => {
  it("flags placeholder icons, fingerprints, and hosts", () => {
    const files = buildWebAppMobileStoreFiles({
      title: "Demo CRM",
      pkgName: "demo-crm",
      productionUrl: "https://example.com",
    });
    const notes = inspectMobileStorePackaging(files);
    assert.ok(notes.some((note) => /SHA256|fingerprint/i.test(note)));
    assert.ok(notes.some((note) => /PNG|SVG|icon/i.test(note)));
  });
});

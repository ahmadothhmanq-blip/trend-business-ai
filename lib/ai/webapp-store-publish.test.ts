import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isStoreSuitableProductionUrl } from "@/lib/webapp/store-publish";

describe("store publish production URL gate", () => {
  it("rejects missing, http, and platform preview hosts", () => {
    assert.equal(isStoreSuitableProductionUrl(null), false);
    assert.equal(isStoreSuitableProductionUrl(""), false);
    assert.equal(isStoreSuitableProductionUrl("http://example.com"), false);
    assert.equal(
      isStoreSuitableProductionUrl("https://example.com/w/app/my-crm-abc"),
      false,
    );
  });

  it("accepts real HTTPS hosts suitable for store shells", () => {
    assert.equal(isStoreSuitableProductionUrl("https://app.example.com"), true);
    assert.equal(
      isStoreSuitableProductionUrl("https://crm.customer.com/dashboard"),
      true,
    );
  });
});

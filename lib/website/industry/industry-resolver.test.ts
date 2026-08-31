import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveWebsiteIndustry } from "@/lib/website/industry/industry-resolver";

describe("resolveWebsiteIndustry", () => {
  it("detects Arabic law firm via haystack", () => {
    const resolved = resolveWebsiteIndustry({
      prompt: "موقع لمكتب محاماة متخصص في القضايا التجارية",
    });
    assert.equal(resolved.industryId, "law");
    assert.equal(resolved.source, "haystack");
  });

  it("prefers explicit industry over text", () => {
    const resolved = resolveWebsiteIndustry({
      prompt: "mobile phone store",
      industryId: "automotive",
      businessIndustry: "automotive",
    });
    assert.equal(resolved.industryId, "automotive");
    assert.equal(resolved.source, "explicit");
  });
});

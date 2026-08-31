import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  normalizeExplicitRoutingIndustryId,
  pickExplicitRoutingIndustryId,
} from "@/lib/website/site-plan/normalize-routing-industry";

describe("normalizeExplicitRoutingIndustryId", () => {
  it("maps automotive industry ids to automotive stock routing", () => {
    assert.equal(normalizeExplicitRoutingIndustryId("automotive"), "automotive");
    assert.equal(
      normalizeExplicitRoutingIndustryId("Automotive Dealership"),
      "automotive",
    );
  });

  it("returns null for empty values", () => {
    assert.equal(normalizeExplicitRoutingIndustryId(""), null);
    assert.equal(normalizeExplicitRoutingIndustryId(undefined), null);
  });

  it("picks the first explicit industry candidate", () => {
    assert.equal(
      pickExplicitRoutingIndustryId(undefined, "", "furniture"),
      "furniture",
    );
  });
});

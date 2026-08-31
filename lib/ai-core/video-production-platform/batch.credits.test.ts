import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveBatchCreditLeaseAction } from "@/lib/ai-core/video-production-platform/batch";

describe("resolveBatchCreditLeaseAction", () => {
  it("releases for planOnly even when estimated items exist", () => {
    assert.equal(
      resolveBatchCreditLeaseAction({ planOnly: true, successfulGenerations: 0 }),
      "release",
    );
    assert.equal(
      resolveBatchCreditLeaseAction({ planOnly: true, successfulGenerations: 5 }),
      "release",
    );
  });

  it("settles when at least one generation succeeds", () => {
    assert.equal(
      resolveBatchCreditLeaseAction({ planOnly: false, successfulGenerations: 1 }),
      "settle",
    );
    assert.equal(
      resolveBatchCreditLeaseAction({ planOnly: false, successfulGenerations: 10 }),
      "settle",
    );
  });

  it("releases when generate path produces zero successes", () => {
    assert.equal(
      resolveBatchCreditLeaseAction({ planOnly: false, successfulGenerations: 0 }),
      "release",
    );
  });
});

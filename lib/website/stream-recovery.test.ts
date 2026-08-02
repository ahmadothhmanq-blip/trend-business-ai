import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isWebsiteGenerationFinalizingPhase } from "@/lib/website/stream-recovery";
import { getClientStreamRecoveryPollMs } from "@/lib/website/stream-limits";

describe("stream recovery", () => {
  it("detects finalizing progress messages", () => {
    assert.equal(
      isWebsiteGenerationFinalizingPhase("Building product preview..."),
      true,
    );
    assert.equal(
      isWebsiteGenerationFinalizingPhase("Generating hero section"),
      false,
    );
  });

  it("provides at least 25 minutes of client recovery by default", () => {
    assert.ok(getClientStreamRecoveryPollMs() >= 25 * 60 * 1000);
  });
});

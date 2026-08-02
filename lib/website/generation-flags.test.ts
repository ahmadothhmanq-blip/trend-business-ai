import assert from "node:assert/strict";
import { describe, it, beforeEach, afterEach } from "node:test";
import { resolveWebsiteGenerationProfile } from "@/lib/website/generation-flags";

describe("resolveWebsiteGenerationProfile paid default", () => {
  const originalFast = process.env.WB_FAST_GENERATION;
  const originalUltra = process.env.WB_ULTRA_FAST_GENERATION;

  beforeEach(() => {
    process.env.WB_FAST_GENERATION = "1";
    process.env.WB_ULTRA_FAST_GENERATION = "0";
  });

  afterEach(() => {
    if (originalFast === undefined) delete process.env.WB_FAST_GENERATION;
    else process.env.WB_FAST_GENERATION = originalFast;
    if (originalUltra === undefined) delete process.env.WB_ULTRA_FAST_GENERATION;
    else process.env.WB_ULTRA_FAST_GENERATION = originalUltra;
  });

  it("ignores env fast flags for paid users without explicit profile", () => {
    assert.equal(
      resolveWebsiteGenerationProfile({ hasPaidPlan: true }),
      "professional",
    );
  });

  it("honors explicit fast opt-in for paid users", () => {
    assert.equal(
      resolveWebsiteGenerationProfile({
        hasPaidPlan: true,
        generationProfile: "fast",
      }),
      "fast",
    );
  });

  it("applies env fast flags for free users", () => {
    assert.equal(
      resolveWebsiteGenerationProfile({ hasPaidPlan: false }),
      "fast",
    );
  });
});

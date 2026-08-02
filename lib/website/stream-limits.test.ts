import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { resolveWebsiteStreamMaxDurationSec } from "@/lib/website/route-limits";
import {
  getClientStreamRecoveryPollMs,
  getStreamHandoffDelayMs,
  getStreamHandoffLeadSec,
  getWebsiteStreamMaxDurationSec,
} from "@/lib/website/stream-limits";

const ORIGINAL_ENV = { ...process.env };

function restoreEnv() {
  for (const key of Object.keys(process.env)) {
    if (!(key in ORIGINAL_ENV)) delete process.env[key];
  }
  for (const [key, value] of Object.entries(ORIGINAL_ENV)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}

describe("website stream limits", () => {
  afterEach(restoreEnv);

  it("defaults to 300s on Vercel", () => {
    process.env.VERCEL = "1";
    delete process.env.WEBSITE_STREAM_MAX_DURATION_SEC;
    assert.equal(resolveWebsiteStreamMaxDurationSec(), 300);
    assert.equal(getWebsiteStreamMaxDurationSec(), 300);
  });

  it("defaults to 900s when self-hosted", () => {
    delete process.env.VERCEL;
    delete process.env.WEBSITE_STREAM_MAX_DURATION_SEC;
    assert.equal(resolveWebsiteStreamMaxDurationSec(), 900);
  });

  it("respects WEBSITE_STREAM_MAX_DURATION_SEC up to 1800s", () => {
    delete process.env.VERCEL;
    process.env.WEBSITE_STREAM_MAX_DURATION_SEC = "1500";
    assert.equal(resolveWebsiteStreamMaxDurationSec(), 1500);
  });

  it("computes handoff lead time within safe bounds", () => {
    const lead = getStreamHandoffLeadSec(300);
    assert.ok(lead >= 45 && lead <= 90);
    assert.equal(getStreamHandoffDelayMs(300), (300 - lead) * 1000);
  });

  it("extends client recovery beyond server max duration", () => {
    delete process.env.WEBSITE_STREAM_RECOVERY_POLL_MS;
    const pollMs = getClientStreamRecoveryPollMs(900);
    assert.ok(pollMs >= 25 * 60 * 1000);
    assert.ok(pollMs >= 900 * 1000);
  });
});

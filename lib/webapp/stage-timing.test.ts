import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { AppBuilderStageTiming } from "@/lib/webapp/stage-timing";
import {
  getActiveAppBuilderTiming,
  runWithAppBuilderTiming,
} from "@/lib/webapp/stage-timing-context";

describe("AppBuilderStageTiming", () => {
  it("tracks Stage 2 strategy start, wait reason, and completion", () => {
    const timing = new AppBuilderStageTiming("test-run");
    timing.observeProgress("[idea] Analyzing business idea...");
    assert.equal(timing.getCurrentStage(), "idea");

    timing.observeProgress("[strategy] Building strategy...");
    assert.equal(timing.getCurrentStage(), "strategy");

    timing.markLlmRequestSent("blueprint");
    assert.equal(timing.getWaitingFor(), "llm_response");

    timing.markFirstResponseReceived("blueprint");
    timing.setWaitingFor("json_validation", "parse");
    assert.equal(timing.getWaitingFor(), "json_validation");

    timing.endStage("strategy");
    assert.equal(timing.getCurrentStage(), null);

    timing.finish();
  });

  it("exposes active timing via async context", async () => {
    await runWithAppBuilderTiming(async (timing) => {
      timing.beginStage("strategy");
      assert.equal(getActiveAppBuilderTiming(), timing);
      assert.equal(getActiveAppBuilderTiming()?.getCurrentStage(), "strategy");
      timing.endStage("strategy");
    });
    assert.equal(getActiveAppBuilderTiming(), null);
  });
});

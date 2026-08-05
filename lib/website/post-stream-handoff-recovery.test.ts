import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { recoverAfterIncompleteSse } from "@/lib/website/post-stream-handoff-recovery";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe("post-stream handoff recovery", () => {
  it("awaits in-flight handoff recovery when SSE ends without complete", async () => {
    let fallbackCalls = 0;
    const generationId = "gen-handoff-await";

    const handoffRecoveryPromise = (async () => {
      await sleep(40);
      return true;
    })();

    const recovered = await recoverAfterIncompleteSse(
      true,
      handoffRecoveryPromise,
      generationId,
      "Finalizing your website…",
      async () => {
        fallbackCalls += 1;
        return false;
      },
    );

    assert.equal(recovered, true);
    assert.equal(fallbackCalls, 0);
  });

  it("runs fallback recovery when handoff recovery did not apply the project", async () => {
    let fallbackCalls = 0;
    const generationId = "gen-handoff-fallback";

    const recovered = await recoverAfterIncompleteSse(
      true,
      Promise.resolve(false),
      generationId,
      null,
      async (id, message) => {
        fallbackCalls += 1;
        assert.equal(id, generationId);
        assert.equal(message, null);
        return true;
      },
    );

    assert.equal(recovered, true);
    assert.equal(fallbackCalls, 1);
  });

  it("uses fallback only when handoff recovery was not started", async () => {
    let fallbackCalls = 0;

    const recovered = await recoverAfterIncompleteSse(
      false,
      null,
      "gen-no-handoff",
      "Still generating…",
      async () => {
        fallbackCalls += 1;
        return true;
      },
    );

    assert.equal(recovered, true);
    assert.equal(fallbackCalls, 1);
  });
});

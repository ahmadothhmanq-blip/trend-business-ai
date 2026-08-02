import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  LlmConcurrencyGate,
  isRateLimitError,
} from "@/lib/ai-core/file-generation/llm-gate";

describe("LlmConcurrencyGate", () => {
  it("limits concurrent in-flight tasks", async () => {
    const gate = new LlmConcurrencyGate({ maxConcurrency: 2 });
    let active = 0;
    let peak = 0;

    await Promise.all(
      Array.from({ length: 6 }, () =>
        gate.run(async () => {
          active += 1;
          peak = Math.max(peak, active);
          await new Promise((resolve) => setTimeout(resolve, 25));
          active -= 1;
          return true;
        }),
      ),
    );

    assert.equal(peak, 2);
  });

  it("detects rate limit errors", () => {
    assert.equal(isRateLimitError({ status: 429 }), true);
    assert.equal(isRateLimitError(new Error("rate limit exceeded")), true);
    assert.equal(isRateLimitError(new Error("other")), false);
  });
});

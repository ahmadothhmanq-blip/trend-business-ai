import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { runBoundedWorkerPool } from "@/lib/ai-core/file-generation/worker-pool";

describe("runBoundedWorkerPool", () => {
  it("returns results in input order regardless of completion order", async () => {
    const items = [3, 1, 2];
    const results = await runBoundedWorkerPool({
      items,
      concurrency: 2,
      worker: async (value) => {
        await new Promise((resolve) => setTimeout(resolve, value));
        return value * 10;
      },
    });
    assert.deepEqual(results, [30, 10, 20]);
  });

  it("respects concurrency cap", async () => {
    let active = 0;
    let peak = 0;

    await runBoundedWorkerPool({
      items: [1, 2, 3, 4, 5],
      concurrency: 2,
      worker: async () => {
        active += 1;
        peak = Math.max(peak, active);
        await new Promise((resolve) => setTimeout(resolve, 20));
        active -= 1;
        return true;
      },
    });

    assert.equal(peak, 2);
  });
});

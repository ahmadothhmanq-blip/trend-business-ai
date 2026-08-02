import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mapParallel } from "@/lib/tbge/assembly/parallel";

describe("mapParallel", () => {
  it("runs all items with bounded concurrency", async () => {
    const seen: number[] = [];
    let active = 0;
    let maxActive = 0;

    const result = await mapParallel(
      [1, 2, 3, 4, 5, 6],
      async (value) => {
        active += 1;
        maxActive = Math.max(maxActive, active);
        seen.push(value);
        await new Promise((resolve) => setTimeout(resolve, 5));
        active -= 1;
        return value * 2;
      },
      2,
    );

    assert.deepEqual(result, [2, 4, 6, 8, 10, 12]);
    assert.equal(seen.length, 6);
    assert.ok(maxActive <= 2);
  });
});

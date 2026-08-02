import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createTbgeContainer } from "@/lib/tbge/di/container";
import { getDefaultTbgeContainer, resetDefaultTbgeContainer } from "@/lib/tbge/di/bootstrap";
import { TBGE_TOKENS } from "@/lib/tbge/di/tokens";
import type { TbgeOrchestrator } from "@/lib/tbge/kernel/orchestrator";

describe("TBGE DI container", () => {
  it("resolves registered singletons", () => {
    const container = createTbgeContainer();
    let count = 0;
    container.register(
      TBGE_TOKENS.assemblyEngine,
      () => {
        count += 1;
        return { assemble: async () => ({ files: [], stats: { tasksRun: 0, wavesCompleted: 0, durationMs: 0, deterministicRatio: 1 } }) };
      },
      true,
    );
    const a = container.resolve(TBGE_TOKENS.assemblyEngine);
    const b = container.resolve(TBGE_TOKENS.assemblyEngine);
    assert.equal(a, b);
    assert.equal(count, 1);
  });

  it("bootstrap registers default orchestrator", () => {
    resetDefaultTbgeContainer();
    const container = getDefaultTbgeContainer();
    assert.equal(container.has(TBGE_TOKENS.orchestrator), true);
    const orchestrator = container.resolve<TbgeOrchestrator>(TBGE_TOKENS.orchestrator);
    assert.equal(typeof orchestrator.run, "function");
  });
});

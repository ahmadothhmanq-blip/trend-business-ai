import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { GeneratedProjectFile } from "@/lib/ai/types";
import {
  createWaveCheckpointEngine,
  estimateLegacyCheckpointWrites,
  estimateWaveCheckpointWrites,
} from "@/lib/website/wave-checkpoint-engine";

const sampleFile = (path: string): GeneratedProjectFile => ({
  path,
  content: `// ${path}`,
  language: "tsx",
});

describe("wave-checkpoint-engine", () => {
  it("passes through every file checkpoint when disabled (serial mode)", async () => {
    const writes: string[] = [];
    const engine = createWaveCheckpointEngine({
      enabled: false,
      schedulerMode: "serial",
      flush: async ({ message }) => {
        writes.push(message);
      },
    });

    await engine.handleFilesCheckpoint([sampleFile("app/page.tsx")], {
      message: "file 1",
    });
    await engine.handleFilesCheckpoint(
      [sampleFile("app/page.tsx"), sampleFile("app/layout.tsx")],
      { message: "file 2" },
    );
    await engine.drain();

    assert.equal(writes.length, 2);
  });

  it("buffers end-policy tasks and flushes once on wave-end", async () => {
    const writes: string[] = [];
    const engine = createWaveCheckpointEngine({
      enabled: true,
      schedulerMode: "wave",
      coalesceMs: 5,
      flush: async ({ message, waveState }) => {
        writes.push(message);
        assert.equal(waveState.completedWaves.includes("foundation"), true);
      },
    });

    await engine.handleFilesCheckpoint([sampleFile("app/layout.tsx")], {
      message: "task foundation",
      waveCheckpoint: {
        type: "task",
        waveName: "foundation",
        policy: "end",
      },
    });

    assert.equal(writes.length, 0);

    await engine.handleFilesCheckpoint([sampleFile("app/layout.tsx")], {
      message: "wave foundation complete",
      waveCheckpoint: {
        type: "wave-end",
        waveName: "foundation",
        policy: "end",
      },
    });

    await engine.drain();
    assert.equal(writes.length, 1);
  });

  it("coalesces per-task parallel checkpoints into one wave write", async () => {
    const writes: string[] = [];
    const engine = createWaveCheckpointEngine({
      enabled: true,
      schedulerMode: "wave",
      coalesceMs: 20,
      flush: async ({ message }) => {
        writes.push(message);
      },
    });

    await Promise.all([
      engine.handleFilesCheckpoint([sampleFile("components/sections/A.tsx")], {
        message: "section A",
        waveCheckpoint: {
          type: "task",
          waveName: "components",
          policy: "per-task",
        },
      }),
      engine.handleFilesCheckpoint([sampleFile("components/sections/B.tsx")], {
        message: "section B",
        waveCheckpoint: {
          type: "task",
          waveName: "components",
          policy: "per-task",
        },
      }),
    ]);

    await new Promise((resolve) => setTimeout(resolve, 30));
    await engine.handleFilesCheckpoint(
      [
        sampleFile("components/sections/A.tsx"),
        sampleFile("components/sections/B.tsx"),
      ],
      {
        message: "components wave end",
        waveCheckpoint: {
          type: "wave-end",
          waveName: "components",
          policy: "per-task",
        },
      },
    );
    await engine.drain();

    assert.equal(writes.length, 2);
  });

  it("skips persistence for none-policy waves", async () => {
    let writes = 0;
    const engine = createWaveCheckpointEngine({
      enabled: true,
      schedulerMode: "wave",
      flush: async () => {
        writes += 1;
      },
    });

    await engine.handleFilesCheckpoint([sampleFile("README.md")], {
      message: "scaffold",
      waveCheckpoint: {
        type: "task",
        waveName: "static-scaffold",
        policy: "none",
      },
    });

    await engine.drain();
    assert.equal(writes, 0);
  });

  it("estimates write reduction for typical wave plan", () => {
    const legacy = estimateLegacyCheckpointWrites(18);
    const wave = estimateWaveCheckpointWrites([
      { name: "static-scaffold", checkpoint: "none", taskCount: 12 },
      { name: "foundation", checkpoint: "end", taskCount: 3 },
      { name: "components", checkpoint: "per-task", taskCount: 8 },
      { name: "pages", checkpoint: "end", taskCount: 2 },
    ]);

    assert.equal(legacy, 18);
    assert.equal(wave, 3);
    assert.ok(wave < legacy);
  });
});

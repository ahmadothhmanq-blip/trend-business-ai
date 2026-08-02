import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createAssemblyEngine } from "@/lib/tbge/assembly/engine";
import { createFullAssemblyTestSpec } from "@/lib/tbge/spec/fixtures/assembly-spec";
import { createTestGenerationSpec } from "@/lib/tbge/spec/fixtures/test-spec";

describe("AssemblyEngine", () => {
  const engine = createAssemblyEngine();

  it("assembles a single-node spec deterministically", async () => {
    const spec = createTestGenerationSpec();
    const result = await engine.assemble(spec);
    assert.equal(result.files.length, 1);
    assert.equal(result.files[0]?.path, "package.json");
    assert.match(result.files[0]?.content ?? "", /nova-games-studio/);
    assert.equal(result.stats.tasksRun, 1);
    assert.equal(result.stats.deterministicRatio, 1);
  });

  it("assembles full website file graph in parallel waves", async () => {
    const spec = createFullAssemblyTestSpec();
    const result = await engine.assemble(spec);
    assert.ok(result.files.length >= 9);
    assert.equal(result.stats.tasksRun, spec.fileGraph.length);
    assert.ok(result.stats.wavesCompleted >= 5);
    assert.ok(result.stats.durationMs >= 0);
    assert.ok(result.files.some((file) => file.path === "app/page.tsx"));
    assert.ok(result.files.some((file) => file.path === "app/about/page.tsx"));
  });

  it("rejects invalid provenance", async () => {
    const spec = createTestGenerationSpec({
      provenance: { lockedAt: "", promptHash: "" },
    });
    await assert.rejects(() => engine.assemble(spec), /Invalid GenerationSpec|locked/);
  });

  it("rejects custom-llm generator nodes", async () => {
    const spec = createTestGenerationSpec({
      fileGraph: [
        {
          path: "custom.ts",
          generator: "custom-llm",
          deps: [],
          wave: "inject",
          priority: 0,
        },
      ],
    });
    await assert.rejects(() => engine.assemble(spec), /LLM generators are not permitted/);
  });
});

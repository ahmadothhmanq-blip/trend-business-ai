import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { PlannedFile } from "@/lib/ai/planner";
import { SCAFFOLD_PATHS } from "@/lib/ai/website-scaffold";
import { buildFileGenerationWavePlan } from "@/lib/ai-core/file-generation/wave-planner";
import { runFileGenerationScheduler } from "@/lib/ai-core/file-generation/scheduler";
import type {
  FileGenerationProductAdapter,
  FileGenerationWavePlan,
} from "@/lib/ai-core/file-generation/types";

const testAdapter: FileGenerationProductAdapter = {
  productId: "test",
  resolveTaskKind(plannedFile) {
    if (plannedFile.path.startsWith("components/sections/")) return "llm";
    return "library-scaffold";
  },
  buildDependencyEdges: () => [],
  waveConcurrencyForProfile: () => 4,
};

function planned(
  path: string,
  category: PlannedFile["category"],
): PlannedFile {
  return {
    path,
    purpose: `test ${path}`,
    language: "tsx",
    category,
  };
}

function buildTestWavePlan(filePlans: PlannedFile[]): FileGenerationWavePlan {
  return buildFileGenerationWavePlan({
    filePlans,
    adapter: testAdapter,
    kindContext: {
      scaffoldPaths: SCAFFOLD_PATHS,
      localizedCopy: false,
      composeHomePage: true,
      generationProfile: "professional",
      reusePrevious: false,
      previousPaths: new Set(),
      hasLibraryScaffold: (path) => !path.startsWith("components/sections/"),
      shouldDeferHomePage: () => false,
    },
    maxGlobalConcurrency: 4,
  });
}

describe("file-generation scheduler", () => {
  it("runs non-components waves serially", async () => {
    const order: string[] = [];
    const filePlans = [
      planned("app/layout.tsx", "layout"),
      planned("app/page.tsx", "pages"),
    ];

    const wavePlan = buildTestWavePlan(filePlans);

    await runFileGenerationScheduler({
      wavePlan,
      initialFiles: [],
      executeTask: async (ctx) => {
        order.push(ctx.task.path);
        return {
          path: ctx.task.path,
          content: `// ${ctx.task.path}`,
          language: "tsx",
        };
      },
    });

    assert.deepEqual(order, ["app/layout.tsx", "app/page.tsx"]);
  });

  it("parallelizes components/sections with bounded concurrency", async () => {
    const filePlans = [
      planned("components/ui/section-shell.tsx", "components"),
      planned("components/sections/Alpha.tsx", "components"),
      planned("components/sections/Bravo.tsx", "components"),
      planned("components/sections/Charlie.tsx", "components"),
      planned("app/page.tsx", "pages"),
    ];

    const wavePlan = buildTestWavePlan(filePlans);
    const componentsWave = wavePlan.waves.find((wave) => wave.name === "components");
    assert.ok(componentsWave);
    assert.equal(componentsWave.maxConcurrency, 4);

    const sectionTasks = wavePlan.executionOrder.filter((task) =>
      task.path.startsWith("components/sections/"),
    );
    assert.equal(sectionTasks.length, 3);
    for (const task of sectionTasks) {
      assert.equal(task.contextPolicy, "snapshot");
    }

    let peak = 0;
    let active = 0;

    const started = performance.now();
    await runFileGenerationScheduler({
      wavePlan,
      initialFiles: [],
      executeTask: async (ctx) => {
        if (ctx.task.path.startsWith("components/sections/")) {
          active += 1;
          peak = Math.max(peak, active);
          await new Promise((resolve) => setTimeout(resolve, 80));
          active -= 1;
        }
        return {
          path: ctx.task.path,
          content: `// ${ctx.task.path}`,
          language: "tsx",
        };
      },
    });
    const durationMs = performance.now() - started;

    assert.ok(peak >= 2, `expected parallel peak >= 2, got ${peak}`);
    assert.ok(
      durationMs < 280,
      `expected parallel batch faster than serial (~320ms), got ${durationMs}ms`,
    );
  });

  it("uses snapshot context for parallel sections (no sibling section content)", async () => {
    const filePlans = [
      planned("components/sections/Alpha.tsx", "components"),
      planned("components/sections/Bravo.tsx", "components"),
    ];

    const wavePlan = buildTestWavePlan(filePlans);
    const contexts: string[][] = [];

    await runFileGenerationScheduler({
      wavePlan,
      initialFiles: [
        {
          path: "app/layout.tsx",
          content: "// layout",
          language: "tsx",
        },
      ],
      executeTask: async (ctx) => {
        contexts.push(ctx.contextFiles.map((file) => file.path));
        return {
          path: ctx.task.path,
          content: `// ${ctx.task.path}`,
          language: "tsx",
        };
      },
    });

    for (const paths of contexts) {
      assert.ok(paths.includes("app/layout.tsx"));
      assert.equal(
        paths.filter((path) => path.startsWith("components/sections/")).length,
        0,
      );
    }
  });

  it("assigns strict-serial context to pages wave", async () => {
    const filePlans = [planned("app/page.tsx", "pages")];
    const wavePlan = buildTestWavePlan(filePlans);
    assert.equal(wavePlan.executionOrder[0]?.contextPolicy, "strict-serial");
    const pagesWave = wavePlan.waves.find((wave) => wave.name === "pages");
    assert.ok(pagesWave);
    assert.equal(pagesWave.maxConcurrency, 1);
  });
});

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { PlannedFile } from "@/lib/ai/planner";
import { SCAFFOLD_PATHS } from "@/lib/ai/website-scaffold";
import {
  assertWavePlanCoversFiles,
  buildFileGenerationWavePlan,
} from "@/lib/ai-core/file-generation/wave-planner";
import type { FileGenerationProductAdapter } from "@/lib/ai-core/file-generation/types";

const testAdapter: FileGenerationProductAdapter = {
  productId: "test",
  resolveTaskKind(plannedFile, context) {
    if (context.scaffoldPaths.has(plannedFile.path)) return "scaffold";
    if (plannedFile.path.includes("sections/")) return "library-scaffold";
    return "llm";
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

describe("file-generation wave planner", () => {
  it("preserves upstream filePlans execution order", () => {
    const filePlans = [
      planned("app/layout.tsx", "layout"),
      planned("components/ui/section-shell.tsx", "components"),
      planned("components/sections/Hero.tsx", "components"),
      planned("app/page.tsx", "pages"),
    ];

    const wavePlan = buildFileGenerationWavePlan({
      filePlans,
      adapter: testAdapter,
      kindContext: {
        scaffoldPaths: SCAFFOLD_PATHS,
        localizedCopy: false,
        composeHomePage: true,
        generationProfile: "professional",
        reusePrevious: false,
        previousPaths: new Set(),
        hasLibraryScaffold: (path) => path.includes("sections/"),
        shouldDeferHomePage: () => false,
      },
    });

    assertWavePlanCoversFiles(filePlans, wavePlan);
    assert.ok(wavePlan.waves.length >= 2);
    assert.equal(wavePlan.maxGlobalConcurrency, 4);
    assert.deepEqual(
      wavePlan.executionOrder.map((task) => task.path),
      filePlans.map((file) => file.path),
    );
  });

  it("assigns scaffold kind for scaffold paths", () => {
    const scaffoldPath = [...SCAFFOLD_PATHS][0];
    assert.ok(scaffoldPath, "expected at least one scaffold path");

    const filePlans = [
      planned(scaffoldPath, "configs"),
      planned("app/layout.tsx", "layout"),
    ];

    const wavePlan = buildFileGenerationWavePlan({
      filePlans,
      adapter: testAdapter,
      kindContext: {
        scaffoldPaths: SCAFFOLD_PATHS,
        localizedCopy: false,
        composeHomePage: true,
        generationProfile: "professional",
        reusePrevious: false,
        previousPaths: new Set(),
        hasLibraryScaffold: () => false,
        shouldDeferHomePage: () => false,
      },
    });

    const scaffoldTask = wavePlan.taskByPath.get(scaffoldPath);
    assert.equal(scaffoldTask?.kind, "scaffold");
  });

  it("assigns snapshot context to components/sections only", () => {
    const filePlans = [
      planned("components/ui/section-shell.tsx", "components"),
      planned("components/sections/Hero.tsx", "components"),
      planned("app/page.tsx", "pages"),
    ];

    const wavePlan = buildFileGenerationWavePlan({
      filePlans,
      adapter: testAdapter,
      kindContext: {
        scaffoldPaths: SCAFFOLD_PATHS,
        localizedCopy: false,
        composeHomePage: true,
        generationProfile: "professional",
        reusePrevious: false,
        previousPaths: new Set(),
        hasLibraryScaffold: (path) => path.includes("sections/"),
        shouldDeferHomePage: () => false,
      },
    });

    assert.equal(
      wavePlan.taskByPath.get("components/sections/Hero.tsx")?.contextPolicy,
      "snapshot",
    );
    assert.equal(
      wavePlan.taskByPath.get("app/page.tsx")?.contextPolicy,
      "strict-serial",
    );
    const componentsWave = wavePlan.waves.find((wave) => wave.name === "components");
    assert.ok(componentsWave);
    assert.equal(componentsWave.maxConcurrency, 4);
    const pagesWave = wavePlan.waves.find((wave) => wave.name === "pages");
    assert.ok(pagesWave);
    assert.equal(pagesWave.maxConcurrency, 1);
  });
});

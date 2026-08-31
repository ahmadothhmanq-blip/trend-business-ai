import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  analyzeWebAppWaveSchedule,
  buildWebAppDependencyGraph,
  buildWebAppScaffoldAssemblyEdges,
  estimateWaveScheduleSpeedup,
  groupWebAppFilesIntoWaves,
  groupWebAppFilesIntoWavesLegacy,
  WEBAPP_WAVE_TIER,
} from "@/lib/ai/webapp-wave-scheduler";
import { buildWebAppScaffold } from "@/lib/ai/webapp-scaffold";

describe("webapp wave scheduler", () => {
  it("merges independent mid-tier categories into one parallel wave", () => {
    const plans = [
      { path: "app/page.tsx", category: "pages" },
      { path: "lib/format.ts", category: "lib" },
      { path: "app/api/items/route.ts", category: "api" },
      { path: "components/table.tsx", category: "components" },
      { path: "hooks/use-items.ts", category: "hooks" },
    ];

    const legacy = groupWebAppFilesIntoWavesLegacy(plans);
    const optimized = groupWebAppFilesIntoWaves(plans);

    assert.deepEqual(
      legacy.map((wave) => wave.map((file) => file.path)),
      [
        ["lib/format.ts"],
        ["components/table.tsx"],
        ["hooks/use-items.ts"],
        ["app/api/items/route.ts"],
        ["app/page.tsx"],
      ],
    );

    assert.deepEqual(
      optimized.map((wave) => wave.map((file) => file.path)),
      [
        ["lib/format.ts"],
        [
          "app/api/items/route.ts",
          "components/table.tsx",
          "hooks/use-items.ts",
        ],
        ["app/page.tsx"],
      ],
    );

    const speedup = estimateWaveScheduleSpeedup(plans);
    assert.equal(speedup.legacyWaveCount, 5);
    assert.equal(speedup.optimizedWaveCount, 3);
    assert.equal(speedup.estimatedImprovementPercent, 40);
  });

  it("keeps entity API before its dashboard page without serializing peer APIs", () => {
    const plans = [
      { path: "app/api/items/route.ts", category: "api" },
      { path: "app/api/orders/route.ts", category: "api" },
      { path: "app/dashboard/items/page.tsx", category: "pages" },
      { path: "app/dashboard/orders/page.tsx", category: "pages" },
    ];

    const waves = groupWebAppFilesIntoWaves(plans);
    assert.equal(waves.length, 2);
    assert.deepEqual(
      waves[0]!.map((file) => file.path),
      ["app/api/items/route.ts", "app/api/orders/route.ts"],
    );
    assert.deepEqual(
      waves[1]!.map((file) => file.path),
      ["app/dashboard/items/page.tsx", "app/dashboard/orders/page.tsx"],
    );

    const graph = buildWebAppDependencyGraph(plans);
    assert.ok(
      graph.edges.some(
        (edge) =>
          edge.from === "app/api/items/route.ts" &&
          edge.to === "app/dashboard/items/page.tsx" &&
          edge.reason === "entity-api",
      ),
      "expected entity-api edge",
    );
  });

  it("sorts within a wave for deterministic Promise.all order", () => {
    const waves = groupWebAppFilesIntoWaves([
      { path: "components/z.tsx", category: "components" },
      { path: "components/a.tsx", category: "components" },
      { path: "app/api/b/route.ts", category: "api" },
    ]);
    assert.deepEqual(
      waves[0]!.map((file) => file.path),
      ["app/api/b/route.ts", "components/a.tsx", "components/z.tsx"],
    );
  });

  it("reports removed category barriers and max parallelism", () => {
    const analysis = analyzeWebAppWaveSchedule([
      { path: "lib/a.ts", category: "lib" },
      { path: "types/b.ts", category: "types" },
      { path: "components/c.tsx", category: "components" },
      { path: "hooks/d.ts", category: "hooks" },
      { path: "app/api/e/route.ts", category: "api" },
      { path: "app/layout.tsx", category: "layout" },
      { path: "app/page.tsx", category: "pages" },
    ]);

    assert.equal(analysis.waveCount, 4);
    assert.equal(analysis.maxWaveWidth, 3);
    assert.ok(analysis.removedCategoryBarriers.some((entry) => entry.includes("merged:")));
    assert.equal(WEBAPP_WAVE_TIER.components, WEBAPP_WAVE_TIER.api);
  });

  it("builds a scaffold assembly dependency graph without cycles to lower tiers", () => {
    const scaffold = buildWebAppScaffold({
      requiresAuth: true,
      requiresDatabase: true,
      requiresDashboard: true,
      tables: ["Item"],
    });
    const edges = buildWebAppScaffoldAssemblyEdges(scaffold.map((file) => file.path));
    const graph = buildWebAppDependencyGraph(
      scaffold.map((file) => ({
        path: file.path,
        category:
          file.path.startsWith("app/api/")
            ? "api"
            : file.path.endsWith("/layout.tsx")
              ? "layout"
              : file.path.startsWith("app/")
                ? "pages"
                : file.path.startsWith("components/")
                  ? "components"
                  : file.path.startsWith("hooks/")
                    ? "hooks"
                    : file.path.startsWith("lib/")
                      ? "lib"
                      : "configs",
      })),
    );

    for (const edge of edges) {
      const fromDepth = graph.depthByPath.get(edge.from) ?? 0;
      const toDepth = graph.depthByPath.get(edge.to) ?? 0;
      assert.ok(
        fromDepth <= toDepth,
        `edge ${edge.from}→${edge.to} inverted depths ${fromDepth}>${toDepth}`,
      );
    }

    assert.ok(edges.length > 0);
  });
});

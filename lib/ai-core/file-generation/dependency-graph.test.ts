import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { PlannedFile } from "@/lib/ai/planner";
import {
  buildCategoryRankEdges,
  buildFileDependencyGraph,
  computeLongestPathDepths,
} from "@/lib/ai-core/file-generation/dependency-graph";

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

describe("file-generation dependency graph", () => {
  it("orders layout before pages via category rank", () => {
    const plans = [
      planned("app/page.tsx", "pages"),
      planned("app/layout.tsx", "layout"),
      planned("components/sections/Hero.tsx", "components"),
    ];

    const graph = buildFileDependencyGraph(plans, { composeHomePage: true });
    const layoutToPage = graph.edges.find(
      (edge) => edge.from === "app/layout.tsx" && edge.to === "app/page.tsx",
    );
    assert.ok(layoutToPage, "layout must precede home page");

    const heroToHome = graph.edges.find(
      (edge) =>
        edge.from === "components/sections/Hero.tsx" &&
        edge.to === "app/page.tsx",
    );
    assert.ok(heroToHome, "sections must precede composed home page");
  });

  it("computes monotonic depths along dependency chains", () => {
    const plans = [
      planned("app/layout.tsx", "layout"),
      planned("components/ui/section-shell.tsx", "components"),
      planned("components/sections/Hero.tsx", "components"),
      planned("app/page.tsx", "pages"),
    ];

    const graph = buildFileDependencyGraph(plans, { composeHomePage: true });
    const depth = graph.depthByPath;

    assert.ok(
      (depth.get("app/layout.tsx") ?? 0) <
        (depth.get("components/sections/Hero.tsx") ?? 0),
    );
    assert.ok(
      (depth.get("components/sections/Hero.tsx") ?? 0) <
        (depth.get("app/page.tsx") ?? 0),
    );
  });

  it("buildCategoryRankEdges links lower categories to higher ones", () => {
    const plans = [
      planned("lib/utils.ts", "lib"),
      planned("app/page.tsx", "pages"),
    ];
    const edges = buildCategoryRankEdges(plans);
    assert.ok(
      edges.some(
        (edge) => edge.from === "lib/utils.ts" && edge.to === "app/page.tsx",
      ),
    );
  });

  it("computeLongestPathDepths handles empty edge sets", () => {
    const depths = computeLongestPathDepths(
      ["a.ts", "b.ts"],
      [],
    );
    assert.equal(depths.get("a.ts"), 0);
    assert.equal(depths.get("b.ts"), 0);
  });
});

import assert from "node:assert/strict";
import { describe, it, before, after } from "node:test";
import type { PlannedFile } from "@/lib/ai/planner";
import type { GeneratedProjectFile } from "@/lib/ai/types";
import {
  buildImportGraphEdges,
  collectDirectImportDeps,
  collectUpstreamDeps,
  resolvePromptContext,
  resolveSmartContextFiles,
} from "@/lib/ai-core/context-engine";
import { buildStructuralContextGraph } from "@/lib/ai-core/context-engine/graphs";

function planned(path: string, category: PlannedFile["category"]): PlannedFile {
  return { path, purpose: path, language: "tsx", category };
}

function file(
  path: string,
  content: string,
  language = "tsx",
): GeneratedProjectFile {
  return { path, content, language };
}

const layout = file("app/layout.tsx", "export default function Layout() {}");
const sectionShell = file(
  "components/ui/section-shell.tsx",
  "export function SectionShell() {}",
);
const motion = file("components/ui/motion.tsx", "export function Motion() {}");
const hero = file(
  "components/sections/HeroLuxury.tsx",
  `import { Motion } from "@/components/ui/motion";\nexport function HeroLuxury() {}`,
);
const services = file(
  "components/sections/ServicesModern.tsx",
  `import { SectionShell } from "@/components/ui/section-shell";\nexport function ServicesModern() {}`,
);
const homePage = file(
  "app/page.tsx",
  `import { HeroLuxury } from "@/components/sections/HeroLuxury";\nimport { ServicesModern } from "@/components/sections/ServicesModern";\nexport default function Page() {}`,
);
const unrelated = file("lib/utils.ts", "export const x = 1;");

const filePlans: PlannedFile[] = [
  planned(layout.path, "layout"),
  planned(sectionShell.path, "components"),
  planned(motion.path, "components"),
  planned(hero.path, "components"),
  planned(services.path, "components"),
  planned(homePage.path, "pages"),
  planned(unrelated.path, "lib"),
];

const allFiles = [layout, sectionShell, motion, hero, services, homePage, unrelated];

describe("context-engine import graph", () => {
  it("detects import edges between project files", () => {
    const edges = buildImportGraphEdges(allFiles);
    assert.ok(
      edges.some(
        (edge) =>
          edge.from === motion.path && edge.to === hero.path && edge.graph === "import",
      ),
    );
  });

  it("collects direct import deps for a section", () => {
    const deps = collectDirectImportDeps(hero.path, allFiles);
    assert.ok(deps.has(motion.path));
  });
});

describe("context-engine structural graph", () => {
  it("includes upstream deps for home page", () => {
    const edges = buildStructuralContextGraph(filePlans);
    const upstream = collectUpstreamDeps(homePage.path, edges);
    assert.ok(upstream.has(hero.path));
    assert.ok(upstream.has(services.path));
  });
});

describe("context-engine resolver", () => {
  const originalEnv = process.env.WB_SMART_CONTEXT;

  after(() => {
    if (originalEnv === undefined) {
      delete process.env.WB_SMART_CONTEXT;
    } else {
      process.env.WB_SMART_CONTEXT = originalEnv;
    }
  });

  it("returns all files when smart context is disabled", () => {
    process.env.WB_SMART_CONTEXT = "0";
    const result = resolveSmartContextFiles({
      targetPath: hero.path,
      targetCategory: "components",
      availableFiles: allFiles,
      filePlans,
    });
    assert.equal(result.files.length, allFiles.length);
    assert.equal(result.stats.filesPruned, 0);
  });

  it("prunes unrelated files when smart context is enabled", () => {
    process.env.WB_SMART_CONTEXT = "1";
    const result = resolveSmartContextFiles({
      targetPath: hero.path,
      targetCategory: "components",
      availableFiles: allFiles,
      filePlans,
    });
    assert.ok(!result.files.some((entry) => entry.path === unrelated.path));
    assert.ok(result.files.some((entry) => entry.path === motion.path));
    assert.ok(result.stats.filesPruned > 0);
  });

  it("includes all sections for home page compose context", () => {
    process.env.WB_SMART_CONTEXT = "1";
    const result = resolveSmartContextFiles({
      targetPath: homePage.path,
      targetCategory: "pages",
      availableFiles: allFiles,
      filePlans,
      composeHomePage: true,
    });
    assert.ok(result.files.some((entry) => entry.path === hero.path));
    assert.ok(result.files.some((entry) => entry.path === services.path));
    assert.ok(result.files.some((entry) => entry.path === layout.path));
  });

  it("produces deterministic output across runs", () => {
    process.env.WB_SMART_CONTEXT = "1";
    const options = {
      targetPath: hero.path,
      targetCategory: "components" as const,
      availableFiles: allFiles,
      filePlans,
    };
    const first = resolveSmartContextFiles(options);
    const second = resolveSmartContextFiles(options);
    assert.deepEqual(
      first.files.map((entry) => entry.path),
      second.files.map((entry) => entry.path),
    );
  });

  it("resolvePromptContext maps truncated prompt files", () => {
    process.env.WB_SMART_CONTEXT = "1";
    const longContent = "x".repeat(5000);
    const heavy = file("components/sections/Heavy.tsx", longContent);
    const result = resolvePromptContext({
      targetPath: heavy.path,
      targetCategory: "components",
      availableFiles: [...allFiles, heavy],
      filePlans: [...filePlans, planned(heavy.path, "components")],
      charLimitPerFile: 100,
    });
    assert.ok(result.promptFiles.every((entry) => entry.content.length <= 150));
  });
});

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { PlannedFile } from "@/lib/ai/planner";
import type { GeneratedProjectFile } from "@/lib/ai/types";
import {
  canRepairTargetsInParallel,
  fileImportsPath,
  planRepairWaves,
  runSafeParallelRepair,
  runSerialRepair,
} from "@/lib/ai-core/repair-engine";

function planned(path: string, category: PlannedFile["category"]): PlannedFile {
  return { path, purpose: path, language: "tsx", category };
}

const sectionA: GeneratedProjectFile = {
  path: "components/sections/HeroLuxury.tsx",
  language: "tsx",
  content: `import { Motion } from "@/components/ui/motion";\nexport function HeroLuxury() { return null; }`,
};

const sectionB: GeneratedProjectFile = {
  path: "components/sections/ServicesModern.tsx",
  language: "tsx",
  content: `import { SectionShell } from "@/components/ui/section-shell";\nexport function ServicesModern() { return null; }`,
};

const homePage: GeneratedProjectFile = {
  path: "app/page.tsx",
  language: "tsx",
  content: `import { HeroLuxury } from "@/components/sections/HeroLuxury";\nimport { ServicesModern } from "@/components/sections/ServicesModern";\nexport default function Page() { return null; }`,
};

describe("repair-engine import safety", () => {
  it("detects @/ import dependency between targets", () => {
    const paths = new Set([sectionA.path, homePage.path]);
    assert.equal(fileImportsPath(homePage, sectionA.path, paths), true);
    assert.equal(fileImportsPath(sectionA, homePage.path, paths), false);
  });

  it("allows parallel repair for independent sections", () => {
    const byPath = new Map([
      [sectionA.path, sectionA],
      [sectionB.path, sectionB],
    ]);
    const paths = new Set([sectionA.path, sectionB.path]);
    assert.equal(
      canRepairTargetsInParallel(sectionA.path, sectionB.path, byPath, paths),
      true,
    );
  });

  it("blocks parallel repair when one imports the other", () => {
    const byPath = new Map([
      [sectionA.path, sectionA],
      [homePage.path, homePage],
    ]);
    const paths = new Set([sectionA.path, homePage.path]);
    assert.equal(
      canRepairTargetsInParallel(sectionA.path, homePage.path, byPath, paths),
      false,
    );
    assert.equal(
      canRepairTargetsInParallel(homePage.path, sectionA.path, byPath, paths),
      false,
    );
  });
});

describe("repair-engine wave planner", () => {
  const filePlans = [
    planned("app/layout.tsx", "layout"),
    planned("components/ui/section-shell.tsx", "components"),
    planned("components/ui/motion.tsx", "components"),
    planned(sectionA.path, "components"),
    planned(sectionB.path, "components"),
    planned(homePage.path, "pages"),
  ];

  const files = [sectionA, sectionB, homePage];

  it("groups independent sections into one parallel wave before home page", () => {
    const plan = planRepairWaves({
      targets: [sectionA.path, sectionB.path, homePage.path],
      filePlans,
      files,
    });

    assert.equal(plan.targetCount, 3);
    assert.ok(plan.waves.length >= 2);
    const firstWave = plan.waves[0]!;
    assert.ok(firstWave.targets.includes(sectionA.path));
    assert.ok(firstWave.targets.includes(sectionB.path));
    assert.equal(
      plan.waves.some((wave) => wave.targets.includes(homePage.path)),
      true,
    );
  });

  it("serializes page before sections when page is import-dependent", () => {
    const plan = planRepairWaves({
      targets: [homePage.path, sectionA.path, sectionB.path],
      filePlans,
      files,
    });
    const pageWaveIndex = plan.waves.findIndex((wave) =>
      wave.targets.includes(homePage.path),
    );
    const sectionWaveIndex = plan.waves.findIndex(
      (wave) =>
        wave.targets.includes(sectionA.path) ||
        wave.targets.includes(sectionB.path),
    );
    assert.ok(sectionWaveIndex < pageWaveIndex);
  });
});

describe("repair-engine executor", () => {
  it("runs serial repair deterministically", async () => {
    const order: string[] = [];
    const files: GeneratedProjectFile[] = [];

    const result = await runSerialRepair({
      targets: ["a.tsx", "b.tsx"],
      filePlans: [
        planned("a.tsx", "components"),
        planned("b.tsx", "components"),
      ],
      files,
      repairFile: async (targetPath) => {
        order.push(targetPath);
        return { path: targetPath, content: `// ${targetPath}`, language: "tsx" };
      },
    });

    assert.deepEqual(order, ["a.tsx", "b.tsx"]);
    assert.equal(result.files.length, 2);
    assert.equal(result.stats.peakConcurrency, 1);
  });

  it("parallelizes independent repairs within a wave", async () => {
    let peak = 0;
    let active = 0;

    const result = await runSafeParallelRepair({
      targets: ["components/sections/A.tsx", "components/sections/B.tsx"],
      filePlans: [
        planned("components/sections/A.tsx", "components"),
        planned("components/sections/B.tsx", "components"),
      ],
      files: [],
      maxConcurrency: 4,
      repairFile: async (targetPath) => {
        active += 1;
        peak = Math.max(peak, active);
        await new Promise((resolve) => setTimeout(resolve, 20));
        active -= 1;
        return { path: targetPath, content: "", language: "tsx" };
      },
    });

    assert.equal(result.stats.targetsRepaired, 2);
    assert.ok(peak >= 2);
    assert.ok(result.stats.waveCount <= 2);
  });

  it("produces identical file sets for serial and parallel modes", async () => {
    const targets = [
      "components/sections/A.tsx",
      "components/sections/B.tsx",
      "components/sections/C.tsx",
    ];
    const filePlans = targets.map((path) => planned(path, "components"));
    const baseOptions = {
      targets,
      filePlans,
      files: [] as GeneratedProjectFile[],
      repairFile: async (targetPath: string) => ({
        path: targetPath,
        content: `// repaired:${targetPath}`,
        language: "tsx" as const,
      }),
    };

    const serial = await runSerialRepair(baseOptions);
    const parallel = await runSafeParallelRepair({
      ...baseOptions,
      maxConcurrency: 4,
    });

    const serialPaths = serial.files.map((file) => file.path).sort();
    const parallelPaths = parallel.files.map((file) => file.path).sort();
    assert.deepEqual(serialPaths, parallelPaths);
    assert.deepEqual(
      serial.files.sort((a, b) => a.path.localeCompare(b.path)),
      parallel.files.sort((a, b) => a.path.localeCompare(b.path)),
    );
  });

  it("rolls back a wave when validation fails", async () => {
    const original: GeneratedProjectFile = {
      path: "components/sections/A.tsx",
      content: "// original",
      language: "tsx",
    };

    const result = await runSafeParallelRepair({
      targets: [original.path],
      filePlans: [planned(original.path, "components")],
      files: [original],
      repairFile: async (targetPath) => ({
        path: targetPath,
        content: "// broken",
        language: "tsx",
      }),
      validateWave: () => false,
    });

    assert.equal(result.files[0]?.content, "// original");
    assert.equal(result.stats.rolledBackWaves, 1);
  });
});

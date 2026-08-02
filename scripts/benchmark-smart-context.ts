/**
 * Benchmark Smart Context Engine context reduction (no LLM).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { PlannedFile } from "@/lib/ai/planner";
import type { GeneratedProjectFile } from "@/lib/ai/types";
import { resolveSmartContextFiles } from "@/lib/ai-core/context-engine";

function planned(path: string, category: PlannedFile["category"]): PlannedFile {
  return { path, purpose: path, language: "tsx", category };
}

function file(path: string): GeneratedProjectFile {
  return {
    path,
    language: "tsx",
    content: `// ${path}\n${"export const v = 1;\n".repeat(80)}`,
  };
}

async function main() {
  const sections = Array.from({ length: 12 }, (_, index) =>
    planned(`components/sections/Section${index + 1}.tsx`, "components"),
  );

  const filePlans: PlannedFile[] = [
    planned("app/layout.tsx", "layout"),
    planned("components/ui/section-shell.tsx", "components"),
    planned("components/ui/motion.tsx", "components"),
    ...sections,
    planned("app/page.tsx", "pages"),
    planned("lib/utils.ts", "lib"),
    planned("types/index.ts", "types"),
  ];

  const files = filePlans.map((plan) => file(plan.path));

  const targets = [
    "components/sections/Section6.tsx",
    "app/page.tsx",
    "components/ui/motion.tsx",
  ];

  const scenarios: Array<Record<string, unknown>> = [];

  for (const targetPath of targets) {
    const category =
      filePlans.find((plan) => plan.path === targetPath)?.category ?? "components";

    process.env.WB_SMART_CONTEXT = "0";
    const legacy = resolveSmartContextFiles({
      targetPath,
      targetCategory: category,
      availableFiles: files,
      filePlans,
    });

    process.env.WB_SMART_CONTEXT = "1";
    const smart = resolveSmartContextFiles({
      targetPath,
      targetCategory: category,
      availableFiles: files,
      filePlans,
      composeHomePage: true,
    });

    const reductionPercent =
      legacy.stats.inputChars > 0
        ? Math.round(
            (1 - smart.stats.outputChars / legacy.stats.inputChars) * 100,
          )
        : 0;

    scenarios.push({
      targetPath,
      legacyFileCount: legacy.stats.outputFileCount,
      smartFileCount: smart.stats.outputFileCount,
      legacyChars: legacy.stats.inputChars,
      smartChars: smart.stats.outputChars,
      filesPruned: smart.stats.filesPruned,
      charsSaved: smart.stats.charsSaved,
      reductionPercent,
      requiredPaths: smart.stats.requiredPaths,
    });
  }

  const avgReduction = Math.round(
    scenarios.reduce(
      (sum, scenario) => sum + (scenario.reductionPercent as number),
      0,
    ) / scenarios.length,
  );

  const payload = {
    timestamp: new Date().toISOString(),
    fileCount: files.length,
    targetScenarios: scenarios,
    averageContextReductionPercent: avgReduction,
    estimatedTokenReductionPercent: Math.round(avgReduction * 0.9),
    estimatedApiCostReductionPercent: Math.round(avgReduction * 0.85),
  };

  const outDir = join(process.cwd(), "scripts", "benchmark-results");
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, `smart-context-benchmark-${Date.now()}.json`);
  writeFileSync(outPath, JSON.stringify(payload, null, 2));
  console.log(JSON.stringify(payload, null, 2));
  console.log(`written: ${outPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

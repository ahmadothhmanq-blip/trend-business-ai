/**
 * Benchmark wave checkpoint write reduction (no LLM / no Supabase).
 */
import {
  estimateLegacyCheckpointWrites,
  estimateWaveCheckpointWrites,
} from "@/lib/website/wave-checkpoint-engine";
import { buildFileGenerationWavePlan } from "@/lib/ai-core/file-generation/wave-planner";
import { websiteFileGenerationAdapter } from "@/plugins/website/file-generation-adapter";
import { buildWebsiteFileTaskKindContext } from "@/plugins/website/file-generation-adapter";
import type { PlannedFile } from "@/lib/ai/planner";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

function planned(path: string, category: PlannedFile["category"]): PlannedFile {
  return { path, purpose: path, language: "tsx", category };
}

const filePlans: PlannedFile[] = [
  planned("app/layout.tsx", "layout"),
  planned("components/ui/section-shell.tsx", "components"),
  ...Array.from({ length: 8 }, (_, i) =>
    planned(`components/sections/Section${i + 1}.tsx`, "components"),
  ),
  planned("app/page.tsx", "pages"),
];

const kindContext = buildWebsiteFileTaskKindContext({
  localizedCopy: false,
  generationProfile: "professional",
  reusePrevious: false,
  previousPaths: [],
  shouldDeferHomePage: () => false,
});

const wavePlan = buildFileGenerationWavePlan({
  filePlans,
  adapter: websiteFileGenerationAdapter,
  kindContext,
});

const llmTasks = wavePlan.executionOrder.filter((task) => task.kind === "llm").length;
const legacyWrites = estimateLegacyCheckpointWrites(llmTasks);
const waveWrites = estimateWaveCheckpointWrites(
  wavePlan.waves.map((wave) => ({
    name: wave.name,
    checkpoint: wave.checkpoint,
    taskCount: wave.tasks.length,
  })),
);

const payload = {
  timestamp: new Date().toISOString(),
  llmTaskCount: llmTasks,
  waveCount: wavePlan.waves.length,
  legacyCheckpointWrites: legacyWrites,
  waveCheckpointWrites: waveWrites,
  writeReductionPercent:
    legacyWrites > 0
      ? Math.round((1 - waveWrites / legacyWrites) * 100)
      : 0,
  waves: wavePlan.waves.map((wave) => ({
    name: wave.name,
    checkpoint: wave.checkpoint,
    taskCount: wave.tasks.length,
  })),
};

const outDir = join(process.cwd(), "scripts", "benchmark-results");
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, `wave-checkpoint-benchmark-${Date.now()}.json`);
writeFileSync(outPath, JSON.stringify(payload, null, 2));
console.log(JSON.stringify(payload, null, 2));
console.log(`written: ${outPath}`);

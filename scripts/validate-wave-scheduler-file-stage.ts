/**
 * Isolated file-generation stage validation — legacy vs wave scheduler.
 * Bypasses MAOE/PRE variance by using a shared frozen file plan per industry archetype.
 *
 * Usage:
 *   npx tsx scripts/validate-wave-scheduler-file-stage.ts
 */
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import type { PlannedFile } from "@/lib/ai/planner";
import { getAIProvider } from "@/lib/ai/adapters";
import { createProgressTracker } from "@/lib/ai/progress";
import { createUsageTracker } from "@/lib/ai/usage";
import type { GeneratedProjectFile } from "@/lib/ai/types";
import { buildWebsiteScaffold } from "@/lib/ai/website-scaffold";
import { compareGenerationQuality } from "@/lib/website/validation/wave-scheduler-quality";
import {
  runSerialWebsiteFileLoop,
  runWaveScheduledWebsiteFileLoop,
  type WebsiteFileLoopParams,
} from "@/plugins/website/file-generation-loop";
import { websiteGenerateJson } from "@/lib/ai-core/website-builder/llm-calls";
import { generatedFileSchema } from "@/plugins/website/schemas";
import { validateGeneratedFileContent } from "@/lib/ai/validator";
import { websiteFilePrompt } from "@/lib/ai/prompts/website";
import {
  WEBSITE_GOLDEN_PROMPT_SUITE,
  type GoldenPromptCase,
} from "./golden-prompts/website-generation-suite";

function loadEnvLocal(): void {
  const path = join(process.cwd(), ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    value = value.replace(/^"|"$/g, "").replace(/^'|'$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvLocal();

function industryFilePlan(promptCase: GoldenPromptCase): PlannedFile[] {
  const sections = [
    "HeroLuxury",
    "ServicesModern",
    "TestimonialsModern",
    "ContactSection",
  ].map((name) => ({
    path: `components/sections/${name}.tsx`,
    purpose: `${promptCase.label} section ${name}`,
    language: "tsx",
    category: "components" as const,
  }));

  return [
    {
      path: "app/layout.tsx",
      purpose: "Root layout",
      language: "tsx",
      category: "layout",
    },
    {
      path: "components/ui/section-shell.tsx",
      purpose: "Section shell primitive",
      language: "tsx",
      category: "components",
    },
    {
      path: "components/ui/motion.tsx",
      purpose: "Motion helper",
      language: "tsx",
      category: "components",
    },
    ...sections,
    {
      path: "app/page.tsx",
      purpose: "Home page",
      language: "tsx",
      category: "pages",
    },
  ];
}

function minimalAnalysis(promptCase: GoldenPromptCase) {
  return {
    projectName: `${promptCase.label} Co`,
    pages: ["Home"],
    requiresAuth: false,
    requiresDatabase: false,
    requiresDashboard: false,
    isEcommerce: promptCase.id === "ecommerce",
    isSaas: promptCase.id === "saas",
    databaseProvider: "none" as const,
    businessProfile: {
      projectName: `${promptCase.label} Co`,
      industry: promptCase.industry,
      summary: promptCase.prompt,
      offer: promptCase.prompt,
      requiredSections: ["Hero", "Services", "Testimonials", "Contact"],
    },
  };
}

function minimalPlan(promptCase: GoldenPromptCase, filePlans: PlannedFile[]) {
  return {
    blueprint: {
      title: `${promptCase.label} Co`,
      description: promptCase.prompt,
      pages: ["Home"],
      sections: ["Hero", "Services", "Testimonials", "Contact"],
      colorPalette: ["#111", "#fff"],
      typography: ["Inter", "Inter"],
      components: ["HeroLuxury", "ServicesModern"],
      content: [promptCase.prompt],
      seo: ["home"],
      roadmap: [],
    },
    dynamicPlan: {
      complexity: "standard" as const,
      estimatedFileCount: filePlans.length,
      layouts: [],
      pages: ["Home"],
      components: ["HeroLuxury", "ServicesModern"],
      apiRoutes: [],
      hooks: [],
      utilities: [],
      types: [],
      configs: [],
      files: filePlans,
    },
    filePlans,
    flags: {
      requiresAuth: false,
      requiresDatabase: false,
      requiresDashboard: false,
      isEcommerce: promptCase.id === "ecommerce",
      isSaas: promptCase.id === "saas",
      databaseProvider: "none" as const,
    },
    strategy: {
      positioning: promptCase.prompt,
      pages: [{ name: "Home", path: "/" }],
      sectionPlan: [
        { page: "Home", name: "Hero", component: "HeroLuxury" },
        { page: "Home", name: "Services", component: "ServicesModern" },
      ],
      ctas: [{ label: "Get Started", href: "#contact" }],
      seoFocus: ["home"],
      contentStructure: ["Hero", "Services", "Contact"],
    },
    designSystem: {
      colors: {
        primary: "#1a1a1a",
        secondary: "#666",
        background: "#fff",
        foreground: "#111",
        accent: "#c9a227",
      },
      typography: {
        headingFont: "Inter",
        bodyFont: "Inter",
        scale: ["sm", "base", "lg"],
      },
      industryPattern: promptCase.industry,
      componentPalette: ["HeroLuxury", "ServicesModern", "TestimonialsModern"],
      uiStyle: { density: "comfortable" as const },
    },
  };
}

async function runFileStage(
  promptCase: GoldenPromptCase,
  mode: "legacy" | "wave",
): Promise<{ files: GeneratedProjectFile[]; durationMs: number; llmCalls: number }> {
  const previous = process.env.WB_WAVE_SCHEDULER;
  process.env.WB_WAVE_SCHEDULER = mode === "wave" ? "1" : "0";

  const filePlans = industryFilePlan(promptCase);
  const analysis = minimalAnalysis(promptCase);
  const plan = minimalPlan(promptCase, filePlans);
  const scaffold = buildWebsiteScaffold(`${promptCase.label} Co`);
  const ctx = {
    provider: getAIProvider("deepseek"),
    progress: createProgressTracker(),
    usage: createUsageTracker(),
  };

  let llmCalls = 0;
  const started = Date.now();

  try {
    const loopParams = {
      input: {
        prompt: promptCase.prompt,
        language: promptCase.language,
        theme: promptCase.theme,
        projectType: "website",
        projectKind: "website" as const,
        features: promptCase.features,
        generationProfile: "fast" as const,
        userId: "file-stage-validation",
        mode: "generate" as const,
      },
      analysis,
      plan,
      ctx,
      assetSummary: "",
      files: [...scaffold.filter((f) => filePlans.some((p) => p.path === f.path))],
      aiFilePlans: filePlans,
      generationProfile: "fast" as const,
      minimalGeneration: true,
      ultraGeneration: false,
      localizedCopy: false,
      componentPaletteForCompose: plan.designSystem.componentPalette?.map(String),
      reusePrevious: false,
      previousByPath: new Map(),
      generateFile: async (
        filePlan: PlannedFile,
        existingFiles: GeneratedProjectFile[],
        extraValidationReason: string,
      ) => {
        llmCalls += 1;
        const prompt = websiteFilePrompt({
          input: {
            prompt: promptCase.prompt,
            projectType: "website",
            projectKind: "website",
            language: promptCase.language,
            theme: promptCase.theme,
            features: promptCase.features,
          },
          analysis,
          blueprint: plan.blueprint,
          dynamicPlan: plan.dynamicPlan,
          filePlan,
          projectTree: filePlans,
          existingFiles: existingFiles.map((file) => ({
            path: file.path,
            language: file.language,
            content: file.content.slice(0, 3500),
          })),
          validationReason: extraValidationReason,
          strategy: plan.strategy,
          designSystem: plan.designSystem,
        });

        return websiteGenerateJson<GeneratedProjectFile>({
          stage: "file-generation",
          input: { language: promptCase.language, prompt: promptCase.prompt },
          provider: ctx.provider,
          maxAttempts: 3,
          filePath: filePlan.path,
          prompt,
          schema: generatedFileSchema,
          validate: (result) => validateGeneratedFileContent(result, filePlan.path),
        });
      },
    };

    const files =
      mode === "wave"
        ? await runWaveScheduledWebsiteFileLoop(loopParams as unknown as WebsiteFileLoopParams)
        : await runSerialWebsiteFileLoop(loopParams as unknown as WebsiteFileLoopParams);

    return { files, durationMs: Date.now() - started, llmCalls };
  } finally {
    if (previous === undefined) delete process.env.WB_WAVE_SCHEDULER;
    else process.env.WB_WAVE_SCHEDULER = previous;
  }
}

function parseIdsArg(): string[] | null {
  const idx = process.argv.indexOf("--ids");
  if (idx === -1 || !process.argv[idx + 1]) return null;
  return process.argv[idx + 1].split(",").map((id) => id.trim()).filter(Boolean);
}

async function main() {
  const filterIds = parseIdsArg();
  const suite = filterIds
    ? WEBSITE_GOLDEN_PROMPT_SUITE.filter((promptCase) =>
        filterIds.includes(promptCase.id),
      )
    : WEBSITE_GOLDEN_PROMPT_SUITE;

  if (suite.length === 0) {
    console.error("No matching golden prompts for --ids");
    process.exit(1);
  }

  const results = [];

  for (const promptCase of suite) {
    console.error(`\n=== File stage: ${promptCase.label} ===`);
    console.error("legacy...");
    const legacy = await runFileStage(promptCase, "legacy");
    console.error("wave...");
    const wave = await runFileStage(promptCase, "wave");

    const quality = compareGenerationQuality({
      promptId: promptCase.id,
      prompt: promptCase.prompt,
      language: promptCase.language,
      legacyFiles: legacy.files,
      waveFiles: wave.files,
      scope: "isolated-file-stage",
    });

    const speedup = Math.round((1 - wave.durationMs / legacy.durationMs) * 100);

    results.push({
      promptId: promptCase.id,
      label: promptCase.label,
      legacy: {
        durationMs: legacy.durationMs,
        llmCalls: legacy.llmCalls,
        fileCount: legacy.files.length,
      },
      wave: {
        durationMs: wave.durationMs,
        llmCalls: wave.llmCalls,
        fileCount: wave.files.length,
      },
      speedupPercent: speedup,
      quality,
    });

    console.error(
      `  legacy ${legacy.durationMs}ms · wave ${wave.durationMs}ms · speedup ${speedup}% · ${quality.passed ? "PASS" : "FAIL"}`,
    );
  }

  const passed = results.filter((entry) => entry.quality.passed).length;
  const report = {
    timestamp: new Date().toISOString(),
    scope: "file-generation-stage-isolated",
    promptCount: results.length,
    overallPassed: passed === results.length,
    passedCount: passed,
    averageStructureScore: Math.round(
      results.reduce((s, r) => s + r.quality.structureScore, 0) / results.length,
    ),
    averageJaccard: Math.round(
      (results.reduce((s, r) => s + r.quality.filePathJaccard, 0) / results.length) *
        1000,
    ) / 1000,
    averageSpeedupPercent: Math.round(
      results.reduce((s, r) => s + r.speedupPercent, 0) / results.length,
    ),
    results,
  };

  const outDir = join(process.cwd(), "scripts", "benchmark-results");
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, `wave-scheduler-file-stage-validation-${Date.now()}.json`);
  writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  console.error(`written: ${outPath}`);
  if (!report.overallPassed) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

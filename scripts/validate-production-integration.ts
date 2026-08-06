/**
 * Validate production integration across 20 industry/language scenarios.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { applyV2StructureDuringGeneration } from "@/lib/website/template-v2/generation/v2-generation-bridge";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";

const SCENARIOS = [
  { packageId: "corporate-business", language: "English", industry: "corporate" },
  { packageId: "corporate-business", language: "Arabic", industry: "corporate" },
  { packageId: "saas-enterprise", language: "English", industry: "saas" },
  { packageId: "saas-enterprise", language: "German", industry: "saas" },
  { packageId: "restaurant-premium", language: "English", industry: "restaurant" },
  { packageId: "restaurant-premium", language: "French", industry: "restaurant" },
  { packageId: "ecommerce-premium", language: "English", industry: "ecommerce" },
  { packageId: "ecommerce-premium", language: "Spanish", industry: "ecommerce" },
  { packageId: "medical-premium", language: "English", industry: "medical" },
  { packageId: "medical-premium", language: "Arabic", industry: "medical" },
  { packageId: "real-estate-premium", language: "English", industry: "real-estate" },
  { packageId: "real-estate-premium", language: "Italian", industry: "real-estate" },
  { packageId: "creative-agency-premium", language: "English", industry: "creative-agency" },
  { packageId: "creative-agency-premium", language: "Japanese", industry: "creative-agency" },
  { packageId: "education-premium", language: "English", industry: "education" },
  { packageId: "education-premium", language: "Portuguese", industry: "education" },
  { packageId: "finance-premium", language: "English", industry: "finance" },
  { packageId: "finance-premium", language: "Chinese", industry: "finance" },
  { packageId: "hotel-resort-premium", language: "English", industry: "hotel-resort" },
  { packageId: "hotel-resort-premium", language: "Arabic", industry: "hotel-resort" },
];

function buildProject(industry: string): GeneratedWebsiteProject {
  return {
    projectKind: "website",
    title: `${industry} showcase`,
    description: `Premium ${industry} digital experience`,
    pages: ["home"],
    sections: [],
    colorPalette: [],
    typography: [],
    components: [],
    content: [],
    seo: [],
    roadmap: [],
    files: [
      {
        path: "app/globals.css",
        content: "@tailwind base;\n@tailwind components;\n@tailwind utilities;\n",
        language: "css",
      },
      {
        path: "lib/site-images.ts",
        content: "export const HERO_IMAGE = null;",
        language: "typescript",
      },
    ],
    businessProfile: {
      projectName: `${industry} showcase`,
      industry,
      targetAudience: "Global",
      businessGoals: ["Brand growth"],
      offer: industry,
      tone: "professional",
      geography: "Global",
      competitors: [],
      kpis: [],
      summary: industry,
      requiredSections: ["hero", "contact"],
    },
    settings: {},
  };
}

async function main() {
  const outDir = path.join(
    process.cwd(),
    "scripts/benchmark-results/production-integration",
  );
  mkdirSync(outDir, { recursive: true });

  const results = [];
  let passed = 0;
  let failed = 0;

  for (const scenario of SCENARIOS) {
    const id = `${scenario.packageId}-${scenario.language.toLowerCase()}`;
    try {
      const applied = await applyV2StructureDuringGeneration({
        project: buildProject(scenario.industry),
        templatePackageId: scenario.packageId,
        language: scenario.language,
      });

      const settings = (applied.settings ?? {}) as Record<string, unknown>;
      const blueprint = settings.websiteBlueprintV2 as
        | { meta?: { blueprintId?: string }; sectionVariants?: unknown[] }
        | undefined;
      const report = settings.designDirectorReportV2 as
        | { finalScore?: { overall?: number }; approved?: boolean }
        | undefined;
      const page =
        applied.files?.find((f) => f.path === "app/page.tsx")?.content ?? "";
      const hasBlueprintMeta = page.includes("data-v2-blueprint");
      const hasVariants = page.includes("data-v2-variant");
      const score = report?.finalScore?.overall ?? 0;
      const approved = report?.approved ?? false;
      const ok = Boolean(blueprint) && hasBlueprintMeta && page.length > 500;

      if (ok) passed += 1;
      else failed += 1;

      results.push({
        id,
        packageId: scenario.packageId,
        language: scenario.language,
        blueprintId: blueprint?.meta?.blueprintId,
        score,
        approved,
        hasBlueprintMeta,
        hasVariants,
        sectionCount: blueprint?.sectionVariants?.length,
        pageBytes: page.length,
        ok,
      });

      writeFileSync(path.join(outDir, `${id}.page.tsx`), page, "utf8");
    } catch (error) {
      failed += 1;
      results.push({
        id,
        packageId: scenario.packageId,
        language: scenario.language,
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const summary = {
    generatedAt: new Date().toISOString(),
    total: SCENARIOS.length,
    passed,
    failed,
    passRate: `${Math.round((passed / SCENARIOS.length) * 100)}%`,
    avgScore:
      Math.round(
        results
          .filter((r) => typeof r.score === "number")
          .reduce((sum, r) => sum + (r.score as number), 0) /
          Math.max(1, results.filter((r) => typeof r.score === "number").length),
      ),
    results,
  };

  writeFileSync(
    path.join(outDir, "validation-summary.json"),
    JSON.stringify(summary, null, 2),
    "utf8",
  );

  console.log(JSON.stringify(summary, null, 2));
  if (failed > 0) process.exit(1);
}

main();

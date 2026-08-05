/**
 * RC1 — Website Builder end-to-end deterministic QA (no live LLM).
 * Usage: npx tsx scripts/rc1-website-builder-qa.ts
 */
import { performance } from "node:perf_hooks";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { runProductionPlanningPhase } from "@/lib/ai-core/generation-engine/production/run-planning-phase";
import {
  runMasterPlanPipeline,
  runAwqePipeline,
} from "@/lib/ai-core/generation-engine";
import {
  validateContentTasks,
  buildLockedSpecFromMasterPlan,
} from "@/lib/ai-core/generation-engine/integration";
import { buildMasterPlanContentLlmRequest } from "@/lib/ai-core/generation-engine/master-plan/llm-request-builder";
import { resolveBuilderTemplatePackageId } from "@/lib/website/builder/resolve-builder-template-package-id";
import { resolveBuilderTemplateRuntimeModel } from "@/lib/website/builder/template-runtime.server";
import { applyStructureTemplateToProject } from "@/lib/website/builder/apply-structure-template";
import { runWebsiteQualityBenchmark } from "@/lib/website/quality-benchmark";
import { runWebsiteReview } from "@/lib/website/review-studio";
import {
  buildPublishQualityPayload,
  shouldBlockPublish,
  evaluateGenerationPublishGates,
} from "@/lib/website/publish-quality";
import { resolveGlsLanguageContext } from "@/lib/language-platform";
import { wireWebsiteGenerationStart } from "@/lib/website/tbdp-wiring";
import type { WebsiteGenerationInput } from "@/lib/website/types";
import type { WebsiteGeneration } from "@/types/database";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "scripts/benchmark-results/rc1");
mkdirSync(outDir, { recursive: true });

process.env.WB_PRODUCTION_PIPELINE = "1";
process.env.WB_MASTER_PLAN = "1";

const SCENARIOS = [
  {
    id: "restaurant",
    label: "Restaurant website",
    prompt:
      "Fine dining restaurant in Dubai with reservations, menu highlights, chef story, and private dining events. Premium luxury aesthetic.",
    legacyTemplateId: "restaurant",
    packageId: "restaurant-signature",
    industryId: "restaurant",
  },
  {
    id: "saas",
    label: "SaaS website",
    prompt:
      "B2B SaaS platform for project management with pricing tiers, feature comparison, customer testimonials, and free trial signup.",
    legacyTemplateId: "saas",
    packageId: "saas-enterprise",
    industryId: "saas",
  },
  {
    id: "medical",
    label: "Medical clinic",
    prompt:
      "Private medical clinic offering family medicine, preventive care, and online appointment booking. Clean, calming, trustworthy design.",
    legacyTemplateId: "medical",
    packageId: "medical-premium",
    industryId: "medical",
  },
  {
    id: "real-estate",
    label: "Real estate company",
    prompt:
      "Luxury real estate brokerage with property listings, neighborhood guides, and client testimonials. Prestige aesthetic.",
    legacyTemplateId: "real-estate",
    packageId: "real-estate-prestige",
    industryId: "real-estate",
  },
  {
    id: "creative-agency",
    label: "Creative agency",
    prompt:
      "Creative digital agency showcasing branding, web design, and marketing campaigns. Bold portfolio and case studies.",
    legacyTemplateId: "creative",
    packageId: "creative-portfolio",
    industryId: "agency",
  },
] as const;

type StageResult = {
  name: string;
  ok: boolean;
  ms: number;
  level: string;
  [key: string]: unknown;
};

function stageResult(
  name: string,
  ok: boolean,
  ms: number,
  details: Record<string, unknown> = {},
  level = ok ? "pass" : "error",
): StageResult {
  return { name, ok, ms: Math.round(ms * 100) / 100, level, ...details };
}

async function runScenario(scenario: (typeof SCENARIOS)[number]) {
  const errors: string[] = [];
  const warnings: string[] = [];
  const stages: StageResult[] = [];
  const pluginInput: WebsiteGenerationInput = {
    prompt: scenario.prompt,
    projectType: "business",
    projectKind: "website",
    language: "English",
    theme: "modern",
    industryId: scenario.industryId,
    websiteStructureTemplateId: scenario.packageId,
    templateId: scenario.legacyTemplateId,
    features: ["contact-form", "seo"],
  };

  let t0 = performance.now();
  try {
    const resolvedLegacy = resolveBuilderTemplatePackageId(scenario.legacyTemplateId);
    const resolvedPackage = resolveBuilderTemplatePackageId(scenario.packageId);
    if (resolvedLegacy !== scenario.packageId) {
      errors.push(
        `Legacy template "${scenario.legacyTemplateId}" resolved to "${resolvedLegacy}", expected "${scenario.packageId}"`,
      );
    }
    const runtime = await resolveBuilderTemplateRuntimeModel(scenario.legacyTemplateId);
    if (!runtime.ok) errors.push(`Template runtime 404 for legacy id: ${runtime.message}`);
    stages.push(
      stageResult(
        "Template Resolution + Runtime",
        runtime.ok && resolvedLegacy === scenario.packageId,
        performance.now() - t0,
        {
          resolvedLegacy,
          resolvedPackage,
          templateId: runtime.ok ? runtime.templateId : null,
        },
      ),
    );
  } catch (e) {
    errors.push(`Template resolution: ${e instanceof Error ? e.message : String(e)}`);
    stages.push(stageResult("Template Resolution + Runtime", false, performance.now() - t0));
  }

  t0 = performance.now();
  let masterPlan = null as Awaited<ReturnType<typeof runMasterPlanPipeline>> extends { ok: true; masterPlan: infer P }
    ? P
    : never | null;
  try {
    const mp = await runMasterPlanPipeline({ userPrompt: scenario.prompt });
    if (!mp.ok) throw new Error(mp.errors?.join("; ") ?? "master plan failed");
    masterPlan = mp.masterPlan;
    const planning = await runProductionPlanningPhase({ pluginInput, onProgress: () => {} });
    if (!planning.ok) throw new Error(planning.errors?.join("; ") ?? "production planning failed");
    stages.push(
      stageResult("Master Plan + Production Planning", true, performance.now() - t0, {
        masterPlanId: masterPlan.id,
        websiteType: masterPlan.websiteType,
        industry: masterPlan.business.industry,
        validationPassed: planning.context.validationReport.passed,
        awqeScore: planning.context.qualityReport.overallScore,
        planningMs: planning.context.planningTiming.planningMs,
        qualityMs: planning.context.planningTiming.qualityMs,
      }),
    );
  } catch (e) {
    errors.push(`Master Plan / Production: ${e instanceof Error ? e.message : String(e)}`);
    stages.push(stageResult("Master Plan + Production Planning", false, performance.now() - t0));
  }

  t0 = performance.now();
  try {
    if (!masterPlan) throw new Error("skipped — no master plan");
    const awqe = runAwqePipeline({ masterPlan });
    if (!awqe.ok) throw new Error("AWQE failed");
    stages.push(
      stageResult("AWQE", true, performance.now() - t0, {
        specHash: awqe.meta.specHash,
        stagesCompleted: awqe.meta.stagesCompleted.length,
      }),
    );
  } catch (e) {
    errors.push(`AWQE: ${e instanceof Error ? e.message : String(e)}`);
    stages.push(stageResult("AWQE", false, performance.now() - t0));
  }

  t0 = performance.now();
  try {
    if (!masterPlan) throw new Error("skipped — no master plan");
    const request = buildMasterPlanContentLlmRequest(masterPlan);
    const validation = validateContentTasks(request);
    if (!validation.valid) throw new Error(validation.errors?.join("; "));
    if (request.userPrompt.includes(scenario.prompt)) {
      warnings.push("Content request may leak raw user prompt into LLM payload");
    }
    stages.push(
      stageResult("Content Provider (copy-only request)", true, performance.now() - t0, {
        hasLockedMarker: request.systemPrompt.includes("LOCKED Master Plan"),
        copyTaskCount: (JSON.parse(request.userPrompt) as { copyTasks?: unknown[] }).copyTasks
          ?.length ?? 0,
      }),
    );
  } catch (e) {
    errors.push(`Content Provider: ${e instanceof Error ? e.message : String(e)}`);
    stages.push(stageResult("Content Provider (copy-only request)", false, performance.now() - t0));
  }

  t0 = performance.now();
  try {
    if (!masterPlan) throw new Error("skipped — no master plan");
    const spec = buildLockedSpecFromMasterPlan({
      plan: masterPlan,
      prompt: scenario.prompt,
      profile: "professional",
      mode: "generate",
    });
    stages.push(
      stageResult("TBGE (locked spec)", true, performance.now() - t0, {
        pageCount: spec.structure.pages.length,
        locked: true,
        plannerModel: spec.provenance.plannerModel,
      }),
    );
  } catch (e) {
    errors.push(`TBGE: ${e instanceof Error ? e.message : String(e)}`);
    stages.push(stageResult("TBGE (locked spec)", false, performance.now() - t0));
  }

  t0 = performance.now();
  try {
    const wire = wireWebsiteGenerationStart({
      prompt: scenario.prompt,
      industryId: scenario.industryId,
      templateId: scenario.legacyTemplateId,
      websiteStructureTemplateId: scenario.packageId,
      language: "English",
    });
    stages.push(
      stageResult("TBDP Wiring", true, performance.now() - t0, {
        enabled: wire.enabled,
        sectorDnaId: wire.designContext?.meta?.sectorDnaId ?? null,
      }),
    );
  } catch (e) {
    errors.push(`TBDP: ${e instanceof Error ? e.message : String(e)}`);
    stages.push(stageResult("TBDP Wiring", false, performance.now() - t0));
  }

  t0 = performance.now();
  try {
    const lang = resolveGlsLanguageContext({ language: "English" });
    const langAr = resolveGlsLanguageContext({ language: "Arabic" });
    stages.push(
      stageResult("GLS", true, performance.now() - t0, {
        direction: lang.direction,
        rtl: lang.rtl,
        arabicRtl: langAr.rtl,
      }),
    );
  } catch (e) {
    errors.push(`GLS: ${e instanceof Error ? e.message : String(e)}`);
    stages.push(stageResult("GLS", false, performance.now() - t0));
  }

  t0 = performance.now();
  let projectFiles: { path: string; content: string; language: string }[] = [];
  try {
    const applied = await applyStructureTemplateToProject({
      project: {
        projectKind: "website",
        title: scenario.label,
        description: scenario.prompt,
        pages: [],
        sections: [],
        colorPalette: [],
        typography: [],
        components: [],
        content: [],
        seo: [],
        roadmap: [],
        files: [
          {
            path: "app/page.tsx",
            content: `<main><h1>${scenario.label}</h1><p>Welcome</p></main>`,
            language: "tsx",
          },
        ],
        settings: {},
      },
      templatePackageId: scenario.legacyTemplateId,
      language: "English",
    });
    projectFiles = applied.project.files ?? [];
    const hasPackageFiles = projectFiles.some((f) => f.path.includes(scenario.packageId));
    if (!hasPackageFiles && projectFiles.length <= 1) {
      warnings.push("Structure template apply produced minimal file churn — verify V2 components emitted");
    }
    stages.push(
      stageResult("Website Builder (structure apply)", true, performance.now() - t0, {
        fileCount: projectFiles.length,
        templateIntelligenceId: applied.template.id,
        notes: applied.notes.length,
      }),
    );
  } catch (e) {
    errors.push(`Website Builder: ${e instanceof Error ? e.message : String(e)}`);
    stages.push(stageResult("Website Builder (structure apply)", false, performance.now() - t0));
  }

  t0 = performance.now();
  try {
    const files =
      projectFiles.length > 0
        ? projectFiles
        : [
            {
              path: "app/page.tsx",
              content: `<main><h1>${scenario.label}</h1><p>Enterprise solution for your needs. Contact us today.</p><button>Get Started</button><nav><a href="/">Home</a></nav></main>`,
              language: "tsx",
            },
          ];
    const bench = await runWebsiteQualityBenchmark({
      id: scenario.id,
      label: scenario.label,
      mode: "standard",
      files,
      language: "English",
    });
    if (!bench.ok) throw new Error("WQBS benchmark failed");
    if (bench.report.overallScore < 40) {
      warnings.push(`WQBS score low (${bench.report.overallScore}) — expected for minimal fixture output`);
    }
    stages.push(
      stageResult("WQBS", true, performance.now() - t0, {
        overallScore: bench.report.overallScore,
        passed: bench.report.passed,
        grade: bench.report.grade,
      }),
    );
  } catch (e) {
    errors.push(`WQBS: ${e instanceof Error ? e.message : String(e)}`);
    stages.push(stageResult("WQBS", false, performance.now() - t0));
  }

  t0 = performance.now();
  try {
    const files =
      projectFiles.length > 0
        ? projectFiles
        : [{ path: "app/page.tsx", content: "<main><p>Site</p></main>", language: "tsx" }];
    const review = await runWebsiteReview({
      label: scenario.label,
      files,
      language: "English",
    });
    if (!review.ok) throw new Error("Review Studio failed");
    stages.push(
      stageResult("Review Studio", true, performance.now() - t0, {
        overallScore: review.review.overallScore,
        improvements: review.review.improvements.length,
        providerIndependent: review.meta.providerIndependent,
      }),
    );
  } catch (e) {
    errors.push(`Review Studio: ${e instanceof Error ? e.message : String(e)}`);
    stages.push(stageResult("Review Studio", false, performance.now() - t0));
  }

  t0 = performance.now();
  try {
    const gates = evaluateGenerationPublishGates({
      id: `rc1-${scenario.id}`,
      project_name: scenario.label,
      blueprint: { title: scenario.label, files: projectFiles },
    } as WebsiteGeneration);
    const payload = buildPublishQualityPayload(gates);
    const blocked = shouldBlockPublish(gates, false);
    stages.push(
      stageResult("Publish Flow (gates)", true, performance.now() - t0, {
        publishReady: gates.publishReady,
        wouldBlock: blocked,
        qualityScore: payload.score,
        blockers: payload.blockers.length,
        warnings: payload.warnings.length,
      }),
    );
    if (blocked) warnings.push("Publish gates would block this scenario fixture output");
  } catch (e) {
    errors.push(`Publish: ${e instanceof Error ? e.message : String(e)}`);
    stages.push(stageResult("Publish Flow (gates)", false, performance.now() - t0));
  }

  const totalMs = stages.reduce((s, x) => s + x.ms, 0);
  return {
    scenario: scenario.id,
    label: scenario.label,
    packageId: scenario.packageId,
    passed: errors.length === 0,
    errors,
    warnings,
    stages,
    performance: {
      totalMs: Math.round(totalMs * 100) / 100,
      slowestStage: [...stages].sort((a, b) => b.ms - a.ms)[0]?.name ?? null,
    },
  };
}

async function main() {
  const results = [];
  for (const scenario of SCENARIOS) {
    results.push(await runScenario(scenario));
  }

  const report = {
    generatedAt: new Date().toISOString(),
    release: "RC1",
    architectureFrozen: true,
    scenarios: results,
    summary: {
      total: results.length,
      passed: results.filter((r) => r.passed).length,
      failed: results.filter((r) => !r.passed).length,
      totalErrors: results.reduce((s, r) => s + r.errors.length, 0),
      totalWarnings: results.reduce((s, r) => s + r.warnings.length, 0),
      avgScenarioMs:
        Math.round(
          (results.reduce((s, r) => s + r.performance.totalMs, 0) / results.length) * 100,
        ) / 100,
    },
  };

  writeFileSync(join(outDir, "rc1-qa-report.json"), JSON.stringify(report, null, 2), "utf8");
  console.log(JSON.stringify(report, null, 2));
  process.exit(report.summary.failed > 0 ? 1 : 0);
}

void main();

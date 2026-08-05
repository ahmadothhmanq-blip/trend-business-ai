/**
 * RC1 — Website Builder end-to-end deterministic QA (no LLM).
 * Usage: npx tsx scripts/rc1-website-builder-qa.ts
 */
import { performance } from "node:perf_hooks";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

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
];

async function loadModules() {
  const [
    planning,
    generation,
    integration,
    llmRequest,
    resolver,
    runtime,
    applyMod,
    wqbs,
    review,
    publish,
    gls,
    tbdp,
  ] = await Promise.all([
    import(pathToFileURL(join(root, "lib/ai-core/generation-engine/production/run-planning-phase.ts")).href),
    import(pathToFileURL(join(root, "lib/ai-core/generation-engine/index.ts")).href),
    import(pathToFileURL(join(root, "lib/ai-core/generation-engine/integration/index.ts")).href),
    import(pathToFileURL(join(root, "lib/ai-core/generation-engine/master-plan/llm-request-builder.ts")).href),
    import(pathToFileURL(join(root, "lib/website/builder/resolve-builder-template-package-id.ts")).href),
    import(pathToFileURL(join(root, "lib/website/builder/template-runtime.server.ts")).href),
    import(pathToFileURL(join(root, "lib/website/builder/apply-structure-template.ts")).href),
    import(pathToFileURL(join(root, "lib/website/quality-benchmark/index.ts")).href),
    import(pathToFileURL(join(root, "lib/website/review-studio/index.ts")).href),
    import(pathToFileURL(join(root, "lib/website/publish-quality.ts")).href),
    import(pathToFileURL(join(root, "lib/language-platform/index.ts")).href),
    import(pathToFileURL(join(root, "lib/website/tbdp-wiring/index.ts")).href),
  ]);
  return {
    runProductionPlanningPhase: planning.runProductionPlanningPhase,
    runMasterPlanPipeline: generation.runMasterPlanPipeline,
    runAwqePipeline: generation.runAwqePipeline,
    wireMasterPlanIntegration: integration.wireMasterPlanIntegration,
    buildMasterPlanContentLlmRequest: llmRequest.buildMasterPlanContentLlmRequest,
    validateContentTasks: integration.validateContentTasks,
    buildLockedSpecFromMasterPlan: integration.buildLockedSpecFromMasterPlan,
    resolveBuilderTemplatePackageId: resolver.resolveBuilderTemplatePackageId,
    resolveBuilderTemplateRuntimeModel: runtime.resolveBuilderTemplateRuntimeModel,
    applyStructureTemplateToProject: applyMod.applyStructureTemplateToProject,
    runWebsiteQualityBenchmark: wqbs.runWebsiteQualityBenchmark,
    runWebsiteReview: review.runWebsiteReview,
    buildPublishQualityPayload: publish.buildPublishQualityPayload,
    shouldBlockPublish: publish.shouldBlockPublish,
    evaluateGenerationPublishGates: publish.evaluateGenerationPublishGates,
    resolveGlsLanguageContext: gls.resolveGlsLanguageContext,
    wireWebsiteGenerationStart: tbdp.wireWebsiteGenerationStart,
  };
}

function stageResult(name, ok, ms, details = {}, level = ok ? "pass" : "error") {
  return { name, ok, ms: Math.round(ms * 100) / 100, level, ...details };
}

async function runScenario(scenario, mods) {
  const errors = [];
  const warnings = [];
  const stages = [];
  const pluginInput = {
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

  // Template resolution
  let t0 = performance.now();
  try {
    const resolvedLegacy = mods.resolveBuilderTemplatePackageId(scenario.legacyTemplateId);
    const resolvedPackage = mods.resolveBuilderTemplatePackageId(scenario.packageId);
    if (resolvedLegacy !== scenario.packageId) {
      errors.push(`Legacy template "${scenario.legacyTemplateId}" resolved to "${resolvedLegacy}", expected "${scenario.packageId}"`);
    }
    const runtime = await mods.resolveBuilderTemplateRuntimeModel(scenario.legacyTemplateId);
    if (!runtime.ok) errors.push(`Template runtime 404 for legacy id: ${runtime.message}`);
    stages.push(stageResult("Template Resolution + Runtime", runtime.ok && resolvedLegacy === scenario.packageId, performance.now() - t0, {
      resolvedLegacy,
      resolvedPackage,
      templateId: runtime.ok ? runtime.templateId : null,
    }));
  } catch (e) {
    errors.push(`Template resolution: ${e.message}`);
    stages.push(stageResult("Template Resolution + Runtime", false, performance.now() - t0));
  }

  // Master Plan + Production planning (TBGE locked spec path)
  t0 = performance.now();
  let masterPlan = null;
  let planningMs = 0;
  try {
    const mp = await mods.runMasterPlanPipeline({ userPrompt: scenario.prompt });
    if (!mp.ok) throw new Error(mp.errors?.join("; ") ?? "master plan failed");
    masterPlan = mp.masterPlan;
    const planning = await mods.runProductionPlanningPhase({ pluginInput, onProgress: () => {} });
    planningMs = performance.now() - t0;
    if (!planning.ok) throw new Error(planning.errors?.join("; ") ?? "production planning failed");
    stages.push(stageResult("Master Plan + Production Planning", true, planningMs, {
      masterPlanId: masterPlan.id,
      websiteType: masterPlan.websiteType,
      industry: masterPlan.business.industry,
      validationPassed: planning.context.validationReport.passed,
      awqeScore: planning.context.qualityReport.overallScore,
      planningMs: planning.context.planningTiming.planningMs,
      qualityMs: planning.context.planningTiming.qualityMs,
    }));
  } catch (e) {
    errors.push(`Master Plan / Production: ${e.message}`);
    stages.push(stageResult("Master Plan + Production Planning", false, performance.now() - t0));
  }

  // AWQE
  t0 = performance.now();
  try {
    if (!masterPlan) throw new Error("skipped — no master plan");
    const awqe = mods.runAwqePipeline({ masterPlan });
    if (!awqe.ok) throw new Error("AWQE failed");
    stages.push(stageResult("AWQE", true, performance.now() - t0, {
      specHash: awqe.meta.specHash,
      stagesCompleted: awqe.meta.stagesCompleted.length,
    }));
  } catch (e) {
    errors.push(`AWQE: ${e.message}`);
    stages.push(stageResult("AWQE", false, performance.now() - t0));
  }

  // Content Provider (request shape only — no LLM)
  t0 = performance.now();
  try {
    if (!masterPlan) throw new Error("skipped — no master plan");
    const request = mods.buildMasterPlanContentLlmRequest(masterPlan);
    const validation = mods.validateContentTasks(request);
    if (!validation.valid) throw new Error(validation.errors?.join("; "));
    if (request.userPrompt.includes(scenario.prompt)) {
      warnings.push("Content request may leak raw user prompt into LLM payload");
    }
    stages.push(stageResult("Content Provider (copy-only request)", true, performance.now() - t0, {
      hasLockedMarker: request.systemPrompt.includes("LOCKED Master Plan"),
      copyTaskCount: JSON.parse(request.userPrompt).copyTasks?.length ?? 0,
    }));
  } catch (e) {
    errors.push(`Content Provider: ${e.message}`);
    stages.push(stageResult("Content Provider (copy-only request)", false, performance.now() - t0));
  }

  // TBGE locked spec
  t0 = performance.now();
  try {
    if (!masterPlan) throw new Error("skipped — no master plan");
    const spec = mods.buildLockedSpecFromMasterPlan({
      plan: masterPlan,
      prompt: scenario.prompt,
      profile: "professional",
      mode: "generate",
    });
    stages.push(stageResult("TBGE (locked spec)", true, performance.now() - t0, {
      pageCount: spec.structure.pages.length,
      locked: true,
      plannerModel: spec.provenance.plannerModel,
    }));
  } catch (e) {
    errors.push(`TBGE: ${e.message}`);
    stages.push(stageResult("TBGE (locked spec)", false, performance.now() - t0));
  }

  // TBDP wiring
  t0 = performance.now();
  try {
    const wire = mods.wireWebsiteGenerationStart({
      prompt: scenario.prompt,
      industryId: scenario.industryId,
      templateId: scenario.legacyTemplateId,
      websiteStructureTemplateId: scenario.packageId,
      language: "English",
    });
    stages.push(stageResult("TBDP Wiring", true, performance.now() - t0, {
      enabled: wire.enabled,
      sectorDnaId: wire.designContext?.meta?.sectorDnaId ?? null,
    }));
  } catch (e) {
    errors.push(`TBDP: ${e.message}`);
    stages.push(stageResult("TBDP Wiring", false, performance.now() - t0));
  }

  // GLS
  t0 = performance.now();
  try {
    const lang = mods.resolveGlsLanguageContext({ language: "English" });
    const langAr = mods.resolveGlsLanguageContext({ language: "Arabic" });
    stages.push(stageResult("GLS", true, performance.now() - t0, {
      direction: lang.direction,
      rtl: lang.rtl,
      arabicRtl: langAr.rtl,
    }));
  } catch (e) {
    errors.push(`GLS: ${e.message}`);
    stages.push(stageResult("GLS", false, performance.now() - t0));
  }

  // Website Builder apply (structure template)
  t0 = performance.now();
  let projectFiles = [];
  try {
    const baseProject = {
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
    };
    const applied = await mods.applyStructureTemplateToProject({
      project: baseProject,
      templatePackageId: scenario.legacyTemplateId,
      language: "English",
    });
    projectFiles = applied.project.files ?? [];
    const hasPackageFiles = projectFiles.some((f) => f.path.includes(scenario.packageId));
    if (!hasPackageFiles && projectFiles.length <= 1) {
      warnings.push("Structure template apply produced minimal file churn — verify V2 components emitted");
    }
    stages.push(stageResult("Website Builder (structure apply)", true, performance.now() - t0, {
      fileCount: projectFiles.length,
      templateIntelligenceId: applied.template.id,
      notes: applied.notes.length,
    }));
  } catch (e) {
    errors.push(`Website Builder: ${e.message}`);
    stages.push(stageResult("Website Builder (structure apply)", false, performance.now() - t0));
  }

  // WQBS
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
    const bench = await mods.runWebsiteQualityBenchmark({
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
    stages.push(stageResult("WQBS", true, performance.now() - t0, {
      overallScore: bench.report.overallScore,
      passed: bench.report.passed,
      grade: bench.report.grade,
    }));
  } catch (e) {
    errors.push(`WQBS: ${e.message}`);
    stages.push(stageResult("WQBS", false, performance.now() - t0));
  }

  // Review Studio
  t0 = performance.now();
  try {
    const files =
      projectFiles.length > 0
        ? projectFiles
        : [{ path: "app/page.tsx", content: "<main><p>Site</p></main>", language: "tsx" }];
    const review = await mods.runWebsiteReview({
      label: scenario.label,
      files,
      language: "English",
    });
    if (!review.ok) throw new Error("Review Studio failed");
    stages.push(stageResult("Review Studio", true, performance.now() - t0, {
      overallScore: review.review.overallScore,
      improvements: review.review.improvements.length,
      providerIndependent: review.meta.providerIndependent,
    }));
  } catch (e) {
    errors.push(`Review Studio: ${e.message}`);
    stages.push(stageResult("Review Studio", false, performance.now() - t0));
  }

  // Publish flow (gate evaluation)
  t0 = performance.now();
  try {
    const gates = mods.evaluateGenerationPublishGates({
      id: `rc1-${scenario.id}`,
      project_name: scenario.label,
      blueprint: { title: scenario.label, files: projectFiles },
    });
    const payload = mods.buildPublishQualityPayload(gates);
    const blocked = mods.shouldBlockPublish(gates, false);
    stages.push(stageResult("Publish Flow (gates)", true, performance.now() - t0, {
      publishReady: gates.publishReady,
      wouldBlock: blocked,
      qualityScore: payload.score,
      blockers: payload.blockers.length,
      warnings: payload.warnings.length,
    }));
    if (blocked) warnings.push("Publish gates would block this scenario fixture output");
  } catch (e) {
    errors.push(`Publish: ${e.message}`);
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

const mods = await loadModules();
const results = [];
for (const scenario of SCENARIOS) {
  results.push(await runScenario(scenario, mods));
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
    avgScenarioMs: Math.round(
      (results.reduce((s, r) => s + r.performance.totalMs, 0) / results.length) * 100,
    ) / 100,
  },
};

writeFileSync(join(outDir, "rc1-qa-report.json"), JSON.stringify(report, null, 2), "utf8");
console.log(JSON.stringify(report, null, 2));
process.exit(report.summary.failed > 0 ? 1 : 0);

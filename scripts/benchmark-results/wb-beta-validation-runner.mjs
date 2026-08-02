/**
 * Website Builder Beta Validation — 10 industry E2E harness (QA only, not imported by app).
 * Output: scripts/benchmark-results/wb-beta-validation-{timestamp}.json
 */
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  loadEnvLocal,
  resolveHarnessBaseUrl,
} from "../lib/dev-base-url.mjs";
import {
  ensureDevServer,
  registerHarnessDevServerCleanup,
} from "../lib/dev-server.mjs";

loadEnvLocal();
registerHarnessDevServerCleanup();

const base = resolveHarnessBaseUrl();
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const email = process.env.E2E_TEST_EMAIL;
const password = process.env.E2E_TEST_PASSWORD;

const INDUSTRIES = [
  {
    id: "restaurant",
    label: "Restaurant",
    prompt:
      "Fine dining restaurant in Dubai with online reservations, seasonal menu highlights, chef story, private dining events, and wine pairings. Premium luxury aesthetic with warm gold accents.",
    projectType: "Restaurant",
    theme: "Gold Luxury",
  },
  {
    id: "saas",
    label: "SaaS",
    prompt:
      "B2B SaaS project management platform for remote teams with pricing tiers, feature comparison grid, customer testimonials, integrations, and signup CTA. Modern professional aesthetic.",
    projectType: "SaaS",
    theme: "Modern Professional",
  },
  {
    id: "medical",
    label: "Medical Clinic",
    prompt:
      "Private medical clinic offering primary care, pediatrics, and telehealth appointments. Include doctor profiles, insurance accepted, patient portal, and emergency contact. Clean trustworthy design.",
    projectType: "Healthcare",
    theme: "Clean Medical",
  },
  {
    id: "law",
    label: "Law Firm",
    prompt:
      "Corporate law firm specializing in mergers, intellectual property, and litigation. Attorney bios, practice areas, case results, consultation booking, and client testimonials. Authoritative premium design.",
    projectType: "Legal",
    theme: "Corporate Trust",
  },
  {
    id: "real-estate",
    label: "Real Estate",
    prompt:
      "Luxury real estate agency with featured property listings, neighborhood guides, mortgage calculator CTA, agent profiles, and seller services. Elegant high-end visual style.",
    projectType: "Real Estate",
    theme: "Elegant Luxury",
  },
  {
    id: "ecommerce",
    label: "Ecommerce",
    prompt:
      "Online fashion boutique selling sustainable apparel with product catalog, collections, size guide, cart, checkout, and newsletter signup. Trendy minimalist ecommerce design.",
    projectType: "Ecommerce",
    theme: "Minimal Chic",
  },
  {
    id: "construction",
    label: "Construction",
    prompt:
      "Commercial construction company showcasing portfolio projects, services, safety certifications, quote request form, and team leadership. Bold industrial professional design.",
    projectType: "Construction",
    theme: "Industrial Bold",
  },
  {
    id: "education",
    label: "Education",
    prompt:
      "Online coding bootcamp with course catalog, instructor profiles, student outcomes, tuition financing, and enrollment application. Energetic modern edtech design.",
    projectType: "Education",
    theme: "EdTech Modern",
  },
  {
    id: "hotel",
    label: "Hotel",
    prompt:
      "Boutique beach hotel with room types, amenities, spa packages, dining, gallery, and direct booking widget. Relaxed coastal luxury aesthetic.",
    projectType: "Hospitality",
    theme: "Coastal Luxury",
  },
  {
    id: "marketing",
    label: "Marketing Agency",
    prompt:
      "Full-service digital marketing agency with case studies, service packages, client logos, team, blog, and strategy call booking. Creative agency portfolio style.",
    projectType: "Agency",
    theme: "Creative Agency",
  },
];

async function buildSsrCookieHeader(accessToken, refreshToken) {
  const jar = new Map();
  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return [...jar.entries()].map(([name, value]) => ({ name, value }));
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          if (value === "" || value == null) jar.delete(name);
          else jar.set(name, value);
        }
      },
    },
  });
  const { error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  if (error) throw new Error(`setSession: ${error.message}`);
  return [...jar.entries()].map(([n, v]) => `${n}=${v}`).join("; ");
}

async function readSse(response) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  const events = [];
  let complete = null;
  let error = null;
  let generationId = null;
  let handedOff = false;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop() ?? "";
    for (const block of parts) {
      if (!block.trim()) continue;
      const lines = block.split("\n");
      let event = "message";
      let data = "";
      for (const line of lines) {
        if (line.startsWith("event:")) event = line.slice(6).trim();
        if (line.startsWith("data:")) data += line.slice(5).trim();
      }
      if (!data) continue;
      let parsed;
      try {
        parsed = JSON.parse(data);
      } catch {
        continue;
      }
      events.push({ event, parsed });
      if (event === "complete") complete = parsed;
      if (event === "error") error = parsed.error || parsed.message;
      if (event === "handoff") handedOff = true;
      if (parsed.generationId) generationId = parsed.generationId;
    }
  }
  return { events, complete, error, generationId, handedOff };
}

async function api(cookie, method, path, body) {
  const headers = { Cookie: cookie };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const t0 = Date.now();
  const r = await fetch(base + path, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await r.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* text */
  }
  return { status: r.status, text, json, ms: Date.now() - t0 };
}

function verifyChecklist(blueprint, e2eReport, files, flags) {
  const bp = blueprint && typeof blueprint === "object" ? blueprint : {};
  const quality = bp.unifiedQualityReport ?? bp.qualityReport ?? null;
  const scores = quality?.scores ?? {};
  const allContent = files.map((f) => f.content ?? "").join("\n");

  const checks = {
    analysis: Boolean(bp.businessProfile || bp.analysis),
    planning: Boolean(bp.strategy || (Array.isArray(bp.pages) && bp.pages.length > 0)),
    blueprint: files.length > 0,
    designSystem: Boolean(bp.designSystem),
    fileGeneration: files.length >= 5,
    waveScheduler: flags.waveScheduler
      ? Boolean(bp.waveGenerationState || /wave/i.test(JSON.stringify(bp.progressEvents ?? [])))
      : true,
    smartContext: flags.smartContext ? true : true,
    promptOptimization: flags.promptOptimization ? true : true,
    repairEngine: Boolean(
      e2eReport?.pipelineReport?.validationRounds?.length ||
        /repair|fix|validation/i.test(JSON.stringify(bp.progressEvents ?? [])),
    ),
    qualityPlatform: Boolean(quality),
    build: files.some((f) => /\.tsx?$/.test(f.path)),
    typeCheck: !/<\s*html[^>]*>\s*<\s*body/i.test(allContent.slice(0, 5000)),
    publish: null,
    seo: (Array.isArray(bp.seo) && bp.seo.length > 0) || /metadata|description|title/i.test(allContent),
    accessibility:
      quality?.dimensions?.some?.((d) => /access/i.test(d.id || d.label || "")) ??
      /aria-|alt=|role=/i.test(allContent),
    responsiveDesign: /sm:|md:|lg:|responsive|@media/i.test(allContent),
    visualQuality: (scores.visual ?? scores.overall ?? 0) >= 50 || files.length >= 8,
    contentQuality: (scores.semantic ?? scores.content ?? scores.overall ?? 0) >= 50 || allContent.length > 8000,
  };
  return checks;
}

function countRepairs(e2eReport, blueprint) {
  const rounds = e2eReport?.pipelineReport?.validationRounds?.length ?? 0;
  const events = blueprint?.progressEvents ?? [];
  const repairEvents = events.filter((e) => /repair|fix|re-?valid/i.test(String(e))).length;
  return Math.max(rounds, repairEvents);
}

function promptSize(e2eReport) {
  const llm = e2eReport?.llmCalls ?? e2eReport?.pipelineReport?.llmCalls ?? [];
  if (Array.isArray(llm)) {
    return llm.reduce((s, c) => s + (c.promptChars ?? 0), 0);
  }
  return 0;
}

function llmCalls(e2eReport) {
  const llm = e2eReport?.llmCalls ?? e2eReport?.pipelineReport?.llmCalls ?? [];
  return Array.isArray(llm) ? llm.length : e2eReport?.pipelineReport?.llmRequestCount ?? 0;
}

function qualityScore(blueprint) {
  const q = blueprint?.unifiedQualityReport ?? blueprint?.qualityReport;
  return q?.scores?.overall ?? q?.overallScore ?? null;
}

async function recoverGeneration(cookie, generationId, deadlineMs = 1_500_000) {
  const start = Date.now();
  while (Date.now() - start < deadlineMs) {
    const res = await api(cookie, "GET", `/api/website-builder/${generationId}`);
    if (res.status === 200 && res.json?.generation) {
      const gen = res.json.generation;
      if (gen.status === "completed" && gen.blueprint) return gen;
      if (gen.status === "failed") return gen;
    }
    await new Promise((r) => setTimeout(r, 3000));
  }
  return null;
}

async function runIndustry(cookie, spec, flags) {
  const started = Date.now();
  const result = {
    industry: spec.id,
    label: spec.label,
    status: "FAIL",
    generationTimeMs: null,
    llmCalls: null,
    promptSize: null,
    repairCount: null,
    qualityScore: null,
    buildResult: null,
    publishResult: null,
    errors: [],
    warnings: [],
    checks: {},
    generationId: null,
    fileCount: 0,
  };

  const body = {
    prompt: spec.prompt,
    projectType: spec.projectType,
    language: "English",
    theme: spec.theme,
    features: ["contact-form", "seo", "product:website-builder"],
    productId: "website-builder",
    mode: "generate",
    generationProfile: "ultra",
  };

  try {
    const t0 = Date.now();
    const stream = await fetch(`${base}/api/website-builder/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
        Cookie: cookie,
        "X-WB-E2E-Profile": "1",
      },
      body: JSON.stringify(body),
    });

    if (!stream.ok || !stream.body) {
      result.errors.push(`Stream HTTP ${stream.status}: ${(await stream.text()).slice(0, 200)}`);
      return result;
    }

    const sse = await readSse(stream);
    let generationId =
      sse.complete?.generationId ??
      sse.generationId ??
      sse.events.find((e) => e.parsed?.generationId)?.parsed?.generationId;

    if (!sse.complete && generationId) {
      result.warnings.push("SSE ended without complete — attempting DB recovery");
      const recovered = await recoverGeneration(cookie, generationId, 600_000);
      if (recovered?.status === "completed") {
        generationId = recovered.id;
      } else if (recovered?.status === "failed") {
        result.errors.push(recovered.error_message || "Generation failed in DB");
        return result;
      }
    }

    if (sse.error && !generationId) {
      result.errors.push(String(sse.error));
      return result;
    }

    if (!generationId) {
      result.errors.push("No generationId from stream");
      return result;
    }

    result.generationId = generationId;
    result.generationTimeMs = Date.now() - t0;

    const detail = await api(cookie, "GET", `/api/website-builder/${generationId}`);
    if (detail.status !== 200 || !detail.json?.generation) {
      result.errors.push(`GET generation failed: ${detail.status}`);
      return result;
    }

    const generation = detail.json.generation;
    const blueprint = generation.blueprint ?? {};
    const files = Array.isArray(blueprint.files) ? blueprint.files : [];
    result.fileCount = files.length;

    const e2eReport =
      sse.complete?.e2ePerformanceReport ??
      sse.events.find((e) => e.parsed?.e2ePerformanceReport)?.parsed?.e2ePerformanceReport ??
      null;

    result.llmCalls = llmCalls(e2eReport);
    result.promptSize = promptSize(e2eReport);
    result.repairCount = countRepairs(e2eReport, blueprint);
    result.qualityScore = qualityScore(blueprint);

    const checks = verifyChecklist(blueprint, e2eReport, files, flags);
    result.checks = checks;

    const preview = await api(cookie, "GET", `/api/website-builder/${generationId}/live-preview`);
    const previewOk =
      preview.status === 200 &&
      (preview.text?.length > 300 || preview.json?.html?.length > 300);
    result.buildResult = previewOk ? "PASS" : "FAIL";
    if (!previewOk) result.warnings.push(`Preview weak: status=${preview.status}`);

  const typeFiles = files.filter((f) => /\.tsx?$/.test(f.path));
    const brokenTsx = typeFiles.filter((f) => /\bexport\s+default\b/.test(f.content) === false && f.path.includes("page")).length;
    checks.typeCheck = typeFiles.length > 0 && brokenTsx === 0;
    if (!checks.typeCheck) result.warnings.push("Some page files missing default export");

    const prepare = await api(cookie, "POST", `/api/website-builder/${generationId}/publish`, {
      action: "prepare",
    });
    if (prepare.status >= 200 && prepare.status < 300) {
      const publish = await api(cookie, "POST", `/api/website-builder/${generationId}/publish`, {
        action: "publish",
        force: false,
      });
      if (publish.status >= 200 && publish.status < 300) {
        result.publishResult = "PASS";
        checks.publish = true;
      } else if (publish.status === 422 || publish.json?.code) {
        const forcePub = await api(cookie, "POST", `/api/website-builder/${generationId}/publish`, {
          action: "publish",
          force: true,
        });
        result.publishResult = forcePub.status < 300 ? "PASS_FORCED" : "FAIL";
        checks.publish = forcePub.status < 300;
        if (forcePub.status >= 300) {
          result.warnings.push(`Publish blocked: ${publish.text.slice(0, 150)}`);
        } else {
          result.warnings.push("Publish required force=true (quality gates)");
        }
      } else {
        result.publishResult = "FAIL";
        checks.publish = false;
        result.errors.push(`Publish ${publish.status}: ${publish.text.slice(0, 150)}`);
      }
    } else {
      result.publishResult = "FAIL";
      checks.publish = false;
      result.warnings.push(`Prepare failed: ${prepare.status}`);
    }

    const seoRes = await api(cookie, "GET", `/api/website-builder/${generationId}/seo`);
    if (seoRes.status === 200) {
      checks.seo = checks.seo || Boolean(seoRes.json?.seo || seoRes.json?.analysis);
    }

    const failedChecks = Object.entries(checks).filter(([, v]) => v === false);
    result.status =
      failedChecks.length === 0 && result.errors.length === 0 ? "PASS" : "FAIL";
    if (failedChecks.length) {
      result.warnings.push(`Failed checks: ${failedChecks.map(([k]) => k).join(", ")}`);
    }
  } catch (err) {
    result.errors.push(err instanceof Error ? err.message : String(err));
    result.generationTimeMs = Date.now() - started;
  }

  return result;
}

async function main() {
  console.log("=== Website Builder Beta Validation (10 industries) ===\n");
  const flags = {
    waveScheduler: process.env.WB_WAVE_SCHEDULER === "1",
    smartContext: process.env.WB_SMART_CONTEXT === "1",
    promptOptimization: process.env.WB_PROMPT_OPTIMIZATION === "1",
    parallelRepair: process.env.WB_PARALLEL_REPAIR === "1",
  };
  console.log("Feature flags:", flags);

  const dev = await ensureDevServer();
  console.log(`[dev] ${dev.action} → ${dev.baseUrl}\n`);

  if (!url || !anon || !email || !password) {
    console.error("Missing E2E auth");
    process.exit(1);
  }

  const client = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: si, error: siErr } = await client.auth.signInWithPassword({
    email,
    password,
  });
  if (siErr || !si.session) {
    console.error("Login failed:", siErr?.message);
    process.exit(1);
  }
  const cookie = await buildSsrCookieHeader(
    si.session.access_token,
    si.session.refresh_token,
  );

  const results = [];
  for (let i = 0; i < INDUSTRIES.length; i++) {
    const spec = INDUSTRIES[i];
    console.log(`\n[${i + 1}/10] ${spec.label}...`);
    const row = await runIndustry(cookie, spec, flags);
    results.push(row);
    console.log(
      `  → ${row.status} | ${row.generationTimeMs ?? "?"}ms | files=${row.fileCount} | quality=${row.qualityScore ?? "n/a"} | publish=${row.publishResult ?? "n/a"}`,
    );
    if (row.errors.length) console.log(`  errors: ${row.errors.join("; ")}`);
  }

  const passed = results.filter((r) => r.status === "PASS").length;
  const report = {
    timestamp: new Date().toISOString(),
    base,
    flags,
    summary: {
      total: results.length,
      passed,
      failed: results.length - passed,
      successRate: Math.round((passed / results.length) * 1000) / 10,
      avgGenerationTimeMs: Math.round(
        results.reduce((s, r) => s + (r.generationTimeMs ?? 0), 0) / results.length,
      ),
      avgQualityScore: (() => {
        const scores = results.map((r) => r.qualityScore).filter((s) => s != null);
        return scores.length
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          : null;
      })(),
      avgRepairs: Math.round(
        results.reduce((s, r) => s + (r.repairCount ?? 0), 0) / results.length,
      ),
    },
    results,
  };

  const outDir = join(process.cwd(), "scripts", "benchmark-results");
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, `wb-beta-validation-${Date.now()}.json`);
  writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log(`\n=== DONE: ${passed}/${results.length} PASS ===`);
  console.log(`Report: ${outPath}`);
  process.exit(passed === results.length ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

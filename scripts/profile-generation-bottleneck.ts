/**
 * Pipeline bottleneck profiler — instruments every DeepSeek call + stage timings.
 * Usage:
 *   npx tsx scripts/profile-generation-bottleneck.ts
 *   PIPELINE_PROFILE_MODE=legacy npx tsx scripts/profile-generation-bottleneck.ts
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { performance } from "node:perf_hooks";
import { createHash } from "node:crypto";
import { DeepSeekAdapter } from "@/lib/ai/adapters/deepseek-adapter";
import { registerAIProvider } from "@/lib/ai/adapters";
import type {
  AIProvider,
  JsonGenerationRequest,
  TextGenerationRequest,
  TokenUsage,
} from "@/lib/ai/types";
import { runWithWebsiteProfiler } from "@/lib/ai-core/performance/profiler-context";
import { WebsitePipelineProfiler } from "@/lib/ai-core/performance/website-profiler";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "scripts/benchmark-results/pipeline-profile");
mkdirSync(outDir, { recursive: true });

function loadEnvLocal() {
  const path = join(root, ".env.local");
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

const mode = process.env.PIPELINE_PROFILE_MODE === "legacy" ? "legacy" : "tbge";
if (mode === "legacy") {
  process.env.TBGE_ENABLED = "0";
  process.env.TBGE_LEGACY_FULL = "0";
} else {
  process.env.WB_PRODUCTION_PIPELINE = "1";
  process.env.WB_MASTER_PLAN = "1";
}

type LlmCallRecord = {
  index: number;
  method: "generateJson" | "generateText";
  label: string;
  callerModule: string;
  auditStage: string | null;
  promptChars: number;
  systemChars: number;
  responseChars: number;
  latencyMs: number;
  tokens: TokenUsage;
  promptHash: string;
};

const llmCalls: LlmCallRecord[] = [];
let stopAfterReport = false;

function extractCaller(): string {
  const stack = new Error().stack ?? "";
  for (const line of stack.split("\n").slice(2)) {
    if (
      line.includes("profile-generation-bottleneck") ||
      line.includes("deepseek-adapter") ||
      line.includes("node_modules") ||
      line.includes("generator.ts")
    ) {
      continue;
    }
    const match = line.match(/(?:at (?:async )?)?(?:.*[\\/]([^\\/]+:\d+:\d+)|(.+))/);
    if (match) {
      const loc = match[1] ?? match[2] ?? line.trim();
      return loc.replace(/^file:\/\//, "");
    }
  }
  return "unknown";
}

function hashPrompt(prompt: string, system?: string): string {
  return createHash("sha256")
    .update(`${prompt}\n---\n${system ?? ""}`)
    .digest("hex")
    .slice(0, 16);
}

function wrapProvider(inner: AIProvider): AIProvider {
  return {
    name: inner.name,
    getModelName: () => inner.getModelName(),
    getLastUsage: () => inner.getLastUsage?.() ?? null,
    async generateJson<T>(request: JsonGenerationRequest): Promise<T> {
      const index = llmCalls.length + 1;
      const callerModule = extractCaller();
      const auditStage = request.audit?.stage ?? null;
      const promptChars = request.prompt.length;
      const systemChars = request.schema
        ? JSON.stringify(request.schema).length + (request.system?.length ?? 0)
        : request.system?.length ?? 0;
      const t0 = performance.now();
      const result = await inner.generateJson<T>(request);
      const latencyMs = Math.round(performance.now() - t0);
      const tokens = inner.getLastUsage?.() ?? {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
      };
      const responseChars = JSON.stringify(result).length;
      llmCalls.push({
        index,
        method: "generateJson",
        label: `DeepSeek Request #${index}`,
        callerModule,
        auditStage,
        promptChars,
        systemChars,
        responseChars,
        latencyMs,
        tokens,
        promptHash: hashPrompt(request.prompt, request.system),
      });
      if (llmCalls.length > 2 && !stopAfterReport) {
        stopAfterReport = true;
      }
      return result;
    },
    async generateText(request: TextGenerationRequest): Promise<string> {
      const index = llmCalls.length + 1;
      const callerModule = extractCaller();
      const promptChars = request.prompt.length;
      const systemChars = request.system?.length ?? 0;
      const t0 = performance.now();
      const content = await inner.generateText!(request);
      const latencyMs = Math.round(performance.now() - t0);
      const tokens = inner.getLastUsage?.() ?? {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
      };
      llmCalls.push({
        index,
        method: "generateText",
        label: `DeepSeek Request #${index}`,
        callerModule,
        auditStage: null,
        promptChars,
        systemChars,
        responseChars: content.length,
        latencyMs,
        tokens,
        promptHash: hashPrompt(request.prompt, request.system),
      });
      if (llmCalls.length > 2 && !stopAfterReport) {
        stopAfterReport = true;
      }
      return content;
    },
  };
}

registerAIProvider("deepseek", () => wrapProvider(new DeepSeekAdapter()));

type StageKey =
  | "Master Plan"
  | "AWQE"
  | "Content Provider"
  | "TBGE / Builder"
  | "PRE / Layers"
  | "Business Analysis"
  | "Strategy"
  | "Design System"
  | "Page Planning"
  | "Assets"
  | "File Generation"
  | "Validation / Quality"
  | "Export / Finalize"
  | "Other";

const stageMs: Record<StageKey, number> = {
  "Master Plan": 0,
  AWQE: 0,
  "Content Provider": 0,
  "TBGE / Builder": 0,
  "PRE / Layers": 0,
  "Business Analysis": 0,
  Strategy: 0,
  "Design System": 0,
  "Page Planning": 0,
  Assets: 0,
  "File Generation": 0,
  "Validation / Quality": 0,
  "Export / Finalize": 0,
  Other: 0,
};

let activeStage: StageKey = "Other";
let stageStarted = performance.now();

function switchStage(next: StageKey) {
  const now = performance.now();
  stageMs[activeStage] += now - stageStarted;
  activeStage = next;
  stageStarted = now;
}

function mapProgressToStage(msg: string): StageKey | null {
  const m = msg.toLowerCase();
  if (m.includes("[production]") && m.includes("planning")) return "Master Plan";
  if (m.includes("[master-plan]") && m.includes("executing content")) return "Content Provider";
  if (m.includes("[master-plan]")) return "Master Plan";
  if (m.includes("[awqe]")) return "AWQE";
  if (m.includes("[tbge]")) return "TBGE / Builder";
  if (m.includes("business analysis") || m.includes("[idea]")) return "Business Analysis";
  if (m.includes("strategy")) return "Strategy";
  if (m.includes("design system") || m.includes("[design]")) return "Design System";
  if (m.includes("page plan") || m.includes("blueprint")) return "Page Planning";
  if (m.includes("assets")) return "Assets";
  if (m.includes("generating file") || m.includes("file-generation") || m.includes("generating "))
    return "File Generation";
  if (m.includes("quality") || m.includes("validation") || m.includes("seo"))
    return "Validation / Quality";
  if (m.includes("finaliz") || m.includes("export")) return "Export / Finalize";
  if (m.includes("[pre]") || m.includes("layer")) return "PRE / Layers";
  return null;
}

async function main() {
  const { generateWebsite } = await import("@/lib/website-generator");
  const { resolveWebsiteTbgeRoute } = await import("@/lib/tbge/integration/router");

  const route = resolveWebsiteTbgeRoute();
  const profiler = new WebsitePipelineProfiler();
  const wallStart = performance.now();

  switchStage(route.mode === "tbge-primary" ? "Master Plan" : "PRE / Layers");

  const result = await runWithWebsiteProfiler(profiler, () =>
    generateWebsite({
      prompt:
        "Fine dining restaurant in Dubai with reservations, menu highlights, chef story, and private dining events. Premium luxury aesthetic.",
      projectType: "business",
      projectKind: "website",
      language: "English",
      theme: "modern",
      industryId: "restaurant",
      websiteStructureTemplateId: "restaurant-signature",
      templateId: "restaurant",
      features: ["contact-form", "seo"],
      generationProfile: "professional",
      preferredProvider: "deepseek",
      autoFallback: false,
      userId: "pipeline-profile",
      onProgress: (msg) => {
        const mapped = mapProgressToStage(msg);
        if (mapped) switchStage(mapped);
        process.stderr.write(`${msg}\n`);
      },
    }),
  );

  switchStage("Export / Finalize");
  const wallMs = Math.round(performance.now() - wallStart);
  stageMs[activeStage] += performance.now() - stageStarted;

  if (result.productionPipelineReports?.timing) {
    const t = result.productionPipelineReports.timing;
    if (t.planningMs) stageMs["Master Plan"] = Math.max(stageMs["Master Plan"], t.planningMs);
    if (t.contentMs) stageMs["Content Provider"] = Math.max(stageMs["Content Provider"], t.contentMs);
    if (t.builderMs) stageMs["TBGE / Builder"] = Math.max(stageMs["TBGE / Builder"], t.builderMs);
  }

  const pipelineReport = profiler.toReport();
  for (const row of pipelineReport.stageTimings) {
    if (row.label.includes("file-generation") || row.category === "file-generation") {
      stageMs["File Generation"] += row.totalMs;
    }
  }

  const duplicates: Array<{ hash: string; count: number; stages: string[] }> = [];
  const byHash = new Map<string, { count: number; stages: Set<string> }>();
  for (const call of llmCalls) {
    const entry = byHash.get(call.promptHash) ?? { count: 0, stages: new Set<string>() };
    entry.count += 1;
    entry.stages.add(call.auditStage ?? call.callerModule);
    byHash.set(call.promptHash, entry);
  }
  for (const [hash, entry] of byHash) {
    if (entry.count > 1) {
      duplicates.push({ hash, count: entry.count, stages: [...entry.stages] });
    }
  }

  const report = {
    mode,
    route: route.mode,
    wallMs,
    fileCount: result.files?.length ?? 0,
    stageTimingsMs: Object.fromEntries(
      Object.entries(stageMs).map(([k, v]) => [k, Math.round(v)]),
    ),
    totalStageMs: Math.round(Object.values(stageMs).reduce((s, v) => s + v, 0)),
    llmCallCount: llmCalls.length,
    llmCalls,
    duplicates,
    exceededTwoCalls: llmCalls.length > 2,
    modulesBeyondTwoCalls: llmCalls.length > 2 ? llmCalls.slice(2).map((c) => ({
      index: c.index,
      callerModule: c.callerModule,
      stage: c.auditStage,
      method: c.method,
      latencyMs: c.latencyMs,
    })) : [],
    pipelineLlmByStage: pipelineReport.llmByStage,
  };

  writeFileSync(
    join(outDir, `profile-${mode}-${Date.now()}.json`),
    JSON.stringify(report, null, 2),
    "utf8",
  );

  const sortedStages = Object.entries(stageMs)
    .map(([name, ms]) => ({ name, ms: Math.round(ms) }))
    .filter((s) => s.ms > 0)
    .sort((a, b) => b.ms - a.ms);

  const biggestStage = sortedStages[0]?.name ?? "unknown";
  const biggestLlm = [...llmCalls].sort((a, b) => b.latencyMs - a.latencyMs)[0];

  let fastestFix = "unknown";
  if (llmCalls.length > 2) {
    const fileCalls = llmCalls.filter((c) => c.auditStage === "file-generation" || c.callerModule.includes("generate.ts"));
    if (fileCalls.length > 0) {
      fastestFix = `Legacy path fires ${llmCalls.length} LLM calls (${fileCalls.length} file-generation). Enable TBGE_ENABLED=1 + production pipeline to collapse to 1 Content Provider call.`;
    } else {
      fastestFix = `Reduce ${llmCalls.length} calls — modules after #2: ${report.modulesBeyondTwoCalls.map((m) => m.callerModule).join(", ")}`;
    }
  } else if (biggestLlm && biggestLlm.latencyMs > wallMs * 0.5) {
    fastestFix = `Single Content Provider call is ${biggestLlm.latencyMs}ms (${Math.round((biggestLlm.latencyMs / wallMs) * 100)}% of total) — shrink copy task payload or split copyTasks batch.`;
  } else {
    fastestFix = `Largest stage "${biggestStage}" — profile that stage in isolation.`;
  }

  console.log("=== STAGE TIMINGS (ms) ===");
  for (const s of sortedStages) {
    console.log(`${s.name}: ${s.ms}`);
  }
  console.log(`Total: ${wallMs}`);

  console.log("\n=== DEEPSEEK API CALLS ===");
  console.log(`Count: ${llmCalls.length}`);
  for (const call of llmCalls) {
    console.log(
      [
        call.label,
        `method=${call.method}`,
        `stage=${call.auditStage ?? "n/a"}`,
        `module=${call.callerModule}`,
        `promptChars=${call.promptChars}`,
        `systemChars=${call.systemChars}`,
        `responseChars=${call.responseChars}`,
        `tokens=${call.tokens.totalTokens}`,
        `latencyMs=${call.latencyMs}`,
      ].join(" | "),
    );
  }

  if (llmCalls.length > 2) {
    console.log("\n=== STOP: >2 LLM CALLS ===");
    for (const m of report.modulesBeyondTwoCalls) {
      console.log(`#${m.index} ${m.method} stage=${m.stage ?? "n/a"} module=${m.callerModule} ${m.latencyMs}ms`);
    }
  }

  if (duplicates.length > 0) {
    console.log("\n=== DUPLICATE REQUESTS ===");
    for (const d of duplicates) {
      console.log(`hash=${d.hash} count=${d.count} stages=${d.stages.join("; ")}`);
    }
  }

  console.log("\n=== BIGGEST BOTTLENECK ===");
  if (biggestLlm && biggestLlm.latencyMs >= (sortedStages[0]?.ms ?? 0)) {
    console.log(
      `${biggestLlm.label} — ${biggestLlm.latencyMs}ms (${biggestLlm.auditStage ?? biggestLlm.callerModule})`,
    );
  } else {
    console.log(`${biggestStage} — ${sortedStages[0]?.ms ?? 0}ms`);
  }

  console.log("\n=== FASTEST FIX (no code change yet) ===");
  console.log(fastestFix);
}

void main().catch((err) => {
  console.error(err);
  process.exit(1);
});

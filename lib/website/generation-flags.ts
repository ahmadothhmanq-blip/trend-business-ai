/**
 * Website Builder generation optimizations (Phase 1 / 3).
 * All flags default off — existing behavior when unset.
 *
 * Server:
 *   WB_SKIP_COMPOSE_PAGE_LLM=1     — skip DeepSeek for app/page.tsx when composeHomePage runs
 *   WB_DETERMINISTIC_BLUEPRINT=1   — derive blueprint from strategy + design (no blueprint LLM)
 *   WB_INCREMENTAL_PREVIEW=1       — server-side hint (optional)
 *   WB_FAST_GENERATION=1           — default generation profile to fast (overridable per request)
 *   WB_ULTRA_FAST_GENERATION=1     — ultra fast mode (essential files, no plan/optimizer LLM)
 *   WB_WAVE_SCHEDULER=1            — wave planner + scheduler (W2 sections parallel in 2.2)
 *   WB_WAVE_CHECKPOINT_ENGINE=1    — wave-level checkpoint batching (default on with wave scheduler)
 *   WB_PARALLEL_REPAIR=1           — dependency-aware parallel repair waves
 *   WB_REPAIR_CONCURRENCY=4        — max parallel repairs per wave
 *   WB_SMART_CONTEXT=1             — dependency-aware minimal LLM context (Phase 2.5)
 *   WB_CONTEXT_CHAR_LIMIT=3500     — per-file context char cap
 *   WB_CONTEXT_CHAR_BUDGET=0       — optional total context char budget (0 = unlimited)
 *   WB_PROMPT_OPTIMIZATION=1         — compact file-generation metadata (Phase 2.6)
 *   WB_LLM_CONCURRENCY=4           — global LLM cap for W2 parallel pool (default 4)
 *   WB_WAVE_STRICT_CONTEXT=1       — disable W2 snapshot context; full serial context
 *
 * Client (incremental preview iframe during streaming):
 *   NEXT_PUBLIC_WB_INCREMENTAL_PREVIEW=1
 */

import type { WebsiteGenerationInput } from "@/plugins/website/types";
import { isPaidWebsitePlan } from "@/lib/ai-core/quality-authority/billing";

export type WebsiteGenerationProfile = "fast" | "professional" | "ultra";

export type WebsiteProfileResolutionInput = Pick<
  WebsiteGenerationInput,
  "generationProfile" | "hasPaidPlan" | "billingPlanId"
>;

function envTruthy(name: string): boolean {
  const value = process.env[name];
  return value === "true" || value === "1";
}

export const websiteGenerationFlags = {
  /** Phase 1.1 — skip per-file LLM for app/page.tsx when injectProfessionalComponents composes it. */
  skipComposePageLlm: envTruthy("WB_SKIP_COMPOSE_PAGE_LLM"),
  /** Phase 1.3 — use blueprintFromStrategy when upstream strategy + design already exist. */
  deterministicBlueprint: envTruthy("WB_DETERMINISTIC_BLUEPRINT"),
  /** Phase 3.1 — server flag (mirrors client when set). */
  incrementalPreview: envTruthy("WB_INCREMENTAL_PREVIEW"),
  /** Fast generation — skip quality improve, optimizer fixes, non-fatal repairs. */
  fastGenerationDefault: envTruthy("WB_FAST_GENERATION"),
  /** Ultra fast generation — essential files only, skip plan/optimizer LLM passes. */
  ultraFastGeneration: envTruthy("WB_ULTRA_FAST_GENERATION"),
} as const;

/**
 * Resolve generation profile.
 * Request `generationProfile` wins.
 * Env fast/ultra flags apply only for non-paid users (paid users must opt in explicitly).
 * Paid users default to professional quality.
 */
export function resolveWebsiteGenerationProfile(
  input?: WebsiteProfileResolutionInput,
): WebsiteGenerationProfile {
  if (input?.generationProfile === "professional") return "professional";
  if (input?.generationProfile === "ultra") return "ultra";
  if (input?.generationProfile === "fast") return "fast";

  const paid =
    input?.hasPaidPlan === true ||
    isPaidWebsitePlan(input?.billingPlanId);

  if (!paid) {
    if (envTruthy("WB_ULTRA_FAST_GENERATION")) return "ultra";
    if (envTruthy("WB_FAST_GENERATION")) return "fast";
  }

  return "professional";
}

export function isFastWebsiteGeneration(
  input?: Pick<WebsiteGenerationInput, "generationProfile">,
): boolean {
  return resolveWebsiteGenerationProfile(input) === "fast";
}

/** True when profile resolves to ultra (env or request). */
export function isUltraFastWebsiteGeneration(
  input?: Pick<WebsiteGenerationInput, "generationProfile">,
): boolean {
  return resolveWebsiteGenerationProfile(input) === "ultra";
}

/** True when WB_ULTRA_FAST_GENERATION=1 (server env gate). */
export function isUltraFastWebsiteGenerationEnabled(): boolean {
  return websiteGenerationFlags.ultraFastGeneration;
}

/** Fast or ultra — skips quality improve, optimizer, and non-fatal repairs. */
export function isMinimalWebsiteGeneration(
  input?: Pick<WebsiteGenerationInput, "generationProfile">,
): boolean {
  const profile = resolveWebsiteGenerationProfile(input);
  return profile === "fast" || profile === "ultra";
}

/** Browser / server: incremental live preview while generation checkpoints files. */
export function isWebsiteIncrementalPreviewEnabled(): boolean {
  if (websiteGenerationFlags.incrementalPreview) return true;
  if (websiteGenerationFlags.ultraFastGeneration) return true;
  const value = process.env.NEXT_PUBLIC_WB_INCREMENTAL_PREVIEW;
  return value === "true" || value === "1";
}

const COMPOSED_HOME_PAGE_PATH = "app/page.tsx";

/**
 * True when the file loop should not call DeepSeek because composeHomePage will
 * author the home page after section generation (composePage defaults to true).
 */
export function shouldSkipLlmForComposedHomePage(params: {
  filePath: string;
  componentPalette?: readonly string[] | null;
  composePage?: boolean;
  generationProfile?: WebsiteGenerationProfile;
}): boolean {
  const profile =
    params.generationProfile ?? resolveWebsiteGenerationProfile();
  const skipEnabled =
    websiteGenerationFlags.skipComposePageLlm || profile === "ultra";
  if (!skipEnabled) return false;
  if (params.filePath !== COMPOSED_HOME_PAGE_PATH) return false;
  if (params.composePage === false) return false;
  return Boolean(params.componentPalette?.length);
}

export function composedHomePagePlaceholder(filePlan: {
  path: string;
  language?: string;
}): { path: string; content: string; language: string } {
  return {
    path: filePlan.path,
    language: filePlan.language || "tsx",
    content: `/**
 * Placeholder — the home page is composed from the professional component
 * palette after section files are generated (WB_SKIP_COMPOSE_PAGE_LLM).
 */
export default function Page() {
  return null;
}
`,
  };
}

export function shouldUseDeterministicBlueprint(params: {
  mode?: string;
  continueInstruction?: string;
  hasUpstreamStrategy: boolean;
  hasUpstreamDesignSystem: boolean;
  generationProfile?: WebsiteGenerationProfile;
}): boolean {
  const profile =
    params.generationProfile ?? resolveWebsiteGenerationProfile();
  const enabled =
    websiteGenerationFlags.deterministicBlueprint || profile === "ultra";
  if (!enabled) return false;
  if (!params.hasUpstreamStrategy || !params.hasUpstreamDesignSystem) return false;
  if (params.mode === "regenerate" || params.mode === "retry" || params.mode === "continue") {
    return false;
  }
  const instruction = params.continueInstruction?.toLowerCase() ?? "";
  if (instruction.includes("[strategy]") || instruction.includes("[design]")) {
    return false;
  }
  return true;
}

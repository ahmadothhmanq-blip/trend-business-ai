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
 *   WB_STRUCTURE_FIRST=1           — strategy-driven structure; templates are skin-only
 *   WB_SITE_PLAN_V1=1              — attach unified SitePlan to generated projects
 *   WB_PRO_WORKSPACE=1             — enable pro workspace features (UI later)
 *   WB_PUBLISH_GATE=1              — enforce publish gate checks
 *   WB_VISUAL_SKIN_V1=1            — force visual skins on (default on when catalog has skins)
 *   WB_VISUAL_SKIN_V1=0            — disable visual skins
 *   WB_LOCALE_LLM=1                — LLM visitor locale translation at publish (default on when provider configured)
 *
 * Client (incremental preview iframe during streaming):
 *   NEXT_PUBLIC_WB_INCREMENTAL_PREVIEW=1
 */

import type { WebsiteGenerationInput } from "@/plugins/website/types";
import { isPaidWebsitePlan } from "@/lib/ai-core/quality-authority/billing";
import { hasPublishedVisualSkins } from "@/lib/website/visual-skin/registry";

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
  /** Strategy + capabilities own structure; templates apply visual skin only. */
  structureFirst: envTruthy("WB_STRUCTURE_FIRST"),
  /** Unified SitePlan layer on generated projects. */
  sitePlanV1: envTruthy("WB_SITE_PLAN_V1"),
  /** Pro workspace shell (IDE) — gated until UI ships. */
  proWorkspace: envTruthy("WB_PRO_WORKSPACE"),
  /** Publish gate before go-live. */
  publishGate: envTruthy("WB_PUBLISH_GATE"),
  /** Visual skin application after SitePlan. */
  visualSkinV1: envTruthy("WB_VISUAL_SKIN_V1"),
} as const;

/** True when WB_SITE_PLAN_V1=1 — derive and persist SitePlan on projects. */
export function isSitePlanV1Enabled(): boolean {
  return envTruthy("WB_SITE_PLAN_V1");
}

/** True when WB_PRO_WORKSPACE=1 — pro IDE workspace features. */
export function isProWorkspaceEnabled(): boolean {
  return envTruthy("WB_PRO_WORKSPACE");
}

/** Client mirror for pro workspace UI (NEXT_PUBLIC_WB_PRO_WORKSPACE). */
export function isProWorkspaceClientEnabled(): boolean {
  const value = process.env.NEXT_PUBLIC_WB_PRO_WORKSPACE;
  return value === "true" || value === "1";
}

/** True when WB_PUBLISH_GATE=1 — block/warn on publish failures. */
export function isPublishGateEnabled(): boolean {
  return envTruthy("WB_PUBLISH_GATE");
}

/** Apply visual skins when published, unless explicitly disabled (WB_VISUAL_SKIN_V1=0). */
export function isVisualSkinV1Enabled(): boolean {
  const raw = process.env.WB_VISUAL_SKIN_V1;
  if (raw === "0" || raw === "false") return false;
  if (raw === "1" || raw === "true") return true;
  return hasPublishedVisualSkins();
}

/** True when WB_STRUCTURE_FIRST=1 — templates must not mutate pages/sections/nav. */
export function isStructureFirstEnabled(): boolean {
  return envTruthy("WB_STRUCTURE_FIRST");
}

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

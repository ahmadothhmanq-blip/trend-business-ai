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
 *
 * Client (incremental preview iframe during streaming):
 *   NEXT_PUBLIC_WB_INCREMENTAL_PREVIEW=1
 */

import type { WebsiteGenerationInput } from "@/plugins/website/types";

export type WebsiteGenerationProfile = "fast" | "professional" | "ultra";

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
 * Request `generationProfile` wins; else WB_ULTRA_FAST_GENERATION → ultra;
 * else WB_FAST_GENERATION → fast.
 */
export function resolveWebsiteGenerationProfile(
  input?: Pick<WebsiteGenerationInput, "generationProfile">,
): WebsiteGenerationProfile {
  if (input?.generationProfile === "professional") return "professional";
  if (input?.generationProfile === "ultra") return "ultra";
  if (input?.generationProfile === "fast") return "fast";
  if (websiteGenerationFlags.ultraFastGeneration) return "ultra";
  if (websiteGenerationFlags.fastGenerationDefault) return "fast";
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

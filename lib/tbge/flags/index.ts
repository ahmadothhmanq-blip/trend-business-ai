/**
 * TBGE feature flags — all default OFF.
 * Sprint 1: infrastructure only; no runtime wiring to Website Builder.
 *
 *   TBGE_ENABLED=1              Master switch (orchestrator available)
 *   TBGE_SHADOW_MODE=1          Dual-run + diff (future)
 *   TBGE_ASSEMBLY=1             Deterministic assembly path
 *   TBGE_COMPOSER=1             Component Composer (Sprint 4)
 *   TBGE_PLANNING=1             Unified Master Plan (future)
 *   TBGE_CONTENT_MODEL=1        Separate content model call (future)
 *   TBGE_LEGACY_FILE_LLM=1      Per-file LLM fallback when assembly gaps exist
 *   TBGE_LEGACY_REPAIR=0        Per-file repair vs batch (future)
 *   TBGE_CUSTOM_LOGIC=0         Optional custom-logic LLM call
 *   TBGE_SPEC_CHECKPOINT=1      Checkpoint spec hash with waves (future)
 *   TBGE_LEGACY_FULL=0          Force full legacy pipeline (rollback)
 */

export type TbgeFeatureFlags = {
  enabled: boolean;
  shadowMode: boolean;
  assembly: boolean;
  composer: boolean;
  planning: boolean;
  contentModel: boolean;
  legacyFileLlm: boolean;
  legacyRepair: boolean;
  customLogic: boolean;
  specCheckpoint: boolean;
  legacyFull: boolean;
};

function envTruthy(name: string): boolean {
  const value = process.env[name];
  return value === "true" || value === "1";
}

function envFalsyDefaultTrue(name: string): boolean {
  const value = process.env[name];
  if (value === undefined || value === "") return true;
  return value === "true" || value === "1";
}

/** Resolved TBGE flags from environment (cached per process). */
export function resolveTbgeFlags(): TbgeFeatureFlags {
  return {
    enabled: envTruthy("TBGE_ENABLED"),
    shadowMode: envTruthy("TBGE_SHADOW_MODE"),
    assembly: envTruthy("TBGE_ASSEMBLY"),
    composer: envTruthy("TBGE_COMPOSER"),
    planning: envTruthy("TBGE_PLANNING"),
    contentModel: envTruthy("TBGE_CONTENT_MODEL"),
    legacyFileLlm: envFalsyDefaultTrue("TBGE_LEGACY_FILE_LLM"),
    legacyRepair: envTruthy("TBGE_LEGACY_REPAIR"),
    customLogic: envTruthy("TBGE_CUSTOM_LOGIC"),
    specCheckpoint: envFalsyDefaultTrue("TBGE_SPEC_CHECKPOINT"),
    legacyFull: envTruthy("TBGE_LEGACY_FULL"),
  };
}

/** True when TBGE orchestrator may be invoked (still not wired in Sprint 1). */
export function isTbgeEnabled(): boolean {
  return resolveTbgeFlags().enabled;
}

/** True when legacy pipeline must be used exclusively (rollback). */
export function isTbgeLegacyFull(): boolean {
  return resolveTbgeFlags().legacyFull;
}

/** Effective route: TBGE only when enabled and not legacy-full. */
export function shouldUseTbgeOrchestrator(): boolean {
  const flags = resolveTbgeFlags();
  return flags.enabled && !flags.legacyFull;
}

/** True when TBGE Master Planner may run (planning flag on, orchestrator eligible). */
export function shouldRunTbgePlanning(): boolean {
  const flags = resolveTbgeFlags();
  return shouldUseTbgeOrchestrator() && flags.planning;
}

/** True when TBGE Component Composer may run (always on when TBGE is active). */
export function shouldRunTbgeComposer(): boolean {
  if (shouldUseTbgeOrchestrator()) return true;
  const flags = resolveTbgeFlags();
  return flags.composer;
}

/** True when the legacy Website Builder pipeline must not run. */
export function shouldBypassLegacyWebsitePipeline(): boolean {
  return shouldUseTbgeOrchestrator();
}

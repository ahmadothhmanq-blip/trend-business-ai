/**
 * Feature-flag routing for Website Builder ↔ TBGE integration.
 *
 * When TBGE_ENABLED=1 (and TBGE_LEGACY_FULL is off), legacy is never invoked.
 */

import { shouldUseTbgeOrchestrator } from "@/lib/tbge/flags";
import type { WebsiteTbgeRoute } from "@/lib/tbge/integration/types";

/** True when Website Builder must use TBGE exclusively (no legacy pipeline). */
export function shouldRouteWebsiteToTbgePrimary(): boolean {
  return shouldUseTbgeOrchestrator();
}

/** Shadow mode is disabled — TBGE_ENABLED bypasses legacy entirely. */
export function shouldRunTbgeShadowMode(): boolean {
  return false;
}

export function resolveWebsiteTbgeRoute(): WebsiteTbgeRoute {
  if (shouldUseTbgeOrchestrator()) {
    return { mode: "tbge-primary" };
  }
  return { mode: "legacy" };
}

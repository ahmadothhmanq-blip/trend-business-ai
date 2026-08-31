import type { ProjectCapabilityFlags } from "@/lib/ai/validator";
import type {
  WebsiteCapabilityId,
  WebsiteCapabilityManifest,
} from "@/lib/website/builder/capabilities/types";

/** Derive legacy scaffold flags from active capability ids (SSOT). */
export function projectCapabilityFlagsFromActiveIds(
  active: Iterable<WebsiteCapabilityId>,
): ProjectCapabilityFlags {
  const activeSet = new Set(active);

  const requiresAuth =
    activeSet.has("authentication") || activeSet.has("dashboard");
  const requiresDashboard = activeSet.has("dashboard");
  const isEcommerce =
    activeSet.has("products") ||
    activeSet.has("payments") ||
    activeSet.has("orders") ||
    activeSet.has("inventory");
  const isSaas =
    activeSet.has("dashboard") &&
    (activeSet.has("authentication") || activeSet.has("analytics"));
  const requiresDatabase =
    requiresAuth ||
    requiresDashboard ||
    isEcommerce ||
    activeSet.has("booking") ||
    activeSet.has("appointments") ||
    activeSet.has("blog");

  return {
    requiresAuth,
    requiresDashboard,
    isEcommerce,
    isSaas,
    requiresDatabase,
    databaseProvider: requiresDatabase ? "supabase" : "none",
  };
}

/**
 * Derive legacy scaffold flags from a computed manifest (seeding only — not project settings).
 * @deprecated Prefer WebsiteCapabilityService.getProjectCapabilityFlags().
 */
export function projectCapabilityFlagsFromManifest(
  manifest: Pick<WebsiteCapabilityManifest, "capabilities">,
): ProjectCapabilityFlags {
  const active = manifest.capabilities
    .filter((entry) => entry.status === "active" && entry.confidence !== "low")
    .map((entry) => entry.id);
  return projectCapabilityFlagsFromActiveIds(active);
}

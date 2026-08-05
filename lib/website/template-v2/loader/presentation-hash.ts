import { createHash } from "node:crypto";
import type { TemplateV2PresentationProfile } from "@/lib/website/template-v2/contracts/presentation";
import type { TemplateV2PackageBundle } from "@/lib/website/template-v2/contracts/package";

/** Stable hash for presentation profile cache keys (P1+). */
export function hashPresentationProfile(
  profile: TemplateV2PresentationProfile,
): string {
  const normalized = JSON.stringify(profile);
  return createHash("sha256").update(normalized).digest("hex").slice(0, 16);
}

export function hashTemplateV2PackageBundle(bundle: TemplateV2PackageBundle): string {
  const payload = {
    packageId: bundle.packageId,
    presentation: bundle.presentation,
    flows: bundle.flows,
    componentIds: bundle.componentRegistry.components.map((c) => c.id),
  };
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex").slice(0, 16);
}

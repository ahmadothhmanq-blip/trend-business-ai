import { createHash } from "node:crypto";
import type { SitePlan } from "@/lib/website/site-plan/types";

export function hashSitePlanParts(parts: string[]): string {
  return createHash("sha256").update(parts.join("|")).digest("hex").slice(0, 16);
}

export function computeSitePlanHash(
  plan: Omit<SitePlan, "planHash" | "createdAt">,
): string {
  return hashSitePlanParts([
    plan.specVersion,
    plan.archetypeId,
    plan.industry ?? "",
    plan.language ?? "",
    plan.pages.map((p) => `${p.path}:${p.sectionIds.join(",")}`).join(";"),
    plan.sections.map((s) => s.id).join(","),
    plan.capabilities.join(","),
    plan.imageStrategy.mode,
    String(plan.imageStrategy.industryGate),
    plan.derivedFrom,
  ]);
}

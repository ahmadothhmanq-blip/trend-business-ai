import type { DesignRendererComponentId } from "@/lib/ai-core/design-renderer/types";
import type { WebsiteThemePresetId } from "@/lib/website/builder/theme-catalog";
import {
  getThemeComponentRole,
  getThemeLibrary,
  isThemeChromeComponent,
  type ThemeComponentRole,
} from "@/lib/website/builder/theme-component-registry";

/** Ordered fallbacks when the target theme lacks an exact role match. */
const ROLE_FALLBACK_CHAIN: Partial<
  Record<ThemeComponentRole, readonly ThemeComponentRole[]>
> = {
  process: ["process", "features", "services", "story", "cta"],
  services: ["services", "features", "story", "cta"],
  trust: ["trust", "integrations", "testimonials", "features"],
  story: ["story", "features", "services", "gallery"],
  gallery: ["gallery", "portfolio", "cases", "features", "story"],
  cases: ["cases", "portfolio", "gallery", "features"],
  blog: ["blog", "faq", "story", "features"],
  timeline: ["timeline", "faq", "story", "features"],
  cta: ["cta", "features", "pricing", "contact"],
  contact: ["contact", "cta", "pricing", "faq"],
  testimonials: ["testimonials", "trust", "features", "story"],
  pricing: ["pricing", "cta", "features", "faq"],
  faq: ["faq", "features", "cta", "pricing"],
  portfolio: ["portfolio", "gallery", "cases", "features"],
  integrations: ["integrations", "trust", "features", "cases"],
  features: ["features", "services", "story"],
};

function buildTargetRoleIndex(
  targetThemeId: WebsiteThemePresetId,
): Map<ThemeComponentRole, DesignRendererComponentId> {
  const byRole = new Map<ThemeComponentRole, DesignRendererComponentId>();
  for (const spec of getThemeLibrary(targetThemeId)) {
    if (!byRole.has(spec.role)) byRole.set(spec.role, spec.id);
  }
  return byRole;
}

function resolveTargetComponent(
  role: ThemeComponentRole,
  byRole: Map<ThemeComponentRole, DesignRendererComponentId>,
): DesignRendererComponentId | null {
  if (byRole.has(role)) return byRole.get(role)!;

  const chain = ROLE_FALLBACK_CHAIN[role] ?? [role];
  for (const candidate of chain) {
    if (byRole.has(candidate)) return byRole.get(candidate)!;
  }

  if (byRole.has("features")) return byRole.get("features")!;
  if (byRole.has("cta")) return byRole.get("cta")!;
  return null;
}

/**
 * Remap an industry home component order onto another theme library (same roles, new components).
 * Preserves industry section rhythm while swapping the visual frame.
 */
export function remapHomeComponentOrder(
  sourceOrder: readonly DesignRendererComponentId[],
  targetThemeId: WebsiteThemePresetId,
): DesignRendererComponentId[] {
  const byRole = buildTargetRoleIndex(targetThemeId);
  const result: DesignRendererComponentId[] = [];
  const bodyUsed = new Set<string>();

  for (const sourceId of sourceOrder) {
    const role = getThemeComponentRole(sourceId);
    if (!role) continue;

    const targetId = resolveTargetComponent(role, byRole);
    if (!targetId) continue;

    if (isThemeChromeComponent(sourceId)) {
      if (!result.includes(targetId)) result.push(targetId);
      continue;
    }

    if (bodyUsed.has(targetId)) continue;
    bodyUsed.add(targetId);
    result.push(targetId);
  }

  const nav = byRole.get("nav");
  const footer = byRole.get("footer");
  const floating = byRole.get("floating-cta");

  const withoutChrome = result.filter(
    (id) => id !== nav && id !== footer && id !== floating,
  );
  const ordered: DesignRendererComponentId[] = [];
  if (nav) ordered.push(nav);
  ordered.push(...withoutChrome);
  if (footer) ordered.push(footer);
  if (floating && !ordered.includes(floating)) ordered.push(floating);

  return ordered;
}

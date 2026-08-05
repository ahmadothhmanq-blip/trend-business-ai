import type { DesignSystem } from "@/lib/website/types";
import type { TbdpDesignContext } from "@/lib/design-platform/integration";
import type { TbdpSectorId } from "@/lib/design-platform/sector-dna";
import { resolveDesignContext } from "@/lib/design-platform/integration";
import { TBDP_VISUAL_AUTHORITY_META_KEY } from "@/lib/website/tbdp-wiring/constants";

const SPACING_MAP: Record<string, string[]> = {
  compact: ["4px", "8px", "12px", "16px", "24px", "32px"],
  balanced: ["8px", "12px", "16px", "24px", "32px", "48px"],
  generous: ["12px", "16px", "24px", "32px", "48px", "64px"],
  editorial: ["16px", "24px", "32px", "48px", "64px", "96px"],
};

const DENSITY_MAP: Record<string, "airy" | "balanced" | "compact"> = {
  compact: "compact",
  balanced: "balanced",
  generous: "airy",
  editorial: "airy",
};

export function isTbdpVisualAuthority(
  metadata?: Record<string, unknown> | null,
): boolean {
  return metadata?.[TBDP_VISUAL_AUTHORITY_META_KEY] === true;
}

/**
 * Applies TBDP-resolved component preferences, spacing, and layout rules
 * to the design system. Does not override explicit user color choices.
 */
export function applyTbdpToDesignSystem(
  design: DesignSystem,
  ctx: TbdpDesignContext,
): DesignSystem {
  const spacingBehavior = ctx.sector.visual.spacingBehavior;
  const spacingScale = SPACING_MAP[spacingBehavior] ?? design.spacingScale;

  return {
    ...design,
    componentPalette: ctx.components.preferred,
    homeComponentOrder: ctx.aiSelections.pageFlow,
    spacingScale,
    layoutRules: [
      ...(design.layoutRules ?? []),
      `TBDP sector: ${ctx.meta.sectorDnaId}`,
      `TBDP layout: ${ctx.aiSelections.layoutId}`,
      `TBDP hero: ${ctx.aiSelections.heroComponent}`,
    ].slice(0, 18),
    uiStyle: {
      ...design.uiStyle,
      density: DENSITY_MAP[spacingBehavior] ?? design.uiStyle?.density ?? "balanced",
      elevation: mapSurfaceStrategy(ctx.sector.visual.surfaceStrategy),
    },
    industryPattern: ctx.sector.name,
  };
}

function mapSurfaceStrategy(
  strategy: string,
): "flat" | "soft" | "elevated" | undefined {
  switch (strategy) {
    case "flat":
      return "flat";
    case "layered":
    case "elevated":
      return "elevated";
    case "immersive":
      return "soft";
    default:
      return undefined;
  }
}

export function resolveTbdpDesignContextFromBrief(
  metadata?: Record<string, unknown> | null,
): TbdpDesignContext | undefined {
  const stored = metadata?.tbdpDesignContext;
  if (!stored || typeof stored !== "object") return undefined;
  const sectorDnaId = (stored as { sectorDnaId?: string }).sectorDnaId;
  if (!sectorDnaId) return undefined;

  return resolveDesignContext({
    sectorId: sectorDnaId as TbdpSectorId,
    direction: metadata?.tbdpDirection === "rtl" ? "rtl" : "ltr",
  });
}

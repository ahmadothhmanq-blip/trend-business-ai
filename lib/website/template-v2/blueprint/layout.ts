import type {
  BlueprintContainerWidths,
  BlueprintGridStrategy,
} from "@/lib/website/template-v2/blueprint/types";
import type { ResolvedBlueprintContext } from "@/lib/website/template-v2/blueprint/defaults";

export function resolveContainerWidths(
  ctx: ResolvedBlueprintContext,
): BlueprintContainerWidths {
  const premium = ctx.premiumLevel;
  const device = ctx.devicePriority;

  if (premium === "luxury") {
    return {
      narrow: "42rem",
      default: device === "mobile-first" ? "72rem" : "88rem",
      wide: "96rem",
      fullBleed: ctx.visualStyle === "cinematic" || ctx.visualStyle === "editorial",
    };
  }

  if (premium === "standard") {
    return {
      narrow: "36rem",
      default: "72rem",
      wide: "80rem",
      fullBleed: false,
    };
  }

  return {
    narrow: "40rem",
    default: device === "desktop-first" ? "90rem" : "80rem",
    wide: "88rem",
    fullBleed: ctx.visualStyle === "bold",
  };
}

export function resolveGridStrategy(
  ctx: ResolvedBlueprintContext,
): BlueprintGridStrategy {
  const density = ctx.contentDensity;
  const style = ctx.visualStyle;

  let columns: 12 | 16 = 12;
  if (style === "editorial" || ctx.websiteGoal === "portfolio") {
    columns = 16;
  }

  let gutter: BlueprintGridStrategy["gutter"] = "standard";
  if (density === "dense") gutter = "tight";
  if (density === "sparse" || ctx.premiumLevel === "luxury") gutter = "relaxed";

  let rhythm: BlueprintGridStrategy["rhythm"] = "balanced";
  if (density === "dense") rhythm = "dense";
  if (density === "sparse" || ctx.premiumLevel === "luxury") rhythm = "airy";

  const alignment: BlueprintGridStrategy["alignment"] =
    style === "minimal" || style === "corporate" ? "start" : "stretch";

  return { columns, gutter, alignment, rhythm };
}

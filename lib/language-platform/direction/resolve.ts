import type { GlsDirection, GlsDirectionAdaptations } from "@/lib/language-platform/core/types";

/** RTL/LTR engine — automatic layout adaptations. */
export function resolveDirectionAdaptations(
  direction: GlsDirection,
): GlsDirectionAdaptations {
  const rtl = direction === "rtl";
  return {
    spacingMirror: rtl,
    motionReverse: rtl,
    gridFlow: rtl ? "row-reverse" : "row",
    iconMirror: rtl,
    navigationAlign: rtl ? "end" : "start",
    carouselDirection: direction,
    timelineDirection: direction,
    drawerSide: rtl ? "right" : "left",
  };
}

export function resolveDocumentDirection(
  explicit?: GlsDirection,
  localeDirection?: GlsDirection,
): GlsDirection {
  return explicit ?? localeDirection ?? "ltr";
}

/** CSS custom properties for direction-aware styling. */
export function emitDirectionCssVariables(direction: GlsDirection): string {
  const adaptations = resolveDirectionAdaptations(direction);
  return [
    ":root {",
    `  --gls-direction: ${direction};`,
    `  --gls-grid-flow: ${adaptations.gridFlow};`,
    `  --gls-nav-align: ${adaptations.navigationAlign};`,
    `  --gls-drawer-side: ${adaptations.drawerSide};`,
    "}",
    direction === "rtl"
      ? '[dir="rtl"] { text-align: start; }'
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

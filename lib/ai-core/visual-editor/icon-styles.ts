/**
 * Map VisualIcon config → inline styles for live canvas / panel preview.
 */

import type { CSSProperties } from "react";
import {
  ICON_SIZE_PX,
  type IconPreviewState,
  type IconRotationPreset,
  type VisualIcon,
} from "@/lib/ai-core/visual-editor/icon-types";

function rotationDeg(icon: VisualIcon): number {
  if (icon.rotation === "custom") return icon.customRotationDeg;
  return icon.rotation;
}

function sizePx(icon: VisualIcon): number {
  if (icon.size === "custom") return icon.customSizePx;
  return ICON_SIZE_PX[icon.size];
}

function backgroundRadius(icon: VisualIcon): string {
  switch (icon.background) {
    case "circle":
      return "9999px";
    case "rounded-square":
      return "0.5rem";
    case "square":
      return "0";
    case "none":
    default:
      return icon.border.radius || "0";
  }
}

export function resolveIconPreviewStyle(
  icon: VisualIcon,
  state: IconPreviewState = "normal",
): CSSProperties {
  const isDisabled = state === "disabled";
  const isHover = state === "hover" && !isDisabled;
  const px = sizePx(icon);

  const color = isDisabled
    ? icon.colors.disabled
    : isHover
      ? icon.colors.hover
      : icon.colors.normal;

  const background =
    icon.background === "none"
      ? "transparent"
      : isHover
        ? icon.backgroundColor || "rgba(255,255,255,0.08)"
        : icon.backgroundColor || "rgba(255,255,255,0.05)";

  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: icon.background === "none" ? px : px + 12,
    height: icon.background === "none" ? px : px + 12,
    color,
    background,
    borderWidth: icon.border.width,
    borderColor: icon.border.color,
    borderStyle: icon.border.width !== "0" ? "solid" : "none",
    borderRadius: backgroundRadius(icon),
    margin: icon.spacing.margin,
    padding: icon.spacing.padding,
    transform: `rotate(${rotationDeg(icon)}deg)`,
    ["--wb-icon-hover-color" as string]: icon.colors.hover,
    ["--wb-icon-hover-bg" as string]: icon.backgroundColor || "rgba(255,255,255,0.08)",
    opacity: isDisabled ? 0.45 : 1,
    flexShrink: 0,
  };
}

export function iconWrapperStyle(icon: VisualIcon): CSSProperties {
  return resolveIconPreviewStyle(icon, "normal");
}

export function rotationLabel(value: IconRotationPreset): string {
  if (value === "custom") return "Custom";
  return `${value}°`;
}

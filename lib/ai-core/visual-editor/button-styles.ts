/**
 * Map VisualButton config → inline styles for live canvas preview.
 */

import type { CSSProperties } from "react";
import type {
  ButtonPreviewState,
  ButtonRadiusPreset,
  ButtonStyleVariant,
  VisualButton,
} from "@/lib/ai-core/visual-editor/button-types";

const SIZE_PADDING: Record<VisualButton["size"], string> = {
  xs: "0.375rem 0.75rem",
  sm: "0.5rem 1rem",
  md: "0.625rem 1.25rem",
  lg: "0.75rem 1.5rem",
  xl: "0.875rem 1.75rem",
};

function radiusValue(button: VisualButton): string {
  switch (button.radius) {
    case "square":
      return "0";
    case "pill":
      return "9999px";
    case "custom":
      return `${button.customRadiusPx}px`;
    case "rounded":
    default:
      return "0.5rem";
  }
}

function presetColors(
  variant: ButtonStyleVariant,
  button: VisualButton,
): { bg: string; text: string; border: string } {
  switch (variant) {
    case "secondary":
      return {
        bg: "var(--color-secondary, #1a1a1a)",
        text: "var(--color-foreground, #fff)",
        border: "transparent",
      };
    case "outline":
      return {
        bg: "transparent",
        text: button.colors.text || "var(--color-foreground, #fff)",
        border: button.colors.border || "var(--color-accent, #d4af37)",
      };
    case "ghost":
      return {
        bg: "transparent",
        text: button.colors.text || "var(--color-foreground, #fff)",
        border: "transparent",
      };
    case "text":
      return {
        bg: "transparent",
        text: button.colors.text || "var(--color-accent, #d4af37)",
        border: "transparent",
      };
    case "primary":
    default:
      return {
        bg: button.colors.background || "var(--color-accent, #d4af37)",
        text: button.colors.text || "#000",
        border: button.colors.border || "transparent",
      };
  }
}

export function resolveButtonPreviewStyle(
  button: VisualButton,
  state: ButtonPreviewState = "normal",
): CSSProperties {
  const preset = presetColors(button.style, button);
  const isDisabled = state === "disabled" || button.disabled;
  const isHover = state === "hover" && !isDisabled;

  const background = isDisabled
    ? "rgba(128,128,128,0.35)"
    : isHover
      ? button.colors.hoverBackground || preset.bg
      : preset.bg;

  const color = isDisabled
    ? "rgba(255,255,255,0.5)"
    : isHover
      ? button.colors.hoverText || preset.text
      : preset.text;

  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.375rem",
    width: button.width === "full" ? "100%" : "auto",
    padding: button.spacing.padding || SIZE_PADDING[button.size],
    margin: button.spacing.margin || "0",
    background,
    color,
    border: `1px solid ${preset.border}`,
    borderRadius: radiusValue(button),
    fontFamily: button.typography.fontFamily || "inherit",
    fontWeight: button.typography.fontWeight,
    fontSize: button.typography.fontSize,
    letterSpacing: button.typography.letterSpacing,
    textDecoration: button.style === "text" ? "underline" : "none",
    cursor: isDisabled ? "not-allowed" : "pointer",
    opacity: isDisabled ? 0.55 : 1,
    transition: "background 0.15s ease, color 0.15s ease, border-color 0.15s ease",
    pointerEvents: isDisabled ? "none" : "auto",
  };
}

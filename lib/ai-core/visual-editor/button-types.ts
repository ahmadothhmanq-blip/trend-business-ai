/**
 * Visual editor — button model for canvas editing and source persistence.
 */

import {
  formatHref as formatLinkHref,
  inferLinkType as inferVisualLinkType,
  stripHrefForEditor as stripLinkHrefForEditor,
} from "@/lib/ai-core/visual-editor/link-format";
import type { VisualLinkType } from "@/lib/ai-core/visual-editor/link-types";

export type ButtonLinkType = VisualLinkType;

export type ButtonTarget = "same" | "new";

export type ButtonStyleVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "text";

export type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";

export type ButtonWidth = "auto" | "full";

export type ButtonRadiusPreset = "square" | "rounded" | "pill" | "custom";

export type ButtonPreviewState = "normal" | "hover" | "disabled";

export type ButtonIconPosition = "none" | "left" | "right";

export type ButtonSourceKind = "anchor" | "button" | "prop";

export type VisualButtonColors = {
  background: string;
  text: string;
  border: string;
  hoverBackground: string;
  hoverText: string;
};

export type VisualButtonTypography = {
  fontFamily: string;
  fontWeight: string;
  fontSize: string;
  letterSpacing: string;
};

export type VisualButtonSpacing = {
  padding: string;
  margin: string;
};

export type VisualButton = {
  id: string;
  label: string;
  linkType: ButtonLinkType;
  href: string;
  target: ButtonTarget;
  style: ButtonStyleVariant;
  size: ButtonSize;
  width: ButtonWidth;
  radius: ButtonRadiusPreset;
  customRadiusPx: number;
  colors: VisualButtonColors;
  typography: VisualButtonTypography;
  spacing: VisualButtonSpacing;
  icon: ButtonIconPosition;
  iconName: string;
  disabled: boolean;
  ariaLabel: string;
  title: string;
  sourceKind: ButtonSourceKind;
  /** Index among same-kind elements in the component file. */
  sourceIndex: number;
  /** For prop-sourced CTAs (primaryCta, secondaryCta, …). */
  propName?: string;
  hrefPropName?: string;
};

export const BUTTON_ICON_OPTIONS = [
  { id: "", label: "None" },
  { id: "ArrowRight", label: "Arrow right" },
  { id: "ArrowLeft", label: "Arrow left" },
  { id: "Mail", label: "Mail" },
  { id: "Phone", label: "Phone" },
  { id: "ExternalLink", label: "External link" },
  { id: "Download", label: "Download" },
  { id: "Play", label: "Play" },
  { id: "Sparkles", label: "Sparkles" },
  { id: "ChevronRight", label: "Chevron right" },
] as const;

export const BUTTON_FONT_OPTIONS = [
  "inherit",
  "IBM Plex Sans",
  "Inter",
  "Outfit",
  "Syne",
  "Source Sans 3",
  "Playfair Display",
  "system-ui",
] as const;

export const BUTTON_WEIGHT_OPTIONS = ["400", "500", "600", "700"] as const;

export const BUTTON_SIZE_PX: Record<ButtonSize, string> = {
  xs: "0.75rem",
  sm: "0.8125rem",
  md: "0.875rem",
  lg: "1rem",
  xl: "1.125rem",
};

export function defaultButtonColors(): VisualButtonColors {
  return {
    background: "var(--color-accent)",
    text: "#000000",
    border: "transparent",
    hoverBackground: "var(--color-accent)",
    hoverText: "#000000",
  };
}

export function defaultButtonTypography(bodyFont = "inherit"): VisualButtonTypography {
  return {
    fontFamily: bodyFont,
    fontWeight: "600",
    fontSize: BUTTON_SIZE_PX.md,
    letterSpacing: "0.02em",
  };
}

export function defaultButtonSpacing(): VisualButtonSpacing {
  return {
    padding: "0.625rem 1.25rem",
    margin: "0",
  };
}

export function createDefaultButton(
  partial: Pick<VisualButton, "id" | "label" | "sourceKind" | "sourceIndex"> &
    Partial<VisualButton>,
): VisualButton {
  const {
    id,
    label,
    sourceKind,
    sourceIndex,
    linkType,
    href,
    target,
    style,
    size,
    width,
    radius,
    customRadiusPx,
    colors,
    typography,
    spacing,
    icon,
    iconName,
    disabled,
    ariaLabel,
    title,
    propName,
    hrefPropName,
  } = partial;

  return {
    id,
    label,
    sourceKind,
    sourceIndex,
    linkType: linkType ?? "anchor",
    href: href ?? "#contact",
    target: target ?? "same",
    style: style ?? "primary",
    size: size ?? "md",
    width: width ?? "auto",
    radius: radius ?? "rounded",
    customRadiusPx: customRadiusPx ?? 8,
    colors: colors ?? defaultButtonColors(),
    typography: typography ?? defaultButtonTypography(),
    spacing: spacing ?? defaultButtonSpacing(),
    icon: icon ?? "none",
    iconName: iconName ?? "",
    disabled: disabled ?? false,
    ariaLabel: ariaLabel ?? "",
    title: title ?? "",
    propName,
    hrefPropName,
  };
}

export function inferLinkType(href: string): ButtonLinkType {
  return inferVisualLinkType(href);
}

export function formatHref(linkType: ButtonLinkType, raw: string): string {
  return formatLinkHref(linkType, raw);
}

export function stripHrefForEditor(linkType: ButtonLinkType, href: string): string {
  return stripLinkHrefForEditor(linkType, href);
}

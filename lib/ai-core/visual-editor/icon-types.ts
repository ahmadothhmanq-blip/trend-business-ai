/**
 * Visual editor — unified icon model for all icon surfaces.
 */

export type IconElementKind =
  | "button"
  | "nav"
  | "footer"
  | "feature"
  | "service"
  | "contact"
  | "social"
  | "hero"
  | "list"
  | "cta"
  | "info"
  | "inline";

export type IconPosition = "none" | "left" | "right" | "top" | "bottom";

export type IconVariant = "outline" | "filled" | "duotone";

export type IconSize = "xs" | "sm" | "md" | "lg" | "xl" | "custom";

export type IconBackgroundShape = "none" | "circle" | "rounded-square" | "square";

export type IconRotationPreset = 0 | 90 | 180 | 270 | "custom";

export type IconSourceKind = "inline" | "array" | "button" | "comment";

export type IconPreviewState = "normal" | "hover" | "disabled";

export type VisualIconColors = {
  normal: string;
  hover: string;
  disabled: string;
};

export type VisualIconBorder = {
  width: string;
  color: string;
  radius: string;
};

export type VisualIconSpacing = {
  margin: string;
  padding: string;
};

export type VisualIcon = {
  id: string;
  kind: IconElementKind;
  /** Lucide icon id */
  name: string;
  /** Display label in editor */
  label: string;
  position: IconPosition;
  variant: IconVariant;
  size: IconSize;
  customSizePx: number;
  colors: VisualIconColors;
  background: IconBackgroundShape;
  backgroundColor: string;
  border: VisualIconBorder;
  spacing: VisualIconSpacing;
  rotation: IconRotationPreset;
  customRotationDeg: number;
  decorative: boolean;
  ariaLabel: string;
  sourceKind: IconSourceKind;
  sourceIndex: number;
  sectionExportName: string;
  buttonId?: string;
  linkId?: string;
  arrayPropName?: string;
};

export const ICON_SIZE_PX: Record<Exclude<IconSize, "custom">, number> = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

export function defaultIconColors(): VisualIconColors {
  return {
    normal: "var(--color-foreground, #f5f5f5)",
    hover: "var(--color-accent, #d4af37)",
    disabled: "rgba(255,255,255,0.35)",
  };
}

export function defaultIconBorder(): VisualIconBorder {
  return { width: "0", color: "transparent", radius: "0" };
}

export function defaultIconSpacing(): VisualIconSpacing {
  return { margin: "0", padding: "0" };
}

export function createDefaultIcon(
  partial: Pick<
    VisualIcon,
    "id" | "name" | "label" | "kind" | "sourceKind" | "sourceIndex" | "sectionExportName"
  > &
    Partial<VisualIcon>,
): VisualIcon {
  const {
    id,
    name,
    label,
    kind,
    sourceKind,
    sourceIndex,
    sectionExportName,
    position,
    variant,
    size,
    customSizePx,
    colors,
    background,
    backgroundColor,
    border,
    spacing,
    rotation,
    customRotationDeg,
    decorative,
    ariaLabel,
    buttonId,
    linkId,
    arrayPropName,
  } = partial;

  return {
    id,
    name,
    label,
    kind,
    sourceKind,
    sourceIndex,
    sectionExportName,
    position: position ?? "left",
    variant: variant ?? "outline",
    size: size ?? "md",
    customSizePx: customSizePx ?? 20,
    colors: colors ?? defaultIconColors(),
    background: background ?? "none",
    backgroundColor: backgroundColor ?? "transparent",
    border: border ?? defaultIconBorder(),
    spacing: spacing ?? defaultIconSpacing(),
    rotation: rotation ?? 0,
    customRotationDeg: customRotationDeg ?? 0,
    decorative: decorative ?? true,
    ariaLabel: ariaLabel ?? "",
    buttonId,
    linkId,
    arrayPropName,
  };
}

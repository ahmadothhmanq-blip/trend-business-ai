/**
 * Serialize / deserialize icon editor state for durable persistence.
 */

import {
  createDefaultIcon,
  type IconBackgroundShape,
  type IconPosition,
  type IconRotationPreset,
  type IconSize,
  type IconVariant,
  type VisualIcon,
} from "@/lib/ai-core/visual-editor/icon-types";

export const WB_ICON_CONFIG_ATTR = "data-wb-icon-config";
export const WB_ICON_ID_ATTR = "data-wb-icon-id";
export const WB_ICON_CLASS = "wb-icon";
export const WB_ICON_GLOBALS_MARKER = "/* wb-icon-styles */";

export type PersistedIconConfigV1 = {
  v: 1;
  name: string;
  position: IconPosition;
  variant: IconVariant;
  size: IconSize;
  customSizePx: number;
  colors: VisualIcon["colors"];
  background: IconBackgroundShape;
  backgroundColor: string;
  border: VisualIcon["border"];
  spacing: VisualIcon["spacing"];
  rotation: IconRotationPreset;
  customRotationDeg: number;
  decorative: boolean;
  ariaLabel: string;
  kind: VisualIcon["kind"];
};

export function serializeIconConfig(icon: VisualIcon): string {
  const payload: PersistedIconConfigV1 = {
    v: 1,
    name: icon.name,
    position: icon.position,
    variant: icon.variant,
    size: icon.size,
    customSizePx: icon.customSizePx,
    colors: { ...icon.colors },
    background: icon.background,
    backgroundColor: icon.backgroundColor,
    border: { ...icon.border },
    spacing: { ...icon.spacing },
    rotation: icon.rotation,
    customRotationDeg: icon.customRotationDeg,
    decorative: icon.decorative,
    ariaLabel: icon.ariaLabel,
    kind: icon.kind,
  };
  return JSON.stringify(payload);
}

export function parseIconConfig(raw: string | undefined | null): Partial<VisualIcon> | null {
  if (!raw?.trim()) return null;
  try {
    const parsed = JSON.parse(raw) as PersistedIconConfigV1;
    if (parsed.v !== 1) return null;
    return {
      name: parsed.name,
      position: parsed.position,
      variant: parsed.variant,
      size: parsed.size,
      customSizePx: parsed.customSizePx,
      colors: parsed.colors,
      background: parsed.background,
      backgroundColor: parsed.backgroundColor,
      border: parsed.border,
      spacing: parsed.spacing,
      rotation: parsed.rotation,
      customRotationDeg: parsed.customRotationDeg,
      decorative: parsed.decorative,
      ariaLabel: parsed.ariaLabel,
      kind: parsed.kind,
    };
  } catch {
    return null;
  }
}

export function mergeIconConfig(
  base: VisualIcon,
  config: Partial<VisualIcon> | null | undefined,
): VisualIcon {
  if (!config) return base;
  return createDefaultIcon({
    ...base,
    ...config,
    colors: { ...base.colors, ...(config.colors ?? {}) },
    border: { ...base.border, ...(config.border ?? {}) },
    spacing: { ...base.spacing, ...(config.spacing ?? {}) },
  });
}

export const WB_ICON_GLOBALS_CSS = `${WB_ICON_GLOBALS_MARKER}
.wb-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 0;
  transition: color 0.15s ease, background 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
}
.wb-icon svg {
  width: 100%;
  height: 100%;
}
a:hover .wb-icon,
button:hover .wb-icon,
.wb-icon:hover {
  color: var(--wb-icon-hover-color, inherit) !important;
  background: var(--wb-icon-hover-bg, inherit) !important;
}
`;

export function ensureWbIconGlobalsCss(css: string): string {
  if (css.includes(WB_ICON_GLOBALS_MARKER)) return css;
  return `${css.trimEnd()}\n\n${WB_ICON_GLOBALS_CSS}\n`;
}

export type PersistedArrayIcon = {
  href: string;
  label: string;
  icon?: string;
  iconConfig?: string;
};

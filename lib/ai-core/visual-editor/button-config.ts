/**
 * Serialize / deserialize visual button editor state for durable source persistence.
 */

import type {
  ButtonIconPosition,
  ButtonLinkType,
  ButtonRadiusPreset,
  ButtonSize,
  ButtonStyleVariant,
  ButtonTarget,
  ButtonWidth,
  VisualButton,
  VisualButtonColors,
  VisualButtonSpacing,
  VisualButtonTypography,
} from "@/lib/ai-core/visual-editor/button-types";
import {
  createDefaultButton,
  defaultButtonColors,
  defaultButtonSpacing,
  defaultButtonTypography,
} from "@/lib/ai-core/visual-editor/button-types";

export const WB_BUTTON_CONFIG_ATTR = "data-wb-button-config";
export const WB_BUTTON_ID_ATTR = "data-wb-button-id";
export const WB_BUTTON_CLASS = "wb-button";
export const WB_BUTTON_GLOBALS_MARKER = "/* wb-button-styles */";

export type PersistedButtonConfigV1 = {
  v: 1;
  linkType: ButtonLinkType;
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
};

export function buttonConfigPropName(propName: string): string {
  return `${propName}Config`;
}

export function serializeButtonConfig(button: VisualButton): string {
  const payload: PersistedButtonConfigV1 = {
    v: 1,
    linkType: button.linkType,
    target: button.target,
    style: button.style,
    size: button.size,
    width: button.width,
    radius: button.radius,
    customRadiusPx: button.customRadiusPx,
    colors: { ...button.colors },
    typography: { ...button.typography },
    spacing: { ...button.spacing },
    icon: button.icon,
    iconName: button.iconName,
    disabled: button.disabled,
    ariaLabel: button.ariaLabel,
    title: button.title,
  };
  return JSON.stringify(payload);
}

export function parseButtonConfig(raw: string | undefined | null): Partial<VisualButton> | null {
  if (!raw?.trim()) return null;
  try {
    const parsed = JSON.parse(raw) as PersistedButtonConfigV1;
    if (parsed.v !== 1) return null;
    return {
      linkType: parsed.linkType,
      target: parsed.target,
      style: parsed.style,
      size: parsed.size,
      width: parsed.width,
      radius: parsed.radius,
      customRadiusPx: parsed.customRadiusPx,
      colors: parsed.colors ?? defaultButtonColors(),
      typography: parsed.typography ?? defaultButtonTypography(),
      spacing: parsed.spacing ?? defaultButtonSpacing(),
      icon: parsed.icon,
      iconName: parsed.iconName ?? "",
      disabled: parsed.disabled ?? false,
      ariaLabel: parsed.ariaLabel ?? "",
      title: parsed.title ?? "",
    };
  } catch {
    return null;
  }
}

export function mergeButtonConfig(
  base: VisualButton,
  config: Partial<VisualButton> | null | undefined,
): VisualButton {
  if (!config) return base;
  return createDefaultButton({
    ...base,
    ...config,
    colors: { ...base.colors, ...(config.colors ?? {}) },
    typography: { ...base.typography, ...(config.typography ?? {}) },
    spacing: { ...base.spacing, ...(config.spacing ?? {}) },
  });
}

export const WB_BUTTON_GLOBALS_CSS = `${WB_BUTTON_GLOBALS_MARKER}
a.wb-button,
button.wb-button {
  text-decoration: none;
  box-sizing: border-box;
}
a.wb-button:hover,
button.wb-button:hover {
  background: var(--wb-hover-bg) !important;
  color: var(--wb-hover-color) !important;
  border-color: var(--wb-hover-border, inherit) !important;
}
.wb-btn-icon {
  display: inline-flex;
  width: 1em;
  height: 1em;
  flex-shrink: 0;
}
.wb-btn-icon svg {
  width: 100%;
  height: 100%;
}
`;

export function ensureWbButtonGlobalsCss(css: string): string {
  if (css.includes(WB_BUTTON_GLOBALS_MARKER)) return css;
  return `${css.trimEnd()}\n\n${WB_BUTTON_GLOBALS_CSS}\n`;
}

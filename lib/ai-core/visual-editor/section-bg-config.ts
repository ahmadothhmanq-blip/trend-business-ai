/**
 * Serialize / deserialize section background editor state.
 */

import {
  createDefaultSectionBackground,
  type BgDisplayMode,
  type BgImageSource,
  type BgOverlayMode,
  type BgPosition,
  type BgSectionHeight,
  type VisualSectionBackground,
} from "@/lib/ai-core/visual-editor/section-bg-types";
import type { VisualNodeKind } from "@/lib/ai-core/visual-editor/types";

export const WB_SECTION_BG_CONFIG_ATTR = "data-wb-section-bg-config";
export const WB_SECTION_BG_ID_ATTR = "data-wb-section-bg-id";
export const WB_SECTION_BG_IMG_CLASS = "wb-section-bg-img";
export const WB_SECTION_BG_OVERLAY_CLASS = "wb-section-bg-overlay";
export const WB_SECTION_BG_LAYER_CLASS = "wb-section-bg-layer";
export const WB_SECTION_BG_GLOBALS_MARKER = "/* wb-section-bg-styles */";

export type PersistedSectionBgConfigV1 = {
  v: 1;
  source: BgImageSource;
  url: string;
  displayMode: BgDisplayMode;
  position: BgPosition;
  positionX: string;
  positionY: string;
  overlay: VisualSectionBackground["overlay"];
  effects: VisualSectionBackground["effects"];
  parallax: boolean;
  borderRadius: string;
  sectionHeight: BgSectionHeight;
  customHeightPx: number;
  mobile: VisualSectionBackground["mobile"];
  alt: string;
  decorative: boolean;
  kind: VisualNodeKind;
};

export function serializeSectionBgConfig(bg: VisualSectionBackground): string {
  const payload: PersistedSectionBgConfigV1 = {
    v: 1,
    source: bg.source,
    url: bg.url,
    displayMode: bg.displayMode,
    position: bg.position,
    positionX: bg.positionX,
    positionY: bg.positionY,
    overlay: { ...bg.overlay },
    effects: { ...bg.effects },
    parallax: bg.parallax,
    borderRadius: bg.borderRadius,
    sectionHeight: bg.sectionHeight,
    customHeightPx: bg.customHeightPx,
    mobile: { ...bg.mobile },
    alt: bg.alt,
    decorative: bg.decorative,
    kind: bg.kind,
  };
  return JSON.stringify(payload);
}

export function parseSectionBgConfig(
  raw: string | undefined | null,
): Partial<VisualSectionBackground> | null {
  if (!raw?.trim()) return null;
  try {
    const parsed = JSON.parse(raw) as PersistedSectionBgConfigV1;
    if (parsed.v !== 1) return null;
    return {
      source: parsed.source,
      url: parsed.url,
      displayMode: parsed.displayMode,
      position: parsed.position,
      positionX: parsed.positionX,
      positionY: parsed.positionY,
      overlay: parsed.overlay,
      effects: parsed.effects,
      parallax: parsed.parallax,
      borderRadius: parsed.borderRadius,
      sectionHeight: parsed.sectionHeight,
      customHeightPx: parsed.customHeightPx,
      mobile: parsed.mobile,
      alt: parsed.alt,
      decorative: parsed.decorative,
      kind: parsed.kind,
    };
  } catch {
    return null;
  }
}

export function mergeSectionBgConfig(
  base: VisualSectionBackground,
  config: Partial<VisualSectionBackground> | null | undefined,
): VisualSectionBackground {
  if (!config) return base;
  return createDefaultSectionBackground({
    ...base,
    ...config,
    overlay: { ...base.overlay, ...(config.overlay ?? {}) },
    effects: { ...base.effects, ...(config.effects ?? {}) },
    mobile: { ...base.mobile, ...(config.mobile ?? {}) },
  });
}

export const WB_SECTION_BG_GLOBALS_CSS = `${WB_SECTION_BG_GLOBALS_MARKER}
.wb-section-bg-layer {
  pointer-events: none;
}
.wb-section-bg-img {
  width: 100%;
  height: 100%;
}
.wb-section-bg-parallax {
  will-change: transform;
}
@media (max-width: 767px) {
  .wb-section-bg-hide-mobile {
    display: none !important;
  }
}
`;

export function ensureWbSectionBgGlobalsCss(css: string): string {
  if (css.includes(WB_SECTION_BG_GLOBALS_MARKER)) return css;
  return `${css.trimEnd()}\n\n${WB_SECTION_BG_GLOBALS_CSS}\n`;
}

/**
 * Serialize / deserialize section editor configuration.
 */

import {
  createDefaultSectionConfig,
  type SectionAnimation,
  type SectionLayoutWidth,
  type SectionOverflow,
  type SectionType,
  type SectionVisibility,
  type VisualSectionConfig,
} from "@/lib/ai-core/visual-editor/section-types";

export const WB_SECTION_CONFIG_ATTR = "data-wb-section-config";
export const WB_SECTION_ID_ATTR = "data-wb-section-id";
export const WB_SECTION_CLASS = "wb-section";
export const WB_SECTION_GLOBALS_MARKER = "/* wb-section-styles */";

export type PersistedSectionConfigV1 = {
  v: 1;
  sectionType: SectionType;
  visibility: SectionVisibility;
  layout: VisualSectionConfig["layout"];
  settings: VisualSectionConfig["settings"];
  styling: VisualSectionConfig["styling"];
  animation: VisualSectionConfig["animation"];
  kind: VisualSectionConfig["kind"];
};

export function serializeSectionConfig(config: VisualSectionConfig): string {
  const payload: PersistedSectionConfigV1 = {
    v: 1,
    sectionType: config.sectionType,
    visibility: config.visibility,
    layout: { ...config.layout },
    settings: { ...config.settings },
    styling: { ...config.styling },
    animation: { ...config.animation },
    kind: config.kind,
  };
  return JSON.stringify(payload);
}

export function parseSectionConfig(
  raw: string | undefined | null,
): Partial<VisualSectionConfig> | null {
  if (!raw?.trim()) return null;
  try {
    const parsed = JSON.parse(raw) as PersistedSectionConfigV1;
    if (parsed.v !== 1) return null;
    return {
      sectionType: parsed.sectionType,
      visibility: parsed.visibility,
      layout: parsed.layout,
      settings: parsed.settings,
      styling: parsed.styling,
      animation: parsed.animation,
      kind: parsed.kind,
    };
  } catch {
    return null;
  }
}

export function mergeSectionConfig(
  base: VisualSectionConfig,
  config: Partial<VisualSectionConfig> | null | undefined,
): VisualSectionConfig {
  if (!config) return base;
  return createDefaultSectionConfig({
    ...base,
    ...config,
    layout: { ...base.layout, ...(config.layout ?? {}) },
    settings: { ...base.settings, ...(config.settings ?? {}) },
    styling: { ...base.styling, ...(config.styling ?? {}) },
    animation: { ...base.animation, ...(config.animation ?? {}) },
  });
}

export const VISIBILITY_CLASS: Record<SectionVisibility, string> = {
  show: "",
  hide: "wb-section-hidden",
  desktop: "wb-section-desktop-only",
  tablet: "wb-section-tablet-only",
  mobile: "wb-section-mobile-only",
};

export const LAYOUT_WIDTH_CLASS: Record<SectionLayoutWidth, string> = {
  full: "wb-section-full",
  boxed: "wb-section-boxed",
  container: "wb-section-container",
};

export const ANIMATION_CLASS: Record<SectionAnimation, string> = {
  none: "",
  fade: "wb-animate-fade",
  slide: "wb-animate-slide",
  zoom: "wb-animate-zoom",
};

export const WB_SECTION_GLOBALS_CSS = `${WB_SECTION_GLOBALS_MARKER}
.wb-section-hidden { display: none !important; }
@media (max-width: 767px) {
  .wb-section-desktop-only { display: none !important; }
  .wb-section-tablet-only { display: none !important; }
}
@media (min-width: 768px) and (max-width: 1023px) {
  .wb-section-mobile-only { display: none !important; }
  .wb-section-desktop-only { display: none !important; }
}
@media (min-width: 1024px) {
  .wb-section-mobile-only { display: none !important; }
  .wb-section-tablet-only { display: none !important; }
}
.wb-section-full { width: 100%; max-width: none; }
.wb-section-boxed { width: 100%; max-width: 72rem; margin-inline: auto; }
.wb-section-container { width: 100%; max-width: var(--container-max, 72rem); margin-inline: auto; }
.wb-animate-fade { animation: wbFadeIn var(--wb-anim-duration, 600ms) ease both; }
.wb-animate-slide { animation: wbSlideUp var(--wb-anim-duration, 600ms) ease both; }
.wb-animate-zoom { animation: wbZoomIn var(--wb-anim-duration, 600ms) ease both; }
@keyframes wbFadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes wbSlideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
@keyframes wbZoomIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
`;

export function ensureWbSectionGlobalsCss(css: string): string {
  if (css.includes(WB_SECTION_GLOBALS_MARKER)) return css;
  return `${css.trimEnd()}\n\n${WB_SECTION_GLOBALS_CSS}\n`;
}

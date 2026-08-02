/**
 * Map VisualSectionConfig → inline styles for live canvas preview.
 */

import type { CSSProperties } from "react";
import {
  ANIMATION_CLASS,
  LAYOUT_WIDTH_CLASS,
  VISIBILITY_CLASS,
  WB_SECTION_CLASS,
} from "@/lib/ai-core/visual-editor/section-config";
import type { VisualSectionConfig } from "@/lib/ai-core/visual-editor/section-types";
import type { VisualViewport } from "@/lib/ai-core/visual-editor/types";

function isHiddenForViewport(
  config: VisualSectionConfig,
  viewport: VisualViewport,
): boolean {
  if (config.visibility === "hide") return true;
  if (config.visibility === "desktop" && viewport !== "desktop") return true;
  if (config.visibility === "tablet" && viewport !== "tablet") return true;
  if (config.visibility === "mobile" && viewport !== "mobile") return true;
  return false;
}

export function resolveSectionPreviewStyle(
  config: VisualSectionConfig,
  viewport: VisualViewport = "desktop",
): CSSProperties {
  const s = config.styling;
  const style: CSSProperties = {
    padding: s.padding || undefined,
    margin: s.margin || undefined,
    borderWidth: s.borderWidth !== "0" ? s.borderWidth : undefined,
    borderColor: s.borderColor !== "transparent" ? s.borderColor : undefined,
    borderStyle: s.borderWidth !== "0" ? s.borderStyle : undefined,
    borderRadius: s.radius !== "0" ? s.radius : undefined,
    boxShadow: s.shadow !== "none" ? s.shadow : undefined,
    opacity: s.opacity !== 100 ? s.opacity / 100 : undefined,
    zIndex: s.zIndex !== 0 ? s.zIndex : undefined,
    overflow: s.overflow !== "visible" ? s.overflow : undefined,
    display: isHiddenForViewport(config, viewport) ? "none" : undefined,
    ["--wb-anim-duration" as string]: `${config.animation.durationMs}ms`,
    ["--wb-anim-delay" as string]: `${config.animation.delayMs}ms`,
    animationDelay:
      config.animation.type !== "none"
        ? `${config.animation.delayMs}ms`
        : undefined,
  };

  if (config.layout.columns > 1) {
    style.display = isHiddenForViewport(config, viewport) ? "none" : "grid";
    style.gridTemplateColumns = `repeat(${config.layout.columns}, minmax(0, 1fr))`;
    style.gap = config.layout.gap;
    style.alignItems =
      config.layout.alignment === "stretch"
        ? "stretch"
        : config.layout.alignment === "center"
          ? "center"
          : config.layout.alignment === "right"
            ? "end"
            : "start";
  }

  return style;
}

export function sectionPreviewClassName(config: VisualSectionConfig): string {
  const parts = [WB_SECTION_CLASS];
  const vis = VISIBILITY_CLASS[config.visibility];
  if (vis) parts.push(vis);
  const width = LAYOUT_WIDTH_CLASS[config.layout.width];
  if (width) parts.push(width);
  const anim = ANIMATION_CLASS[config.animation.type];
  if (anim) parts.push(anim);
  if (config.settings.cssClasses.trim()) {
    parts.push(...config.settings.cssClasses.split(/\s+/).filter(Boolean));
  }
  return parts.join(" ");
}

export function sectionIsVisible(
  config: VisualSectionConfig,
  viewport: VisualViewport,
): boolean {
  return !isHiddenForViewport(config, viewport);
}

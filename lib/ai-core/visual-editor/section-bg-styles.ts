/**
 * Map section background config → inline styles for live preview.
 */

import type { CSSProperties } from "react";
import {
  BG_SECTION_HEIGHT_CLASS,
  type BgDisplayMode,
  type BgPosition,
  type BgSectionHeight,
  type VisualSectionBackground,
} from "@/lib/ai-core/visual-editor/section-bg-types";
import type { VisualViewport } from "@/lib/ai-core/visual-editor/types";

const OBJECT_FIT: Partial<Record<BgDisplayMode, CSSProperties["objectFit"]>> = {
  cover: "cover",
  contain: "contain",
  fill: "fill",
};

function objectPosition(position: BgPosition, x: string, y: string): string {
  if (position === "custom") return `${x} ${y}`;
  const map: Record<Exclude<BgPosition, "custom">, string> = {
    center: "center center",
    top: "center top",
    bottom: "center bottom",
    left: "left center",
    right: "right center",
  };
  return map[position];
}

function filterStyle(effects: VisualSectionBackground["effects"]): string {
  const parts: string[] = [];
  if (effects.brightness !== 100) parts.push(`brightness(${effects.brightness}%)`);
  if (effects.contrast !== 100) parts.push(`contrast(${effects.contrast}%)`);
  if (effects.saturation !== 100) parts.push(`saturate(${effects.saturation}%)`);
  if (effects.grayscale > 0) parts.push(`grayscale(${effects.grayscale}%)`);
  if (effects.blur > 0) parts.push(`blur(${effects.blur}px)`);
  return parts.join(" ") || "none";
}

function overlayBackground(bg: VisualSectionBackground): string {
  if (!bg.overlay.enabled) return "transparent";
  if (bg.overlay.mode === "gradient" && bg.overlay.gradient.trim()) {
    return bg.overlay.gradient;
  }
  const alpha = Math.max(0, Math.min(100, bg.overlay.opacity)) / 100;
  const color = bg.overlay.color || "#000000";
  if (color.startsWith("rgba") || color.startsWith("hsla")) return color;
  if (color.startsWith("#")) {
    const hex = color.replace("#", "");
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return color;
}

export function resolveSectionBgImageStyle(
  bg: VisualSectionBackground,
  viewport: VisualViewport = "desktop",
): CSSProperties {
  const isMobile = viewport === "mobile";
  const useMobile = isMobile && bg.mobile.url.trim();
  const url = useMobile ? bg.mobile.url : bg.url;
  const displayMode = useMobile ? bg.mobile.displayMode : bg.displayMode;
  const position = useMobile ? bg.mobile.position : bg.position;
  const positionX = useMobile ? bg.mobile.positionX : bg.positionX;
  const positionY = useMobile ? bg.mobile.positionY : bg.positionY;

  if (!url || (isMobile && bg.mobile.hideOnMobile)) {
    return { display: "none" };
  }

  const style: CSSProperties = {
    objectFit: OBJECT_FIT[displayMode] ?? "cover",
    objectPosition: objectPosition(position, positionX, positionY),
    filter: filterStyle(bg.effects),
    borderRadius: bg.borderRadius !== "0" ? bg.borderRadius : undefined,
  };

  if (displayMode === "fit-width") {
    style.width = "100%";
    style.height = "auto";
    style.objectFit = "contain";
  } else if (displayMode === "fit-height") {
    style.height = "100%";
    style.width = "auto";
    style.objectFit = "contain";
  } else if (displayMode === "repeat") {
    style.objectFit = "none";
    style.width = "auto";
    style.height = "auto";
  }

  return style;
}

export function resolveSectionBgOverlayStyle(
  bg: VisualSectionBackground,
): CSSProperties {
  if (!bg.overlay.enabled) return { display: "none" };
  return {
    background: overlayBackground(bg),
    backdropFilter: bg.overlay.blur > 0 ? `blur(${bg.overlay.blur}px)` : undefined,
  };
}

export function resolveSectionContainerStyle(
  bg: VisualSectionBackground,
): CSSProperties {
  const style: CSSProperties = {
    position: "relative",
    overflow: "hidden",
  };
  if (bg.borderRadius && bg.borderRadius !== "0") {
    style.borderRadius = bg.borderRadius;
  }
  if (bg.sectionHeight === "custom") {
    style.minHeight = `${bg.customHeightPx}px`;
  } else if (bg.sectionHeight !== "auto") {
    // height class applied separately in preview
  }
  return style;
}

export function sectionHeightClass(bg: VisualSectionBackground): string | undefined {
  if (bg.sectionHeight === "auto" || bg.sectionHeight === "custom") return undefined;
  return BG_SECTION_HEIGHT_CLASS[bg.sectionHeight];
}

export function sectionBgPreviewUrl(
  bg: VisualSectionBackground,
  viewport: VisualViewport,
): string {
  if (viewport === "mobile" && bg.mobile.url.trim()) return bg.mobile.url;
  return bg.url;
}

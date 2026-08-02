/**
 * Visual editor — section background image model.
 */

import type { VisualNodeKind } from "@/lib/ai-core/visual-editor/types";

export type BgImageSource = "none" | "upload" | "library" | "url" | "ai";

export type BgDisplayMode =
  | "cover"
  | "contain"
  | "fill"
  | "fit-width"
  | "fit-height"
  | "repeat"
  | "no-repeat";

export type BgPosition =
  | "center"
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "custom";

export type BgOverlayMode = "solid" | "gradient" | "none";

export type BgSectionHeight = "auto" | "sm" | "md" | "lg" | "fullscreen" | "custom";

export type VisualSectionBackgroundEffects = {
  brightness: number;
  contrast: number;
  saturation: number;
  grayscale: number;
  blur: number;
};

export type VisualSectionBackgroundOverlay = {
  enabled: boolean;
  color: string;
  opacity: number;
  mode: BgOverlayMode;
  gradient: string;
  blur: number;
};

export type VisualSectionBackgroundMobile = {
  url: string;
  displayMode: BgDisplayMode;
  position: BgPosition;
  positionX: string;
  positionY: string;
  hideOnMobile: boolean;
};

export type VisualSectionBackground = {
  id: string;
  sectionExportName: string;
  kind: VisualNodeKind;
  source: BgImageSource;
  url: string;
  displayMode: BgDisplayMode;
  position: BgPosition;
  positionX: string;
  positionY: string;
  overlay: VisualSectionBackgroundOverlay;
  effects: VisualSectionBackgroundEffects;
  parallax: boolean;
  borderRadius: string;
  sectionHeight: BgSectionHeight;
  customHeightPx: number;
  mobile: VisualSectionBackgroundMobile;
  alt: string;
  decorative: boolean;
  /** Section uses imageUrl page prop (hero, etc.). */
  hasImageUrlProp: boolean;
};

export const BG_SECTION_HEIGHT_CLASS: Record<
  Exclude<BgSectionHeight, "auto" | "custom">,
  string
> = {
  sm: "min-h-[40vh]",
  md: "min-h-[60vh]",
  lg: "min-h-[80vh]",
  fullscreen: "min-h-screen",
};

export function defaultBgEffects(): VisualSectionBackgroundEffects {
  return {
    brightness: 100,
    contrast: 100,
    saturation: 100,
    grayscale: 0,
    blur: 0,
  };
}

export function defaultBgOverlay(): VisualSectionBackgroundOverlay {
  return {
    enabled: true,
    color: "#000000",
    opacity: 45,
    mode: "gradient",
    gradient: "linear-gradient(to right, rgba(0,0,0,0.7), rgba(0,0,0,0.2))",
    blur: 0,
  };
}

export function defaultBgMobile(): VisualSectionBackgroundMobile {
  return {
    url: "",
    displayMode: "cover",
    position: "center",
    positionX: "50%",
    positionY: "50%",
    hideOnMobile: false,
  };
}

export function createDefaultSectionBackground(
  partial: Pick<
    VisualSectionBackground,
    "id" | "sectionExportName" | "kind"
  > &
    Partial<VisualSectionBackground>,
): VisualSectionBackground {
  const {
    id,
    sectionExportName,
    kind,
    source,
    url,
    displayMode,
    position,
    positionX,
    positionY,
    overlay,
    effects,
    parallax,
    borderRadius,
    sectionHeight,
    customHeightPx,
    mobile,
    alt,
    decorative,
    hasImageUrlProp,
  } = partial;

  return {
    id,
    sectionExportName,
    kind,
    source: source ?? "none",
    url: url ?? "",
    displayMode: displayMode ?? "cover",
    position: position ?? "center",
    positionX: positionX ?? "50%",
    positionY: positionY ?? "50%",
    overlay: overlay ?? defaultBgOverlay(),
    effects: effects ?? defaultBgEffects(),
    parallax: parallax ?? false,
    borderRadius: borderRadius ?? "0",
    sectionHeight: sectionHeight ?? "auto",
    customHeightPx: customHeightPx ?? 480,
    mobile: mobile ?? defaultBgMobile(),
    alt: alt ?? "",
    decorative: decorative ?? false,
    hasImageUrlProp: hasImageUrlProp ?? false,
  };
}

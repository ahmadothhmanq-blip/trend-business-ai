/**
 * Visual editor — unified section configuration model.
 */

import type { VisualNodeKind } from "@/lib/ai-core/visual-editor/types";

export type SectionType =
  | "hero"
  | "about"
  | "services"
  | "features"
  | "gallery"
  | "pricing"
  | "testimonials"
  | "team"
  | "faq"
  | "contact"
  | "cta"
  | "footer"
  | "header"
  | "custom";

export type SectionVisibility = "show" | "hide" | "desktop" | "tablet" | "mobile";

export type SectionLayoutWidth = "full" | "boxed" | "container";

export type SectionAlignment = "left" | "center" | "right" | "stretch";

export type SectionAnimation = "none" | "fade" | "slide" | "zoom";

export type SectionOverflow = "visible" | "hidden" | "auto" | "scroll";

export type VisualSectionLayout = {
  width: SectionLayoutWidth;
  columns: number;
  gap: string;
  alignment: SectionAlignment;
};

export type VisualSectionSettings = {
  htmlId: string;
  anchor: string;
  cssClasses: string;
  customAttributes: string;
};

export type VisualSectionStyling = {
  padding: string;
  margin: string;
  borderWidth: string;
  borderColor: string;
  borderStyle: string;
  radius: string;
  shadow: string;
  opacity: number;
  zIndex: number;
  overflow: SectionOverflow;
};

export type VisualSectionAnimation = {
  type: SectionAnimation;
  durationMs: number;
  delayMs: number;
};

export type VisualSectionConfig = {
  id: string;
  sectionExportName: string;
  sectionType: SectionType;
  kind: VisualNodeKind;
  visibility: SectionVisibility;
  layout: VisualSectionLayout;
  settings: VisualSectionSettings;
  styling: VisualSectionStyling;
  animation: VisualSectionAnimation;
};

export function inferSectionType(exportName: string, kind: VisualNodeKind): SectionType {
  const n = exportName.toLowerCase();
  if (kind === "hero" || n.includes("hero")) return "hero";
  if (kind === "header" || n.includes("header") || n.includes("nav")) return "header";
  if (kind === "footer" || n.includes("footer")) return "footer";
  if (kind === "cta" || n.includes("cta")) return "cta";
  if (n.includes("about")) return "about";
  if (n.includes("service")) return "services";
  if (n.includes("feature")) return "features";
  if (n.includes("gallery")) return "gallery";
  if (n.includes("pricing") || n.includes("price")) return "pricing";
  if (n.includes("testimonial") || n.includes("proof")) return "testimonials";
  if (n.includes("team")) return "team";
  if (n.includes("faq")) return "faq";
  if (n.includes("contact")) return "contact";
  return "custom";
}

export function defaultSectionLayout(): VisualSectionLayout {
  return {
    width: "container",
    columns: 1,
    gap: "1.5rem",
    alignment: "stretch",
  };
}

export function defaultSectionSettings(): VisualSectionSettings {
  return {
    htmlId: "",
    anchor: "",
    cssClasses: "",
    customAttributes: "",
  };
}

export function defaultSectionStyling(): VisualSectionStyling {
  return {
    padding: "",
    margin: "",
    borderWidth: "0",
    borderColor: "transparent",
    borderStyle: "solid",
    radius: "0",
    shadow: "none",
    opacity: 100,
    zIndex: 0,
    overflow: "visible",
  };
}

export function defaultSectionAnimation(): VisualSectionAnimation {
  return {
    type: "none",
    durationMs: 600,
    delayMs: 0,
  };
}

export function createDefaultSectionConfig(
  partial: Pick<
    VisualSectionConfig,
    "id" | "sectionExportName" | "sectionType" | "kind"
  > &
    Partial<VisualSectionConfig>,
): VisualSectionConfig {
  const {
    id,
    sectionExportName,
    sectionType,
    kind,
    visibility,
    layout,
    settings,
    styling,
    animation,
  } = partial;

  return {
    id,
    sectionExportName,
    sectionType,
    kind,
    visibility: visibility ?? "show",
    layout: layout ?? defaultSectionLayout(),
    settings: settings ?? defaultSectionSettings(),
    styling: styling ?? defaultSectionStyling(),
    animation: animation ?? defaultSectionAnimation(),
  };
}

export const SECTION_TYPE_LABELS: Record<SectionType, string> = {
  hero: "Hero",
  about: "About",
  services: "Services",
  features: "Features",
  gallery: "Gallery",
  pricing: "Pricing",
  testimonials: "Testimonials",
  team: "Team",
  faq: "FAQ",
  contact: "Contact",
  cta: "CTA",
  footer: "Footer",
  header: "Header",
  custom: "Custom",
};

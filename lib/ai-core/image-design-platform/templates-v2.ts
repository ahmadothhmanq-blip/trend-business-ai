/**
 * Canvas templates v2 — full documents with elements, layers, brand placeholders.
 */

import type { CanvasDocumentModel } from "@/lib/ai-core/image-design-platform/editor/types";
import { createCanvasDocument } from "@/lib/ai-core/image-design-platform/editor/document";
import { createElement } from "@/lib/ai-core/image-design-platform/editor/elements";

export type CanvasTemplateCategory =
  | "social-media"
  | "ads"
  | "product-marketing"
  | "presentations"
  | "posters"
  | "business-documents";

export type CanvasTemplateV2 = {
  id: string;
  label: string;
  category: CanvasTemplateCategory;
  description: string;
  width: number;
  height: number;
  brandPlaceholders: {
    primaryColor?: boolean;
    secondaryColor?: boolean;
    accentColor?: boolean;
    headingFont?: boolean;
    bodyFont?: boolean;
    logo?: boolean;
    tagline?: boolean;
  };
  build: (generationId: string, name: string) => CanvasDocumentModel;
};

function brandedPost(generationId: string, name: string, w: number, h: number): CanvasDocumentModel {
  const doc = createCanvasDocument({ generationId, name, width: w, height: h, templateId: "branded-post" });
  const bgLayer = doc.layers[0]!;
  const contentLayer = doc.layers[1]!;
  bgLayer.elements = [
    createElement("background", {
      name: "Background",
      transform: { x: 0, y: 0, width: w, height: h, rotation: 0, opacity: 1, scaleX: 1, scaleY: 1 },
      fill: "{{brand.primary}}",
    }),
  ];
  contentLayer.elements = [
    createElement("shape", {
      name: "Accent block",
      transform: { x: 48, y: h - 180, width: w - 96, height: 120, rotation: 0, opacity: 0.9, scaleX: 1, scaleY: 1 },
      fill: "{{brand.accent}}",
      cornerRadius: 16,
    }),
    createElement("text", {
      name: "Headline",
      content: "{{brand.tagline}}",
      transform: { x: 72, y: 72, width: w - 144, height: 120, rotation: 0, opacity: 1, scaleX: 1, scaleY: 1 },
      fontFamily: "{{brand.headingFont}}",
      fontSize: 56,
      color: "#FFFFFF",
      fontWeight: 700,
    }),
    createElement("logo", {
      name: "Brand Logo",
      transform: { x: w - 200, y: 48, width: 140, height: 140, rotation: 0, opacity: 1, scaleX: 1, scaleY: 1 },
      svg: "{{brand.logoSvg}}",
    }),
  ];
  return doc;
}

export const CANVAS_TEMPLATES_V2: CanvasTemplateV2[] = [
  {
    id: "social-square",
    label: "Social Square Post",
    category: "social-media",
    description: "Square social post with headline, accent bar, and logo slot.",
    width: 1080,
    height: 1080,
    brandPlaceholders: { primaryColor: true, accentColor: true, headingFont: true, logo: true, tagline: true },
    build: (gid, name) => brandedPost(gid, name, 1080, 1080),
  },
  {
    id: "story-vertical",
    label: "Story Vertical",
    category: "social-media",
    description: "9:16 story layout with bold headline zone.",
    width: 1080,
    height: 1920,
    brandPlaceholders: { primaryColor: true, accentColor: true, headingFont: true, logo: true },
    build: (gid, name) => brandedPost(gid, name, 1080, 1920),
  },
  {
    id: "facebook-ad",
    label: "Facebook Ad",
    category: "ads",
    description: "Conversion ad with CTA strip and product image zone.",
    width: 1200,
    height: 628,
    brandPlaceholders: { primaryColor: true, secondaryColor: true, accentColor: true, bodyFont: true },
    build: (gid, name) => {
      const doc = createCanvasDocument({ generationId: gid, name, width: 1200, height: 628, templateId: "facebook-ad" });
      const content = doc.layers[1]!;
      content.elements = [
        createElement("image", {
          name: "Hero Image",
          transform: { x: 620, y: 40, width: 540, height: 548, rotation: 0, opacity: 1, scaleX: 1, scaleY: 1 },
          src: "",
        }),
        createElement("text", {
          name: "Ad Headline",
          content: "Your offer headline",
          transform: { x: 48, y: 80, width: 520, height: 160, rotation: 0, opacity: 1, scaleX: 1, scaleY: 1 },
          fontFamily: "{{brand.headingFont}}",
          fontSize: 48,
          color: "{{brand.primary}}",
        }),
        createElement("shape", {
          name: "CTA Button",
          transform: { x: 48, y: 480, width: 220, height: 64, rotation: 0, opacity: 1, scaleX: 1, scaleY: 1 },
          fill: "{{brand.accent}}",
          cornerRadius: 32,
        }),
      ];
      return doc;
    },
  },
  {
    id: "product-feature",
    label: "Product Feature Card",
    category: "product-marketing",
    description: "Product hero with feature bullets and brand colors.",
    width: 1200,
    height: 1200,
    brandPlaceholders: { primaryColor: true, accentColor: true, logo: true },
    build: (gid, name) => brandedPost(gid, name, 1200, 1200),
  },
  {
    id: "presentation-cover",
    label: "Presentation Cover",
    category: "presentations",
    description: "16:9 deck cover with title and brand mark.",
    width: 1920,
    height: 1080,
    brandPlaceholders: { primaryColor: true, headingFont: true, logo: true, tagline: true },
    build: (gid, name) => brandedPost(gid, name, 1920, 1080),
  },
  {
    id: "poster-promo",
    label: "Promo Poster",
    category: "posters",
    description: "Large format poster with headline and brand frame.",
    width: 2480,
    height: 3508,
    brandPlaceholders: { primaryColor: true, accentColor: true, headingFont: true, logo: true },
    build: (gid, name) => brandedPost(gid, name, 2480, 3508),
  },
  {
    id: "business-letterhead",
    label: "Business Letterhead",
    category: "business-documents",
    description: "Corporate document header with logo and contact strip.",
    width: 2480,
    height: 3508,
    brandPlaceholders: { primaryColor: true, secondaryColor: true, bodyFont: true, logo: true },
    build: (gid, name) => {
      const doc = createCanvasDocument({ generationId: gid, name, width: 2480, height: 3508, templateId: "business-letterhead" });
      const content = doc.layers[1]!;
      content.elements = [
        createElement("shape", {
          name: "Header bar",
          transform: { x: 0, y: 0, width: 2480, height: 200, rotation: 0, opacity: 1, scaleX: 1, scaleY: 1 },
          fill: "{{brand.primary}}",
        }),
        createElement("logo", {
          name: "Logo",
          transform: { x: 120, y: 40, width: 120, height: 120, rotation: 0, opacity: 1, scaleX: 1, scaleY: 1 },
          svg: "{{brand.logoSvg}}",
        }),
        createElement("text", {
          name: "Company",
          content: "{{brand.brandName}}",
          transform: { x: 280, y: 70, width: 800, height: 80, rotation: 0, opacity: 1, scaleX: 1, scaleY: 1 },
          fontFamily: "{{brand.headingFont}}",
          fontSize: 42,
          color: "#FFFFFF",
        }),
      ];
      return doc;
    },
  },
];

export function listCanvasTemplatesV2(category?: CanvasTemplateCategory) {
  return CANVAS_TEMPLATES_V2.filter((t) => !category || t.category === category);
}

export function getCanvasTemplateV2(id: string) {
  return CANVAS_TEMPLATES_V2.find((t) => t.id === id);
}

export function applyBrandPlaceholders(
  doc: CanvasDocumentModel,
  brand: {
    brandName?: string;
    primary?: string;
    secondary?: string;
    accent?: string;
    headingFont?: string;
    bodyFont?: string;
    tagline?: string;
    logoSvg?: string;
  },
): CanvasDocumentModel {
  const map: Record<string, string> = {
    "{{brand.primary}}": brand.primary ?? "#7C3AED",
    "{{brand.secondary}}": brand.secondary ?? "#06B6D4",
    "{{brand.accent}}": brand.accent ?? "#F59E0B",
    "{{brand.headingFont}}": brand.headingFont ?? "Georgia, serif",
    "{{brand.bodyFont}}": brand.bodyFont ?? "Inter, sans-serif",
    "{{brand.tagline}}": brand.tagline ?? brand.brandName ?? "Your brand",
    "{{brand.brandName}}": brand.brandName ?? "Brand",
    "{{brand.logoSvg}}": brand.logoSvg ?? "",
  };

  const replace = (value: string) => {
    let out = value;
    for (const [key, val] of Object.entries(map)) out = out.split(key).join(val);
    return out;
  };

  const cloned = JSON.parse(JSON.stringify(doc)) as CanvasDocumentModel;
  cloned.brand = {
    brandKitId: cloned.brand?.brandKitId,
    brandName: brand.brandName,
    primary: brand.primary,
    secondary: brand.secondary,
    accent: brand.accent,
    headingFont: brand.headingFont,
    bodyFont: brand.bodyFont,
    logoSvg: brand.logoSvg,
  };

  for (const layer of cloned.layers) {
    for (const el of layer.elements) {
      if (el.type === "text") {
        el.content = replace(el.content);
        el.fontFamily = replace(el.fontFamily);
        el.color = replace(el.color);
      }
      if (el.type === "shape" || el.type === "background") {
        el.fill = replace(el.fill);
      }
      if (el.type === "logo") {
        el.svg = replace(el.svg ?? "");
      }
    }
  }
  return cloned;
}

/**
 * Canvas element factories.
 */

import { createId } from "@/lib/ai-core/image-design-platform/ids";
import type {
  BackgroundElement,
  CanvasElement,
  CanvasElementType,
  IconElement,
  ImageElement,
  LogoElement,
  ShapeElement,
  TextElement,
} from "@/lib/ai-core/image-design-platform/editor/types";
import { defaultTransform } from "@/lib/ai-core/image-design-platform/editor/document";

export function createElement(
  type: CanvasElementType,
  params: Partial<CanvasElement> & { name?: string },
): CanvasElement {
  const base = {
    id: createId("el"),
    name: params.name ?? type.charAt(0).toUpperCase() + type.slice(1),
    transform: params.transform ?? defaultTransform(200, 100),
    locked: false,
    visible: true,
    zIndex: params.zIndex ?? 0,
  };

  switch (type) {
    case "image":
      return {
        ...base,
        type: "image",
        src: (params as ImageElement).src ?? "",
        assetId: (params as ImageElement).assetId,
        fit: (params as ImageElement).fit ?? "cover",
      } satisfies ImageElement;
    case "text":
      return {
        ...base,
        type: "text",
        content: (params as TextElement).content ?? "Add your text",
        fontFamily: (params as TextElement).fontFamily ?? "Inter, sans-serif",
        fontSize: (params as TextElement).fontSize ?? 32,
        fontWeight: (params as TextElement).fontWeight ?? 600,
        color: (params as TextElement).color ?? "#111111",
        align: (params as TextElement).align ?? "left",
        lineHeight: (params as TextElement).lineHeight ?? 1.3,
      } satisfies TextElement;
    case "shape":
      return {
        ...base,
        type: "shape",
        shape: (params as ShapeElement).shape ?? "rectangle",
        fill: (params as ShapeElement).fill ?? "#7C3AED",
        stroke: (params as ShapeElement).stroke ?? "transparent",
        strokeWidth: (params as ShapeElement).strokeWidth ?? 0,
        cornerRadius: (params as ShapeElement).cornerRadius ?? 8,
      } satisfies ShapeElement;
    case "logo":
      return {
        ...base,
        type: "logo",
        src: (params as LogoElement).src ?? "",
        svg: (params as LogoElement).svg,
        brandKitId: (params as LogoElement).brandKitId,
      } satisfies LogoElement;
    case "icon":
      return {
        ...base,
        type: "icon",
        iconName: (params as IconElement).iconName ?? "star",
        color: (params as IconElement).color ?? "#111111",
      } satisfies IconElement;
    case "background":
      return {
        ...base,
        type: "background",
        fill: (params as BackgroundElement).fill ?? "#FFFFFF",
        gradient: (params as BackgroundElement).gradient,
        imageSrc: (params as BackgroundElement).imageSrc,
        transform: defaultTransform(
          (params as BackgroundElement).transform?.width ?? 1080,
          (params as BackgroundElement).transform?.height ?? 1080,
        ),
      } satisfies BackgroundElement;
    default:
      return createElement("shape", params);
  }
}

export function updateElement(
  element: CanvasElement,
  patch: Partial<CanvasElement>,
): CanvasElement {
  return { ...element, ...patch, id: element.id, type: element.type } as CanvasElement;
}

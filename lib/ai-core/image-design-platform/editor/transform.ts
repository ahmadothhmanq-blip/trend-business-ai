/**
 * Transform operations for canvas elements.
 */

import type {
  CanvasDocumentModel,
  CanvasElement,
  CanvasTransform,
} from "@/lib/ai-core/image-design-platform/editor/types";
import { updateElementInDoc } from "@/lib/ai-core/image-design-platform/editor/layers";
import { bumpDocumentVersion } from "@/lib/ai-core/image-design-platform/editor/document";

export function applyTransform(
  doc: CanvasDocumentModel,
  elementId: string,
  patch: Partial<CanvasTransform>,
): CanvasDocumentModel {
  const next = updateElementInDoc(doc, elementId, {
    transform: undefined,
  } as Partial<CanvasElement>);
  const layer = next.layers.find((l) => l.elements.some((e) => e.id === elementId));
  const element = layer?.elements.find((e) => e.id === elementId);
  if (!element) return doc;
  return updateElementInDoc(next, elementId, {
    transform: { ...element.transform, ...patch },
  } as Partial<CanvasElement>);
}

export function moveElement(
  doc: CanvasDocumentModel,
  elementId: string,
  x: number,
  y: number,
): CanvasDocumentModel {
  return applyTransform(doc, elementId, { x, y });
}

export function resizeElement(
  doc: CanvasDocumentModel,
  elementId: string,
  width: number,
  height: number,
): CanvasDocumentModel {
  return applyTransform(doc, elementId, { width, height });
}

export function rotateElement(
  doc: CanvasDocumentModel,
  elementId: string,
  rotation: number,
): CanvasDocumentModel {
  return applyTransform(doc, elementId, { rotation });
}

export function setOpacity(
  doc: CanvasDocumentModel,
  elementId: string,
  opacity: number,
): CanvasDocumentModel {
  return applyTransform(doc, elementId, { opacity: Math.max(0, Math.min(1, opacity)) });
}

export function updateTextStyle(
  doc: CanvasDocumentModel,
  elementId: string,
  patch: {
    content?: string;
    fontFamily?: string;
    fontSize?: number;
    color?: string;
    align?: "left" | "center" | "right";
  },
): CanvasDocumentModel {
  return updateElementInDoc(doc, elementId, patch as Partial<CanvasElement>);
}

export function resizeCanvas(
  doc: CanvasDocumentModel,
  width: number,
  height: number,
): CanvasDocumentModel {
  return bumpDocumentVersion({ ...doc, width, height });
}

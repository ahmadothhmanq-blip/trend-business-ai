/**
 * Canvas document model — create, clone, serialize.
 */

import { createId } from "@/lib/ai-core/image-design-platform/ids";
import type {
  CanvasDocumentModel,
  CanvasLayer,
  CanvasSizePreset,
} from "@/lib/ai-core/image-design-platform/editor/types";

export const CANVAS_SIZE_PRESETS: CanvasSizePreset[] = [
  { id: "ig-post", label: "Instagram Post", width: 1080, height: 1080, category: "social-media" },
  { id: "ig-story", label: "Instagram Story", width: 1080, height: 1920, category: "social-media" },
  { id: "fb-ad", label: "Facebook Ad", width: 1200, height: 628, category: "ads" },
  { id: "linkedin-banner", label: "LinkedIn Banner", width: 1584, height: 396, category: "business-documents" },
  { id: "presentation", label: "Presentation 16:9", width: 1920, height: 1080, category: "presentations" },
  { id: "poster-a4", label: "Poster A4", width: 2480, height: 3508, category: "posters" },
  { id: "product-card", label: "Product Card", width: 1200, height: 1200, category: "product-marketing" },
];

export function defaultTransform(width: number, height: number) {
  return {
    x: 0,
    y: 0,
    width,
    height,
    rotation: 0,
    opacity: 1,
    scaleX: 1,
    scaleY: 1,
  };
}

export function createEmptyLayer(name: string, zIndex: number): CanvasLayer {
  return {
    id: createId("layer"),
    name,
    elements: [],
    visible: true,
    locked: false,
    zIndex,
  };
}

export function createCanvasDocument(params: {
  generationId: string;
  name: string;
  width?: number;
  height?: number;
  templateId?: string;
  backgroundColor?: string;
}): CanvasDocumentModel {
  const width = params.width ?? 1080;
  const height = params.height ?? 1080;
  return {
    id: createId("canvas"),
    generationId: params.generationId,
    name: params.name,
    width,
    height,
    backgroundColor: params.backgroundColor ?? "#FFFFFF",
    layers: [createEmptyLayer("Background", 0), createEmptyLayer("Content", 1)],
    templateId: params.templateId,
    version: 1,
    updatedAt: new Date().toISOString(),
  };
}

export function cloneDocument(doc: CanvasDocumentModel): CanvasDocumentModel {
  return JSON.parse(JSON.stringify(doc)) as CanvasDocumentModel;
}

export function bumpDocumentVersion(doc: CanvasDocumentModel): CanvasDocumentModel {
  return {
    ...doc,
    version: doc.version + 1,
    updatedAt: new Date().toISOString(),
  };
}

export function getCanvasPreset(id: string): CanvasSizePreset | undefined {
  return CANVAS_SIZE_PRESETS.find((p) => p.id === id);
}

export function flattenElements(doc: CanvasDocumentModel) {
  return [...doc.layers]
    .sort((a, b) => a.zIndex - b.zIndex)
    .flatMap((layer) =>
      layer.visible
        ? [...layer.elements].sort((a, b) => a.zIndex - b.zIndex)
        : [],
    );
}

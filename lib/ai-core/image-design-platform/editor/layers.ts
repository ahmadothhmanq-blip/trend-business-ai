/**
 * Layer management operations.
 */

import { createId } from "@/lib/ai-core/image-design-platform/ids";
import type {
  CanvasDocumentModel,
  CanvasElement,
  CanvasLayer,
} from "@/lib/ai-core/image-design-platform/editor/types";
import { bumpDocumentVersion } from "@/lib/ai-core/image-design-platform/editor/document";

export function findLayer(doc: CanvasDocumentModel, layerId: string): CanvasLayer | undefined {
  return doc.layers.find((l) => l.id === layerId);
}

export function findElement(
  doc: CanvasDocumentModel,
  elementId: string,
): { layer: CanvasLayer; element: CanvasElement } | null {
  for (const layer of doc.layers) {
    const element = layer.elements.find((e) => e.id === elementId);
    if (element) return { layer, element };
  }
  return null;
}

export function addLayer(doc: CanvasDocumentModel, name?: string): CanvasDocumentModel {
  const zIndex = doc.layers.length ? Math.max(...doc.layers.map((l) => l.zIndex)) + 1 : 0;
  const layer: CanvasLayer = {
    id: createId("layer"),
    name: name ?? `Layer ${doc.layers.length + 1}`,
    elements: [],
    visible: true,
    locked: false,
    zIndex,
  };
  return bumpDocumentVersion({ ...doc, layers: [...doc.layers, layer] });
}

export function removeLayer(doc: CanvasDocumentModel, layerId: string): CanvasDocumentModel {
  if (doc.layers.length <= 1) return doc;
  return bumpDocumentVersion({
    ...doc,
    layers: doc.layers.filter((l) => l.id !== layerId),
  });
}

export function duplicateLayer(doc: CanvasDocumentModel, layerId: string): CanvasDocumentModel {
  const source = findLayer(doc, layerId);
  if (!source) return doc;
  const zIndex = Math.max(...doc.layers.map((l) => l.zIndex)) + 1;
  const copy: CanvasLayer = {
    ...JSON.parse(JSON.stringify(source)),
    id: createId("layer"),
    name: `${source.name} Copy`,
    zIndex,
    elements: source.elements.map((e) => ({
      ...JSON.parse(JSON.stringify(e)),
      id: createId("el"),
    })),
  };
  return bumpDocumentVersion({ ...doc, layers: [...doc.layers, copy] });
}

export function reorderLayers(
  doc: CanvasDocumentModel,
  layerId: string,
  newIndex: number,
): CanvasDocumentModel {
  const layers = [...doc.layers].sort((a, b) => a.zIndex - b.zIndex);
  const from = layers.findIndex((l) => l.id === layerId);
  if (from === -1) return doc;
  const [item] = layers.splice(from, 1);
  layers.splice(newIndex, 0, item!);
  const reindexed = layers.map((l, i) => ({ ...l, zIndex: i }));
  return bumpDocumentVersion({ ...doc, layers: reindexed });
}

export function setLayerVisibility(
  doc: CanvasDocumentModel,
  layerId: string,
  visible: boolean,
): CanvasDocumentModel {
  return bumpDocumentVersion({
    ...doc,
    layers: doc.layers.map((l) => (l.id === layerId ? { ...l, visible } : l)),
  });
}

export function setLayerLocked(
  doc: CanvasDocumentModel,
  layerId: string,
  locked: boolean,
): CanvasDocumentModel {
  return bumpDocumentVersion({
    ...doc,
    layers: doc.layers.map((l) => (l.id === layerId ? { ...l, locked } : l)),
  });
}

export function addElementToLayer(
  doc: CanvasDocumentModel,
  layerId: string,
  element: CanvasElement,
): CanvasDocumentModel {
  return bumpDocumentVersion({
    ...doc,
    layers: doc.layers.map((l) =>
      l.id === layerId && !l.locked
        ? { ...l, elements: [...l.elements, element] }
        : l,
    ),
  });
}

export function removeElement(
  doc: CanvasDocumentModel,
  elementId: string,
): CanvasDocumentModel {
  return bumpDocumentVersion({
    ...doc,
    layers: doc.layers.map((l) => ({
      ...l,
      elements: l.elements.filter((e) => e.id !== elementId),
    })),
  });
}

export function updateElementInDoc(
  doc: CanvasDocumentModel,
  elementId: string,
  patch: Partial<CanvasElement>,
): CanvasDocumentModel {
  return bumpDocumentVersion({
    ...doc,
    layers: doc.layers.map((l) => ({
      ...l,
      elements: l.elements.map((e) =>
        e.id === elementId ? ({ ...e, ...patch, id: e.id, type: e.type } as CanvasElement) : e,
      ),
    })),
  });
}

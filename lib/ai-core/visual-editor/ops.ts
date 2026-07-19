/**
 * Visual editor operations → WebsiteEditAction[] for persistence.
 */

import type { WebsiteEditAction } from "@/lib/ai-core/website-editor/types";
import type {
  VisualDocument,
  VisualNode,
  VisualNodeKind,
} from "@/lib/ai-core/visual-editor/types";

export function insertNode(
  doc: VisualDocument,
  node: Omit<VisualNode, "id">,
  index?: number,
): VisualDocument {
  const insertAt =
    typeof index === "number"
      ? Math.max(0, Math.min(index, doc.nodes.length))
      : Math.max(
          0,
          doc.nodes.findIndex((n) => n.kind === "cta" || n.kind === "footer"),
        );
  const at = insertAt < 0 ? doc.nodes.length : insertAt;
  const nextNode: VisualNode = {
    ...node,
    id: `node-${at}-${node.exportName}-${Date.now()}`,
  };
  const nodes = [
    ...doc.nodes.slice(0, at),
    nextNode,
    ...doc.nodes.slice(at),
  ].map((n, i) => ({ ...n, id: `node-${i}-${n.exportName}` }));
  return {
    ...doc,
    nodes,
    selectedNodeId: nodes[at]?.id ?? nextNode.id,
    dirty: true,
    updatedAt: new Date().toISOString(),
  };
}

/** Insert a marketplace component by export name / path / kind. */
export function insertMarketplaceComponent(
  doc: VisualDocument,
  params: {
    exportName: string;
    path: string;
    kind: VisualNodeKind;
    label: string;
    text?: string;
    index?: number;
  },
): VisualDocument {
  return insertNode(
    doc,
    {
      exportName: params.exportName,
      path: params.path,
      kind: params.kind,
      label: params.label,
      text: params.text || params.label,
      locked: params.kind === "header" || params.kind === "footer",
    },
    params.index,
  );
}

export function moveNode(
  doc: VisualDocument,
  fromIndex: number,
  toIndex: number,
): VisualDocument {
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= doc.nodes.length ||
    toIndex >= doc.nodes.length ||
    fromIndex === toIndex
  ) {
    return doc;
  }
  const nodes = [...doc.nodes];
  const [item] = nodes.splice(fromIndex, 1);
  if (!item) return doc;
  nodes.splice(toIndex, 0, item);
  return {
    ...doc,
    nodes: nodes.map((n, i) => ({ ...n, id: `node-${i}-${n.exportName}` })),
    dirty: true,
    updatedAt: new Date().toISOString(),
  };
}

export function duplicateNode(
  doc: VisualDocument,
  nodeId: string,
): VisualDocument {
  const idx = doc.nodes.findIndex((n) => n.id === nodeId);
  if (idx < 0) return doc;
  const node = doc.nodes[idx]!;
  if (node.locked) return doc;
  const copy = {
    ...node,
    id: `node-${idx + 1}-dup-${node.exportName}-${Date.now()}`,
    label: `${node.label} (copy)`,
  };
  const nodes = [
    ...doc.nodes.slice(0, idx + 1),
    copy,
    ...doc.nodes.slice(idx + 1),
  ].map((n, i) => ({ ...n, id: `node-${i}-${n.exportName}` }));
  return {
    ...doc,
    nodes,
    selectedNodeId: nodes[idx + 1]?.id ?? nodeId,
    dirty: true,
    updatedAt: new Date().toISOString(),
  };
}

export function deleteNode(
  doc: VisualDocument,
  nodeId: string,
): VisualDocument {
  const node = doc.nodes.find((n) => n.id === nodeId);
  if (!node || node.locked) return doc;
  if (node.kind === "hero" && doc.nodes.filter((n) => n.kind === "hero").length <= 1) {
    return doc;
  }
  const nodes = doc.nodes
    .filter((n) => n.id !== nodeId)
    .map((n, i) => ({ ...n, id: `node-${i}-${n.exportName}` }));
  return {
    ...doc,
    nodes,
    selectedNodeId: nodes[0]?.id ?? null,
    dirty: true,
    updatedAt: new Date().toISOString(),
  };
}

export function updateNodeText(
  doc: VisualDocument,
  nodeId: string,
  text: string,
): VisualDocument {
  return {
    ...doc,
    nodes: doc.nodes.map((n) =>
      n.id === nodeId ? { ...n, text } : n,
    ),
    dirty: true,
    updatedAt: new Date().toISOString(),
  };
}

export function updateNodeImage(
  doc: VisualDocument,
  nodeId: string,
  imageUrl: string,
): VisualDocument {
  return {
    ...doc,
    nodes: doc.nodes.map((n) =>
      n.id === nodeId ? { ...n, imageUrl } : n,
    ),
    dirty: true,
    updatedAt: new Date().toISOString(),
  };
}

export function updateTokens(
  doc: VisualDocument,
  patch: Partial<VisualDocument["tokens"]>,
): VisualDocument {
  return {
    ...doc,
    tokens: { ...doc.tokens, ...patch },
    dirty: true,
    updatedAt: new Date().toISOString(),
  };
}

export function selectNode(
  doc: VisualDocument,
  nodeId: string | null,
): VisualDocument {
  return { ...doc, selectedNodeId: nodeId };
}

export function setViewport(
  doc: VisualDocument,
  viewport: VisualDocument["viewport"],
): VisualDocument {
  return { ...doc, viewport };
}

/**
 * Diff a dirty document against the last saved baseline into persistable actions.
 */
export function documentToSaveActions(
  baseline: VisualDocument,
  current: VisualDocument,
): WebsiteEditAction[] {
  const actions: WebsiteEditAction[] = [];

  const baseOrder = baseline.nodes.map((n) => n.exportName);
  const currOrder = current.nodes.map((n) => n.exportName);

  // Removals
  for (const name of baseOrder) {
    if (!currOrder.includes(name)) {
      actions.push({ type: "remove-section", target: name });
    }
  }

  // Marketplace inserts (new names) → add-section; extra copies → duplicate-section
  const baseCounts = countNames(baseOrder);
  const currCounts = countNames(currOrder);
  for (const [name, count] of Object.entries(currCounts)) {
    const prev = baseCounts[name] || 0;
    if (prev === 0) {
      // Brand-new component from marketplace / library
      for (let i = 0; i < count; i += 1) {
        actions.push({
          type: "add-section",
          componentId: name,
          target: name,
          notes: i === 0 ? "Inserted from Component Marketplace" : "Additional insert",
        });
      }
    } else {
      for (let i = prev; i < count; i += 1) {
        actions.push({
          type: "duplicate-section",
          target: name,
          componentId: name,
        });
      }
    }
  }

  // Reorder when sequence differs (after adds so order includes new IDs)
  if (currOrder.join("|") !== baseOrder.join("|")) {
    actions.push({
      type: "reorder-sections",
      value: JSON.stringify(currOrder),
    });
  }

  // Text edits
  for (const node of current.nodes) {
    const baseNode =
      baseline.nodes.find((n) => n.id === node.id) ||
      baseline.nodes.find((n) => n.exportName === node.exportName);
    if (node.text && baseNode && node.text !== baseNode.text) {
      actions.push({
        type: "update-text",
        target: node.exportName,
        value: node.text,
      });
    }
    if (node.imageUrl && baseNode && node.imageUrl !== baseNode.imageUrl) {
      actions.push({
        type: "update-image",
        target: node.exportName,
        value: node.imageUrl,
      });
    }
  }

  // Tokens
  if (current.tokens.primary !== baseline.tokens.primary) {
    actions.push({
      type: "update-colors",
      target: "primary",
      value: current.tokens.primary,
    });
  }
  if (current.tokens.secondary !== baseline.tokens.secondary) {
    actions.push({
      type: "update-colors",
      target: "secondary",
      value: current.tokens.secondary,
    });
  }
  if (current.tokens.accent !== baseline.tokens.accent) {
    actions.push({
      type: "update-colors",
      target: "accent",
      value: current.tokens.accent,
    });
  }
  if (current.tokens.background !== baseline.tokens.background) {
    actions.push({
      type: "update-colors",
      target: "background",
      value: current.tokens.background,
    });
  }
  if (current.tokens.headingFont !== baseline.tokens.headingFont) {
    actions.push({
      type: "update-typography",
      target: "heading",
      value: current.tokens.headingFont,
    });
  }
  if (current.tokens.bodyFont !== baseline.tokens.bodyFont) {
    actions.push({
      type: "update-typography",
      target: "body",
      value: current.tokens.bodyFont,
    });
  }
  if (current.tokens.sectionY !== baseline.tokens.sectionY) {
    const density =
      current.tokens.sectionY.includes("4")
        ? "compact"
        : current.tokens.sectionY.includes("7") ||
            current.tokens.sectionY.includes("8")
          ? "airy"
          : "balanced";
    actions.push({ type: "update-spacing", value: density });
  }

  return actions;
}

function countNames(names: string[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const n of names) out[n] = (out[n] || 0) + 1;
  return out;
}

/**
 * Visual editor operations → WebsiteEditAction[] for persistence.
 */

import type { WebsiteEditAction } from "@/lib/ai-core/website-editor/types";
import type {
  VisualDocument,
  VisualNode,
  VisualNodeKind,
} from "@/lib/ai-core/visual-editor/types";
import type { VisualButton } from "@/lib/ai-core/visual-editor/button-types";
import { buttonsEqual } from "@/lib/ai-core/visual-editor/button-persist";
import type { VisualLink } from "@/lib/ai-core/visual-editor/link-types";
import { linksEqual } from "@/lib/ai-core/visual-editor/link-persist";
import type { VisualIcon } from "@/lib/ai-core/visual-editor/icon-types";
import { iconToButtonPatch, iconsEqual } from "@/lib/ai-core/visual-editor/icon-persist";
import { sectionBackgroundsEqual } from "@/lib/ai-core/visual-editor/section-bg-persist";
import { createDefaultSectionBackground } from "@/lib/ai-core/visual-editor/section-bg-types";
import type { VisualSectionBackground } from "@/lib/ai-core/visual-editor/section-bg-types";
import {
  createDefaultSectionConfig,
  inferSectionType,
} from "@/lib/ai-core/visual-editor/section-types";
import type { VisualSectionConfig } from "@/lib/ai-core/visual-editor/section-types";
import { sectionConfigsEqual } from "@/lib/ai-core/visual-editor/section-persist";

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
  const sectionType = inferSectionType(params.exportName, params.kind);
  return insertNode(
    doc,
    {
      exportName: params.exportName,
      path: params.path,
      kind: params.kind,
      label: params.label,
      text: params.text || params.label,
      locked: params.kind === "header" || params.kind === "footer",
      sectionConfig: createDefaultSectionConfig({
        id: `${params.exportName}-section`,
        sectionExportName: params.exportName,
        sectionType,
        kind: params.kind,
      }),
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
    sectionConfig: node.sectionConfig
      ? {
          ...node.sectionConfig,
          id: `${node.exportName}-section-copy-${Date.now()}`,
        }
      : undefined,
    sectionBackground: node.sectionBackground
      ? { ...node.sectionBackground, id: `${node.exportName}-bg-copy-${Date.now()}` }
      : undefined,
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

export function insertNodeBefore(
  doc: VisualDocument,
  node: Omit<VisualNode, "id">,
  beforeNodeId: string,
): VisualDocument {
  const idx = doc.nodes.findIndex((n) => n.id === beforeNodeId);
  return insertNode(doc, node, idx < 0 ? undefined : idx);
}

export function insertNodeAfter(
  doc: VisualDocument,
  node: Omit<VisualNode, "id">,
  afterNodeId: string,
): VisualDocument {
  const idx = doc.nodes.findIndex((n) => n.id === afterNodeId);
  return insertNode(doc, node, idx < 0 ? undefined : idx + 1);
}

export function insertNodeAtEnd(
  doc: VisualDocument,
  node: Omit<VisualNode, "id">,
): VisualDocument {
  return insertNode(doc, node, doc.nodes.length);
}

export function moveNodeUp(doc: VisualDocument, nodeId: string): VisualDocument {
  const idx = doc.nodes.findIndex((n) => n.id === nodeId);
  if (idx <= 0) return doc;
  return moveNode(doc, idx, idx - 1);
}

export function moveNodeDown(doc: VisualDocument, nodeId: string): VisualDocument {
  const idx = doc.nodes.findIndex((n) => n.id === nodeId);
  if (idx < 0 || idx >= doc.nodes.length - 1) return doc;
  return moveNode(doc, idx, idx + 1);
}

export function moveNodeToPosition(
  doc: VisualDocument,
  nodeId: string,
  toIndex: number,
): VisualDocument {
  const fromIndex = doc.nodes.findIndex((n) => n.id === nodeId);
  if (fromIndex < 0) return doc;
  return moveNode(doc, fromIndex, toIndex);
}

export function updateNodeSectionConfig(
  doc: VisualDocument,
  nodeId: string,
  patch: Partial<VisualSectionConfig>,
): VisualDocument {
  return {
    ...doc,
    nodes: doc.nodes.map((n) => {
      if (n.id !== nodeId) return n;
      const base =
        n.sectionConfig ??
        createDefaultSectionConfig({
          id: `${n.exportName}-section`,
          sectionExportName: n.exportName,
          sectionType: inferSectionType(n.exportName, n.kind),
          kind: n.kind,
        });
      return {
        ...n,
        sectionConfig: {
          ...base,
          ...patch,
          layout: { ...base.layout, ...(patch.layout ?? {}) },
          settings: { ...base.settings, ...(patch.settings ?? {}) },
          styling: { ...base.styling, ...(patch.styling ?? {}) },
          animation: { ...base.animation, ...(patch.animation ?? {}) },
        },
      };
    }),
    dirty: true,
    updatedAt: new Date().toISOString(),
  };
}

export function updateNodeImage(
  doc: VisualDocument,
  nodeId: string,
  imageUrl: string,
): VisualDocument {
  const node = doc.nodes.find((n) => n.id === nodeId);
  if (!node?.sectionBackground) {
    return {
      ...doc,
      nodes: doc.nodes.map((n) =>
        n.id === nodeId ? { ...n, imageUrl } : n,
      ),
      dirty: true,
      updatedAt: new Date().toISOString(),
    };
  }
  return updateNodeSectionBackground(doc, nodeId, {
    url: imageUrl,
    source: imageUrl ? "url" : "none",
  });
}

export function updateNodeSectionBackground(
  doc: VisualDocument,
  nodeId: string,
  patch: Partial<VisualSectionBackground>,
): VisualDocument {
  return {
    ...doc,
    nodes: doc.nodes.map((n) => {
      if (n.id !== nodeId) return n;
      const current =
        n.sectionBackground ??
        createDefaultSectionBackground({
          id: `${n.exportName}-bg`,
          sectionExportName: n.exportName,
          kind: n.kind,
          url: n.imageUrl ?? "",
          source: n.imageUrl ? "url" : "none",
        });
      const nextBg = { ...current, ...patch };
      return {
        ...n,
        sectionBackground: nextBg,
        imageUrl: nextBg.url || undefined,
      };
    }),
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
  return { ...doc, selectedNodeId: nodeId, selectedButtonId: null, selectedLinkId: null, selectedIconId: null };
}

export function selectLink(
  doc: VisualDocument,
  nodeId: string,
  linkId: string,
): VisualDocument {
  const link = doc.nodes
    .find((n) => n.id === nodeId)
    ?.links?.find((l) => l.id === linkId);
  return {
    ...doc,
    selectedNodeId: nodeId,
    selectedLinkId: linkId,
    selectedButtonId: link?.buttonId ?? null,
    selectedIconId: null,
  };
}

export function selectButton(
  doc: VisualDocument,
  nodeId: string,
  buttonId: string,
): VisualDocument {
  return {
    ...doc,
    selectedNodeId: nodeId,
    selectedButtonId: buttonId,
    selectedLinkId: buttonId,
    selectedIconId: null,
  };
}

export function selectIcon(
  doc: VisualDocument,
  nodeId: string,
  iconId: string,
): VisualDocument {
  const icon = doc.nodes.find((n) => n.id === nodeId)?.icons?.find((i) => i.id === iconId);
  return {
    ...doc,
    selectedNodeId: nodeId,
    selectedIconId: iconId,
    selectedButtonId: icon?.buttonId ?? null,
    selectedLinkId: icon?.linkId ?? icon?.buttonId ?? null,
  };
}

export function updateNodeLink(
  doc: VisualDocument,
  nodeId: string,
  linkId: string,
  patch: Partial<VisualLink>,
): VisualDocument {
  const node = doc.nodes.find((n) => n.id === nodeId);
  const currentLink = node?.links?.find((l) => l.id === linkId);
  if (!currentLink) return doc;

  const nextLink = { ...currentLink, ...patch };
  let nextDoc: VisualDocument = {
    ...doc,
    nodes: doc.nodes.map((n) => {
      if (n.id !== nodeId || !n.links?.length) return n;
      return {
        ...n,
        links: n.links.map((l) => (l.id === linkId ? nextLink : l)),
      };
    }),
    dirty: true,
    updatedAt: new Date().toISOString(),
  };

  if (nextLink.buttonId && node?.buttons?.length) {
    nextDoc = updateNodeButton(nextDoc, nodeId, nextLink.buttonId, {
      label: nextLink.label,
      href: nextLink.href,
      linkType: nextLink.linkType as VisualButton["linkType"],
      target: nextLink.target,
      ariaLabel: nextLink.alt ?? "",
    });
  }

  return nextDoc;
}

export function updateNodeButton(
  doc: VisualDocument,
  nodeId: string,
  buttonId: string,
  patch: Partial<VisualButton>,
): VisualDocument {
  return {
    ...doc,
    nodes: doc.nodes.map((n) => {
      if (n.id !== nodeId) return n;
      const buttons = n.buttons?.map((btn) =>
        btn.id === buttonId ? { ...btn, ...patch } : btn,
      );
      const links = n.links?.map((link) => {
        if (link.buttonId !== buttonId && link.id !== buttonId) return link;
        return {
          ...link,
          label: patch.label ?? link.label,
          href: patch.href ?? link.href,
          linkType: (patch.linkType ?? link.linkType) as VisualLink["linkType"],
          target: patch.target ?? link.target,
        };
      });
      let icons = n.icons;
      if (
        icons?.length &&
        (patch.icon !== undefined || patch.iconName !== undefined || patch.ariaLabel !== undefined)
      ) {
        icons = icons.map((icon) => {
          if (icon.buttonId !== buttonId) return icon;
          return {
            ...icon,
            name: patch.iconName ?? icon.name,
            position:
              patch.icon === "none"
                ? "none"
                : patch.icon === "left" || patch.icon === "right"
                  ? patch.icon
                  : icon.position,
            ariaLabel: patch.ariaLabel ?? icon.ariaLabel,
            decorative:
              patch.ariaLabel !== undefined ? !patch.ariaLabel.trim() : icon.decorative,
          };
        });
      }
      return {
        ...n,
        ...(buttons ? { buttons } : {}),
        ...(links ? { links } : {}),
        ...(icons ? { icons } : {}),
      };
    }),
    dirty: true,
    updatedAt: new Date().toISOString(),
  };
}

export function updateNodeIcon(
  doc: VisualDocument,
  nodeId: string,
  iconId: string,
  patch: Partial<VisualIcon>,
): VisualDocument {
  const node = doc.nodes.find((n) => n.id === nodeId);
  const currentIcon = node?.icons?.find((i) => i.id === iconId);
  if (!currentIcon) return doc;

  const nextIcon = { ...currentIcon, ...patch };
  const buttonPatch = currentIcon.buttonId ? iconToButtonPatch(nextIcon) : null;

  return {
    ...doc,
    nodes: doc.nodes.map((n) => {
      if (n.id !== nodeId) return n;
      const icons = n.icons?.map((icon) => (icon.id === iconId ? nextIcon : icon));
      const buttons =
        buttonPatch && n.buttons
          ? n.buttons.map((btn) =>
              btn.id === currentIcon.buttonId ? { ...btn, ...buttonPatch } : btn,
            )
          : n.buttons;
      return {
        ...n,
        ...(icons ? { icons } : {}),
        ...(buttons ? { buttons } : {}),
      };
    }),
    dirty: true,
    updatedAt: new Date().toISOString(),
  };
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
    if (
      node.imageUrl &&
      baseNode &&
      node.imageUrl !== baseNode.imageUrl &&
      (!node.sectionBackground ||
        !baseNode.sectionBackground ||
        node.sectionBackground.url === baseNode.sectionBackground.url)
    ) {
      actions.push({
        type: "update-image",
        target: node.exportName,
        value: node.imageUrl,
      });
    }
    if (node.sectionBackground) {
      const baseBg = baseNode?.sectionBackground;
      if (!baseBg || !sectionBackgroundsEqual(node.sectionBackground, baseBg)) {
        actions.push({
          type: "update-section-background",
          target: node.exportName,
          value: JSON.stringify(node.sectionBackground),
          notes: node.sectionBackground.id,
        });
      }
    }
    if (node.sectionConfig) {
      const baseConfig = baseNode?.sectionConfig;
      if (!baseConfig || !sectionConfigsEqual(node.sectionConfig, baseConfig)) {
        actions.push({
          type: "update-section",
          target: node.exportName,
          value: JSON.stringify(node.sectionConfig),
          notes: node.sectionConfig.id,
        });
      }
    }
    if (node.buttons?.length) {
      for (const button of node.buttons) {
        const baseButton = baseNode?.buttons?.find((b) => b.id === button.id);
        if (!baseButton || !buttonsEqual(button, baseButton)) {
          actions.push({
            type: "update-button",
            target: node.exportName,
            value: JSON.stringify(button),
            notes: button.id,
          });
        }
      }
    }
    if (node.links?.length) {
      for (const link of node.links) {
        if (link.kind === "button" || link.kind === "cta") continue;
        const baseLink = baseNode?.links?.find((l) => l.id === link.id);
        if (!baseLink || !linksEqual(link, baseLink)) {
          actions.push({
            type: "update-link",
            target: node.exportName,
            value: JSON.stringify(link),
            notes: link.id,
          });
        }
      }
    }
    if (node.icons?.length) {
      for (const icon of node.icons) {
        const baseIcon = baseNode?.icons?.find((i) => i.id === icon.id);
        if (!baseIcon || !iconsEqual(icon, baseIcon)) {
          actions.push({
            type: "update-icon",
            target: node.exportName,
            value: JSON.stringify(icon),
            notes: icon.id,
          });
        }
      }
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

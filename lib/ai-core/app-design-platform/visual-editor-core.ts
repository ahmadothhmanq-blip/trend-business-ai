/**
 * Visual editor core — screen tree, props, responsive preview prep.
 */

import type {
  StructuredAppModel,
  VisualEditorNode,
  VisualEditorState,
  AppPreviewDevice,
} from "@/lib/ai-core/app-design-platform/types";

export function buildEditorTreeForScreen(
  model: StructuredAppModel,
  screenId: string,
): VisualEditorNode[] {
  const screen = model.screens.find((s) => s.id === screenId);
  if (!screen) return [];

  const comps = model.components.filter((c) => c.screenId === screenId);
  return [
    {
      id: `layout-${screen.id}`,
      type: `layout-${screen.layout}`,
      label: `${screen.name} Layout`,
      props: { path: screen.path, layout: screen.layout },
      children: comps.map((c) => ({
        id: c.id,
        type: c.type,
        label: c.type,
        props: { ...c.props },
        children: [],
      })),
    },
  ];
}

export function createVisualEditorState(
  model: StructuredAppModel,
  device: AppPreviewDevice = "desktop",
): VisualEditorState {
  const first = model.screens.find((s) => s.path !== "/login") || model.screens[0] || null;
  const selectedScreenId = first?.id ?? null;
  return {
    selectedScreenId,
    selectedNodeId: null,
    device,
    tree: selectedScreenId ? buildEditorTreeForScreen(model, selectedScreenId) : [],
  };
}

export function selectScreen(
  model: StructuredAppModel,
  state: VisualEditorState,
  screenId: string,
): VisualEditorState {
  return {
    ...state,
    selectedScreenId: screenId,
    selectedNodeId: null,
    tree: buildEditorTreeForScreen(model, screenId),
  };
}

export function updateNodeProps(
  state: VisualEditorState,
  nodeId: string,
  props: Record<string, unknown>,
): VisualEditorState {
  const patch = (nodes: VisualEditorNode[]): VisualEditorNode[] =>
    nodes.map((n) =>
      n.id === nodeId
        ? { ...n, props: { ...n.props, ...props } }
        : { ...n, children: patch(n.children) },
    );
  return { ...state, tree: patch(state.tree) };
}

export function applyEditorTreeToModel(
  model: StructuredAppModel,
  state: VisualEditorState,
): StructuredAppModel {
  if (!state.selectedScreenId) return model;
  const flat: Array<{ id: string; props: Record<string, unknown> }> = [];
  const walk = (nodes: VisualEditorNode[]) => {
    for (const n of nodes) {
      if (!n.id.startsWith("layout-")) flat.push({ id: n.id, props: n.props });
      walk(n.children);
    }
  };
  walk(state.tree);

  return {
    ...model,
    components: model.components.map((c) => {
      const hit = flat.find((f) => f.id === c.id);
      return hit ? { ...c, props: { ...c.props, ...hit.props } } : c;
    }),
    updatedAt: new Date().toISOString(),
    version: model.version + 1,
  };
}

export function reorderChild(
  state: VisualEditorState,
  parentId: string,
  fromIndex: number,
  toIndex: number,
): VisualEditorState {
  const reorder = (nodes: VisualEditorNode[]): VisualEditorNode[] =>
    nodes.map((n) => {
      if (n.id !== parentId) return { ...n, children: reorder(n.children) };
      const children = [...n.children];
      const [moved] = children.splice(fromIndex, 1);
      if (!moved) return n;
      children.splice(toIndex, 0, moved);
      return { ...n, children };
    });
  return { ...state, tree: reorder(state.tree) };
}

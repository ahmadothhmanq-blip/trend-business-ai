/**
 * Visual editor — drag/drop, add/remove components, screen reorder, styles.
 */

import { getAppComponent, listComponentsForTemplate } from "@/lib/ai-core/app-design-platform/components";
import { slugId } from "@/lib/ai-core/app-design-platform/ids";
import type {
  StructuredAppModel,
  VisualEditorNode,
  VisualEditorState,
} from "@/lib/ai-core/app-design-platform/types";

export {
  buildEditorTreeForScreen,
  createVisualEditorState,
  selectScreen,
  updateNodeProps,
  applyEditorTreeToModel,
  reorderChild,
} from "@/lib/ai-core/app-design-platform/visual-editor-core";

import {
  buildEditorTreeForScreen,
  createVisualEditorState,
  selectScreen,
  updateNodeProps,
  applyEditorTreeToModel,
  reorderChild,
} from "@/lib/ai-core/app-design-platform/visual-editor-core";

export function selectNode(state: VisualEditorState, nodeId: string | null): VisualEditorState {
  return { ...state, selectedNodeId: nodeId };
}

export function updateNodeStyles(
  state: VisualEditorState,
  nodeId: string,
  style: Record<string, string>,
): VisualEditorState {
  return updateNodeProps(state, nodeId, {
    style: { ...(state.tree.find((n) => n.id === nodeId)?.props?.style as object), ...style },
  });
}

export function addComponentToScreen(
  model: StructuredAppModel,
  screenId: string,
  componentType: string,
): { model: StructuredAppModel; componentId: string } {
  const def = getAppComponent(componentType);
  const id = slugId("comp", `${screenId}-${componentType}`, model.components.length);
  const instance = {
    id,
    type: componentType,
    screenId,
    props: { ...(def?.defaultProps || {}), title: def?.label || componentType },
    children: [] as string[],
  };

  const screens = model.screens.map((s) =>
    s.id === screenId
      ? { ...s, components: Array.from(new Set([...s.components, componentType])) }
      : s,
  );

  return {
    model: {
      ...model,
      screens,
      components: [...model.components, instance],
      updatedAt: new Date().toISOString(),
      version: model.version + 1,
    },
    componentId: id,
  };
}

export function removeComponentFromModel(
  model: StructuredAppModel,
  componentId: string,
): StructuredAppModel {
  const target = model.components.find((c) => c.id === componentId);
  if (!target) return model;

  return {
    ...model,
    components: model.components.filter((c) => c.id !== componentId),
    screens: model.screens.map((s) =>
      s.id === target.screenId
        ? {
            ...s,
            components: s.components.filter((t) => t !== target.type),
          }
        : s,
    ),
    updatedAt: new Date().toISOString(),
    version: model.version + 1,
  };
}

export function reorderScreens(
  model: StructuredAppModel,
  fromIndex: number,
  toIndex: number,
): StructuredAppModel {
  const screens = [...model.screens].sort((a, b) => a.order - b.order);
  const [moved] = screens.splice(fromIndex, 1);
  if (!moved) return model;
  screens.splice(toIndex, 0, moved);
  return {
    ...model,
    screens: screens.map((s, i) => ({ ...s, order: i })),
    updatedAt: new Date().toISOString(),
    version: model.version + 1,
  };
}

export function reorderComponentsOnScreen(
  model: StructuredAppModel,
  screenId: string,
  fromIndex: number,
  toIndex: number,
): StructuredAppModel {
  const onScreen = model.components.filter((c) => c.screenId === screenId);
  const other = model.components.filter((c) => c.screenId !== screenId);
  const list = [...onScreen];
  const [moved] = list.splice(fromIndex, 1);
  if (!moved) return model;
  list.splice(toIndex, 0, moved);
  return {
    ...model,
    components: [...other, ...list],
    updatedAt: new Date().toISOString(),
    version: model.version + 1,
  };
}

export function listEditorComponentPalette(templateId: string) {
  return listComponentsForTemplate(templateId).map((c) => ({
    id: c.id,
    label: c.label,
    category: c.category,
    description: c.description,
  }));
}

export function applyEditorReorder(
  model: StructuredAppModel,
  state: VisualEditorState,
  parentId: string,
  fromIndex: number,
  toIndex: number,
): { model: StructuredAppModel; state: VisualEditorState } {
  const nextState = reorderChild(state, parentId, fromIndex, toIndex);
  if (!state.selectedScreenId) return { model, state: nextState };

  const parent = nextState.tree.find((n) => n.id === parentId);
  if (!parent) return { model, state: nextState };

  const order = parent.children.map((c) => c.id);
  const onScreen = model.components.filter((c) => c.screenId === state.selectedScreenId);
  const other = model.components.filter((c) => c.screenId !== state.selectedScreenId);
  const sorted = order
    .map((id) => onScreen.find((c) => c.id === id))
    .filter((c): c is (typeof onScreen)[0] => Boolean(c));

  return {
    model: {
      ...model,
      components: [...other, ...sorted],
      updatedAt: new Date().toISOString(),
      version: model.version + 1,
    },
    state: nextState,
  };
}

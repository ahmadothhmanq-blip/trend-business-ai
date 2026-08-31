/**
 * Website editor service (Phase 6).
 * Commanded edits over the active WebsitePlan. No UI, API, DB, or publish.
 */

import { randomUUID } from "node:crypto";
import type { WebsiteComponent, WebsiteSection } from "@/lib/ai-core/website-builder/domain/contracts";
import { assertValidTheme } from "@/lib/ai-core/website-builder/domain/validation";
import type { WebsiteGeneratedStructure } from "@/lib/ai-core/website-builder/generation/contracts";
import type {
  ApplyEditorCommandInput,
  EditorCommand,
  EditorSelection,
  WebsiteEditorSession,
  WebsiteEditorStore,
} from "@/lib/ai-core/website-builder/editor/contracts";
import { WebsiteEditorError } from "@/lib/ai-core/website-builder/editor/errors";
import {
  cloneStructure,
  emptyEditorHistory,
  pushEditorHistory,
  redoEditorHistory,
  undoEditorHistory,
} from "@/lib/ai-core/website-builder/editor/history";
import {
  assertActiveEditablePlan,
  assertEditorSessionOwnership,
  assertEditorStructure,
  assertSelection,
  findComponent,
  findPage,
  findSection,
} from "@/lib/ai-core/website-builder/editor/validation";

const TEXT_COMPONENT_TYPES = new Set(["heading", "text", "quote", "link", "list", "card", "metric", "button"]);

export function createMemoryWebsiteEditorStore(): WebsiteEditorStore {
  const sessions = new Map<string, WebsiteEditorSession>();
  return {
    get: (key) => sessions.get(key),
    set: (key, session) => {
      sessions.set(key, session);
    },
  };
}

export function websiteEditorIdempotencyKey(session: WebsiteEditorSession, key: string): string {
  return `${session.id}:${session.autosave.revision}:${key}`;
}

function nowOr(value?: string): string {
  return value ?? new Date().toISOString();
}

function touch(structure: WebsiteGeneratedStructure, at: string): WebsiteGeneratedStructure {
  return {
    ...structure,
    theme: { ...structure.theme, updatedAt: at },
    navigation: { ...structure.navigation, updatedAt: at },
    project: { ...structure.project, updatedAt: at },
  };
}

function syncHomepageSeo(structure: WebsiteGeneratedStructure): WebsiteGeneratedStructure {
  const homepage = structure.pages.find((page) => page.isHomepage);
  if (!homepage) return structure;
  return { ...structure, seo: homepage.seo };
}

function removeNavPage(items: WebsiteGeneratedStructure["navigation"]["items"], pageId: string): WebsiteGeneratedStructure["navigation"]["items"] {
  return items
    .filter((item) => item.pageId !== pageId)
    .map((item, order) => ({ ...item, order, children: removeNavPage(item.children, pageId) }));
}

function remapSelection(selection: EditorSelection, structure: WebsiteGeneratedStructure): EditorSelection {
  const page = selection.pageId ? structure.pages.find((item) => item.id === selection.pageId) : null;
  const section = selection.sectionId ? structure.sections.find((item) => item.id === selection.sectionId) : null;
  const component = selection.componentId
    ? structure.components.find((item) => item.id === selection.componentId)
    : null;
  return {
    pageId: page?.id ?? null,
    sectionId: page && section && section.pageId === page.id ? section.id : null,
    componentId: page && section && component && component.sectionId === section.id ? component.id : null,
  };
}

function duplicateComponents(
  components: WebsiteComponent[],
  sectionId: string,
  createId: () => string,
): WebsiteComponent[] {
  const idMap = new Map<string, string>();
  for (const component of components) idMap.set(component.id, createId());
  return components.map((component) => ({
    ...component,
    id: idMap.get(component.id)!,
    sectionId,
    parentComponentId: component.parentComponentId ? idMap.get(component.parentComponentId) ?? null : null,
  }));
}

function applyMutation(
  structure: WebsiteGeneratedStructure,
  command: EditorCommand,
  createId: () => string,
  at: string,
): WebsiteGeneratedStructure {
  const next = cloneStructure(structure);
  switch (command.type) {
    case "editText": {
      const component = findComponent(next, command.componentId);
      if (!TEXT_COMPONENT_TYPES.has(component.type)) {
        throw new WebsiteEditorError("This component does not accept text edits.", "invalid_input");
      }
      if (!command.text.trim()) throw new WebsiteEditorError("Text cannot be empty.", "invalid_input");
      next.components = next.components.map((item) =>
        item.id === component.id ? { ...item, props: { ...item.props, text: command.text.trim() } } : item,
      );
      break;
    }
    case "editImage": {
      const component = findComponent(next, command.componentId);
      if (component.type !== "image") {
        throw new WebsiteEditorError("Image edits require an image component.", "invalid_input");
      }
      if (command.alt.trim().length < 3) {
        throw new WebsiteEditorError("Image alt text is required.", "invalid_input");
      }
      const src = command.src?.trim();
      if (src && (src.toLowerCase().endsWith(".svg") || src.includes(".."))) {
        throw new WebsiteEditorError("Image source is not allowed.", "invalid_input");
      }
      next.components = next.components.map((item) =>
        item.id === component.id
          ? { ...item, props: { ...item.props, alt: command.alt.trim(), ...(src ? { src } : {}) } }
          : item,
      );
      break;
    }
    case "editButton": {
      const component = findComponent(next, command.componentId);
      if (component.type !== "button") {
        throw new WebsiteEditorError("Button edits require a button component.", "invalid_input");
      }
      if (!command.text.trim()) throw new WebsiteEditorError("Button label cannot be empty.", "invalid_input");
      next.components = next.components.map((item) =>
        item.id === component.id ? { ...item, props: { ...item.props, text: command.text.trim() } } : item,
      );
      break;
    }
    case "editColors": {
      next.theme = { ...next.theme, colors: command.colors, updatedAt: at };
      assertValidTheme(next.theme);
      break;
    }
    case "editFonts": {
      next.theme = { ...next.theme, fonts: command.fonts, updatedAt: at };
      assertValidTheme(next.theme);
      break;
    }
    case "reorderSections": {
      const page = findPage(next, command.pageId);
      const current = page.sectionIds;
      if (current.length !== command.sectionIds.length || new Set(command.sectionIds).size !== command.sectionIds.length) {
        throw new WebsiteEditorError("Reorder must include each section on the page exactly once.", "invalid_hierarchy");
      }
      if (current.some((id) => !command.sectionIds.includes(id))) {
        throw new WebsiteEditorError("Reorder references a section that is not on this page.", "invalid_hierarchy");
      }
      next.pages = next.pages.map((item) =>
        item.id === page.id ? { ...item, sectionIds: command.sectionIds } : item,
      );
      next.sections = next.sections.map((section) =>
        section.pageId === page.id
          ? { ...section, order: command.sectionIds.indexOf(section.id) }
          : section,
      );
      break;
    }
    case "duplicateSection": {
      const section = findSection(next, command.sectionId);
      const page = findPage(next, section.pageId);
      const newSectionId = createId();
      const clonedTree = duplicateComponents(
        next.components.filter((item) => item.sectionId === section.id),
        newSectionId,
        createId,
      );
      const duplicate: WebsiteSection = {
        ...section,
        id: newSectionId,
        order: section.order + 1,
        componentIds: clonedTree.map((item) => item.id),
      };
      const pageSections = page.sectionIds.flatMap((id) => (id === section.id ? [id, newSectionId] : [id]));
      next.sections = next.sections
        .map((item) => (item.pageId === page.id && item.order > section.order ? { ...item, order: item.order + 1 } : item))
        .concat(duplicate);
      next.components = next.components.concat(clonedTree);
      next.pages = next.pages.map((item) => (item.id === page.id ? { ...item, sectionIds: pageSections } : item));
      next.sections = next.sections.map((item) =>
        item.pageId === page.id ? { ...item, order: pageSections.indexOf(item.id) } : item,
      );
      break;
    }
    case "duplicateComponent": {
      const component = findComponent(next, command.componentId);
      const section = findSection(next, component.sectionId);
      const rooted = next.components.filter(
        (item) => item.id === component.id || hasAncestor(next.components, item.id, component.id),
      );
      const idMap = new Map<string, string>();
      for (const item of rooted) idMap.set(item.id, createId());
      const copies = rooted.map((item) => ({
        ...item,
        id: idMap.get(item.id)!,
        parentComponentId:
          item.id === component.id
            ? item.parentComponentId
            : idMap.get(item.parentComponentId ?? "") ?? null,
        order: item.id === component.id ? item.order + 1 : item.order,
      }));
      next.components = next.components
        .map((item) =>
          item.sectionId === section.id &&
          item.parentComponentId === component.parentComponentId &&
          item.order > component.order
            ? { ...item, order: item.order + 1 }
            : item,
        )
        .concat(copies);
      const inserted = section.componentIds.flatMap((id) =>
        id === component.id ? [id, idMap.get(component.id)!] : [id],
      );
      const extra = copies.filter((item) => !inserted.includes(item.id)).map((item) => item.id);
      next.sections = next.sections.map((item) =>
        item.id === section.id ? { ...item, componentIds: [...inserted, ...extra] } : item,
      );
      break;
    }
    case "deletePage": {
      const page = findPage(next, command.pageId);
      if (page.isHomepage) throw new WebsiteEditorError("The homepage cannot be deleted.", "illegal_delete");
      if (next.pages.some((item) => item.parentPageId === page.id)) {
        throw new WebsiteEditorError("Delete child pages before deleting this page.", "illegal_delete");
      }
      const sectionIds = new Set(next.sections.filter((item) => item.pageId === page.id).map((item) => item.id));
      next.pages = next.pages.filter((item) => item.id !== page.id);
      next.sections = next.sections.filter((item) => item.pageId !== page.id);
      next.components = next.components.filter((item) => !sectionIds.has(item.sectionId));
      next.plan = { ...next.plan, pageIds: next.plan.pageIds.filter((id) => id !== page.id) };
      next.navigation = {
        ...next.navigation,
        items: removeNavPage(next.navigation.items, page.id),
        updatedAt: at,
      };
      break;
    }
    case "deleteSection": {
      const section = findSection(next, command.sectionId);
      const page = findPage(next, section.pageId);
      if (page.sectionIds.length <= 1) {
        throw new WebsiteEditorError("A page must keep at least one section.", "illegal_delete");
      }
      next.components = next.components.filter((item) => item.sectionId !== section.id);
      next.sections = next.sections.filter((item) => item.id !== section.id);
      const sectionIds = page.sectionIds.filter((id) => id !== section.id);
      next.pages = next.pages.map((item) => (item.id === page.id ? { ...item, sectionIds } : item));
      next.sections = next.sections.map((item) =>
        item.pageId === page.id ? { ...item, order: sectionIds.indexOf(item.id) } : item,
      );
      break;
    }
    case "deleteComponent": {
      const component = findComponent(next, command.componentId);
      const section = findSection(next, component.sectionId);
      const rooted = next.components.filter(
        (item) => item.id === component.id || hasAncestor(next.components, item.id, component.id),
      );
      if (section.componentIds.length - rooted.length < 1) {
        throw new WebsiteEditorError("A section must keep at least one component.", "illegal_delete");
      }
      const removed = new Set(rooted.map((item) => item.id));
      next.components = next.components
        .filter((item) => !removed.has(item.id))
        .map((item) =>
          item.sectionId === section.id &&
          item.parentComponentId === component.parentComponentId &&
          item.order > component.order
            ? { ...item, order: item.order - 1 }
            : item,
        );
      next.sections = next.sections.map((item) =>
        item.id === section.id ? { ...item, componentIds: item.componentIds.filter((id) => !removed.has(id)) } : item,
      );
      break;
    }
    default:
      throw new WebsiteEditorError("Command cannot mutate the plan.", "invalid_input");
  }
  return syncHomepageSeo(touch(next, at));
}

function hasAncestor(components: WebsiteComponent[], id: string, ancestorId: string): boolean {
  let current = components.find((item) => item.id === id);
  const seen = new Set<string>();
  while (current?.parentComponentId) {
    if (current.parentComponentId === ancestorId) return true;
    if (seen.has(current.id)) return false;
    seen.add(current.id);
    current = components.find((item) => item.id === current?.parentComponentId);
  }
  return false;
}

export function openWebsiteEditor(params: {
  structure: WebsiteGeneratedStructure;
  actorUserId: string;
  sessionId?: string;
  now?: () => string;
}): WebsiteEditorSession {
  assertActiveEditablePlan(params.structure, params.actorUserId);
  const at = params.now?.() ?? new Date().toISOString();
  const homepage = params.structure.pages.find((page) => page.isHomepage)!;
  return {
    id: params.sessionId ?? randomUUID(),
    userId: params.actorUserId,
    projectId: params.structure.project.id,
    planId: params.structure.plan.id,
    selection: { pageId: homepage.id, sectionId: homepage.sectionIds[0] ?? null, componentId: null },
    structure: cloneStructure(params.structure),
    history: emptyEditorHistory(),
    autosave: { dirty: false, revision: 0, savedAt: at },
    appliedCommandKeys: [],
    updatedAt: at,
  };
}

export function applyEditorCommand(input: ApplyEditorCommandInput & { createId?: () => string; now?: () => string }): WebsiteEditorSession {
  assertEditorSessionOwnership(input.session, input.actorUserId);
  const at = input.now?.() ?? new Date().toISOString();
  const createId = input.createId ?? randomUUID;

  if (input.idempotencyKey && input.session.appliedCommandKeys.includes(input.idempotencyKey)) {
    return input.session;
  }

  const command = input.command;
  if (command.type === "selectPage" || command.type === "selectSection" || command.type === "selectComponent") {
    assertSelection(input.session.structure, command);
    const selection: EditorSelection =
      command.type === "selectPage"
        ? { pageId: command.pageId, sectionId: null, componentId: null }
        : command.type === "selectSection"
          ? { pageId: command.pageId, sectionId: command.sectionId, componentId: null }
          : { pageId: command.pageId, sectionId: command.sectionId, componentId: command.componentId };
    return {
      ...input.session,
      selection,
      updatedAt: at,
      appliedCommandKeys: input.idempotencyKey
        ? [...input.session.appliedCommandKeys, input.idempotencyKey].slice(-100)
        : input.session.appliedCommandKeys,
    };
  }

  if (command.type === "autosave") {
    return {
      ...input.session,
      autosave: { dirty: false, revision: input.session.autosave.revision, savedAt: at },
      updatedAt: at,
      appliedCommandKeys: input.idempotencyKey
        ? [...input.session.appliedCommandKeys, input.idempotencyKey].slice(-100)
        : input.session.appliedCommandKeys,
    };
  }

  if (command.type === "undo") {
    const undone = undoEditorHistory(input.session.history, input.session.structure);
    assertEditorStructure(undone.structure, input.actorUserId);
    return {
      ...input.session,
      structure: undone.structure,
      history: undone.history,
      selection: remapSelection(input.session.selection, undone.structure),
      autosave: { dirty: true, revision: input.session.autosave.revision + 1, savedAt: input.session.autosave.savedAt },
      updatedAt: at,
    };
  }

  if (command.type === "redo") {
    const redone = redoEditorHistory(input.session.history, input.session.structure);
    assertEditorStructure(redone.structure, input.actorUserId);
    return {
      ...input.session,
      structure: redone.structure,
      history: redone.history,
      selection: remapSelection(input.session.selection, redone.structure),
      autosave: { dirty: true, revision: input.session.autosave.revision + 1, savedAt: input.session.autosave.savedAt },
      updatedAt: at,
    };
  }

  const history = pushEditorHistory(input.session.history, input.session.structure);
  const structure = applyMutation(input.session.structure, command, createId, at);
  assertEditorStructure(structure, input.actorUserId);
  return {
    ...input.session,
    structure,
    history,
    selection: remapSelection(input.session.selection, structure),
    autosave: { dirty: true, revision: input.session.autosave.revision + 1, savedAt: input.session.autosave.savedAt },
    updatedAt: at,
    appliedCommandKeys: input.idempotencyKey
      ? [...input.session.appliedCommandKeys, input.idempotencyKey].slice(-100)
      : input.session.appliedCommandKeys,
  };
}

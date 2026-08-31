/**
 * Website editor validation (Phase 6).
 * Keeps hierarchy, homepage, navigation, SEO, and unique IDs intact.
 */

import type { WebsiteComponent, WebsitePage, WebsiteSection } from "@/lib/ai-core/website-builder/domain/contracts";
import { WebsiteBuilderError } from "@/lib/ai-core/website-builder/domain/errors";
import { assertValidProject } from "@/lib/ai-core/website-builder/domain/validation";
import type { WebsiteGeneratedStructure } from "@/lib/ai-core/website-builder/generation/contracts";
import { assertGeneratedWebsite } from "@/lib/ai-core/website-builder/generation/validation";
import { WebsiteGenerationError } from "@/lib/ai-core/website-builder/generation/errors";
import type { EditorCommand, WebsiteEditorSession } from "@/lib/ai-core/website-builder/editor/contracts";
import { WebsiteEditorError } from "@/lib/ai-core/website-builder/editor/errors";

function wrap(error: unknown, fallback: WebsiteEditorError["code"]): never {
  if (error instanceof WebsiteEditorError) throw error;
  if (error instanceof WebsiteGenerationError) {
    throw new WebsiteEditorError(error.message, "invalid_hierarchy");
  }
  if (error instanceof WebsiteBuilderError) {
    if (error.code === "ownership") throw new WebsiteEditorError(error.message, "ownership");
    if (error.code === "invalid_seo") throw new WebsiteEditorError(error.message, "invalid_seo");
    if (error.code === "invalid_theme") throw new WebsiteEditorError(error.message, "invalid_theme");
    if (error.code === "hierarchy_cycle" || error.code === "duplicate_order") {
      throw new WebsiteEditorError(error.message, "invalid_hierarchy");
    }
    throw new WebsiteEditorError(error.message, "invalid_input");
  }
  throw new WebsiteEditorError(error instanceof Error ? error.message : "Editor validation failed.", fallback);
}

export function assertActiveEditablePlan(structure: WebsiteGeneratedStructure, actorUserId: string): void {
  try {
    assertValidProject(structure.project);
    assertGeneratedWebsite(structure, structure.project);
  } catch (error) {
    wrap(error, "invalid_input");
  }
  if (structure.project.userId !== actorUserId || structure.plan.userId !== actorUserId) {
    throw new WebsiteEditorError("Editor actor does not own this plan.", "ownership");
  }
  if (structure.project.id !== structure.plan.projectId) {
    throw new WebsiteEditorError("Plan does not belong to this project.", "ownership");
  }
  if (!structure.plan.isActive || structure.plan.status !== "active") {
    throw new WebsiteEditorError("Edits are allowed on the active WebsitePlan only.", "inactive_plan");
  }
  if (structure.project.activePlanId !== structure.plan.id) {
    throw new WebsiteEditorError("Project activePlanId must match the plan being edited.", "inactive_plan");
  }
  if (structure.project.domainState !== "editing" && structure.project.domainState !== "ready") {
    throw new WebsiteEditorError("Website editor requires an editing or ready project.", "invalid_state");
  }
}

export function findPage(structure: WebsiteGeneratedStructure, pageId: string): WebsitePage {
  const page = structure.pages.find((item) => item.id === pageId);
  if (!page) throw new WebsiteEditorError("Page not found in the active plan.", "not_found");
  return page;
}

export function findSection(structure: WebsiteGeneratedStructure, sectionId: string): WebsiteSection {
  const section = structure.sections.find((item) => item.id === sectionId);
  if (!section) throw new WebsiteEditorError("Section not found in the active plan.", "not_found");
  return section;
}

export function findComponent(structure: WebsiteGeneratedStructure, componentId: string): WebsiteComponent {
  const component = structure.components.find((item) => item.id === componentId);
  if (!component) throw new WebsiteEditorError("Component not found in the active plan.", "not_found");
  return component;
}

export function assertSelection(
  structure: WebsiteGeneratedStructure,
  command: Extract<EditorCommand, { type: "selectPage" | "selectSection" | "selectComponent" }>,
): void {
  if (command.type === "selectPage") {
    findPage(structure, command.pageId);
    return;
  }
  const page = findPage(structure, command.pageId);
  const section = findSection(structure, command.sectionId);
  if (section.pageId !== page.id) {
    throw new WebsiteEditorError("Section does not belong to the selected page.", "illegal_selection");
  }
  if (command.type === "selectComponent") {
    const component = findComponent(structure, command.componentId);
    if (component.sectionId !== section.id) {
      throw new WebsiteEditorError("Component does not belong to the selected section.", "illegal_selection");
    }
  }
}

export function uniqueEntityIds(structure: WebsiteGeneratedStructure): void {
  const componentIds = structure.components.map((item) => item.id);
  if (new Set(componentIds).size !== componentIds.length) {
    throw new WebsiteEditorError("Component IDs must be unique.", "duplicate_id");
  }
  const sectionIds = structure.sections.map((item) => item.id);
  if (new Set(sectionIds).size !== sectionIds.length) {
    throw new WebsiteEditorError("Section IDs must be unique.", "duplicate_id");
  }
}

export function assertEditorStructure(structure: WebsiteGeneratedStructure, actorUserId: string): void {
  assertActiveEditablePlan(structure, actorUserId);
  uniqueEntityIds(structure);
}

export function assertEditorSessionOwnership(session: WebsiteEditorSession, actorUserId: string): void {
  if (session.userId !== actorUserId) {
    throw new WebsiteEditorError("Editor session belongs to another owner.", "ownership");
  }
  if (session.planId !== session.structure.plan.id || session.projectId !== session.structure.project.id) {
    throw new WebsiteEditorError("Editor session is detached from the active plan.", "inactive_plan");
  }
  assertEditorStructure(session.structure, actorUserId);
}

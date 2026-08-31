/**
 * Website Builder project state machine (Phase 1).
 * In-memory rules only — no persistence, publish runtime, or generation.
 */

import type { TransitionContext, WebsiteProject, WebsiteProjectState } from "@/lib/ai-core/website-builder/domain/contracts";
import { WebsiteBuilderError } from "@/lib/ai-core/website-builder/domain/errors";
import { assertValidProject, assertValidPublishTarget, assertValidSeo, assertValidTheme } from "@/lib/ai-core/website-builder/domain/validation";

export const ALLOWED_TRANSITIONS: Readonly<Record<WebsiteProjectState, readonly WebsiteProjectState[]>> = {
  draft: ["planning", "failed", "archived"],
  planning: ["planned", "draft", "failed"],
  planned: ["generating", "editing", "failed", "archived"],
  generating: ["editing", "ready", "failed"],
  editing: ["ready", "generating", "planned", "failed", "archived"],
  ready: ["published", "editing", "generating", "archived", "failed"],
  published: ["editing", "archived"],
  archived: ["draft"],
  failed: ["draft", "planning", "editing"],
};

export function canTransition(from: WebsiteProjectState, to: WebsiteProjectState): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

export function assertTransition(from: WebsiteProjectState, to: WebsiteProjectState): void {
  if (from === to) {
    throw new WebsiteBuilderError(`Already in state "${from}".`, "illegal_transition");
  }
  if (!canTransition(from, to)) {
    throw new WebsiteBuilderError(`Cannot transition from "${from}" to "${to}".`, "illegal_transition");
  }
}

function assertReadyToPublish(context: TransitionContext): void {
  if (!context.homepage || !context.homepage.isHomepage) {
    throw new WebsiteBuilderError("Publishing requires a homepage.", "missing_homepage");
  }
  if (!context.theme) {
    throw new WebsiteBuilderError("Publishing requires a theme.", "missing_required");
  }
  if (!context.seo) {
    throw new WebsiteBuilderError("Publishing requires SEO.", "missing_required");
  }
  if (!context.publishTarget) {
    throw new WebsiteBuilderError("Publishing requires a publish target.", "missing_required");
  }
  assertValidTheme(context.theme);
  assertValidSeo(context.seo);
  assertValidPublishTarget(context.publishTarget);
  if (context.publishTarget.projectId !== context.homepage.projectId) {
    throw new WebsiteBuilderError("Publish target does not belong to this project.", "ownership");
  }
}

export function transition(
  project: WebsiteProject,
  to: WebsiteProjectState,
  context: TransitionContext = {},
): WebsiteProject {
  assertValidProject(project);
  assertTransition(project.domainState, to);
  if (to === "published") {
    assertReadyToPublish(context);
  }
  return {
    ...project,
    domainState: to,
    updatedAt: new Date().toISOString(),
  };
}

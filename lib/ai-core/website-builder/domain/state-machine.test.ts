import assert from "node:assert/strict";
import { test } from "node:test";
import type { WebsiteProjectState } from "@/lib/ai-core/website-builder/domain/contracts";
import { WEBSITE_PROJECT_STATES } from "@/lib/ai-core/website-builder/domain/contracts";
import { WebsiteBuilderError } from "@/lib/ai-core/website-builder/domain/errors";
import {
  ALLOWED_TRANSITIONS,
  assertTransition,
  canTransition,
  transition,
} from "@/lib/ai-core/website-builder/domain/state-machine";
import { makeHomepage, makeProject, projectIn, publishContext } from "@/lib/ai-core/website-builder/domain/test-fixtures";

const HAPPY_PATH: WebsiteProjectState[] = [
  "draft",
  "planning",
  "planned",
  "generating",
  "editing",
  "ready",
  "published",
  "archived",
];

test("happy-path transitions are allowed", () => {
  for (let i = 0; i < HAPPY_PATH.length - 1; i += 1) {
    const from = HAPPY_PATH[i];
    const to = HAPPY_PATH[i + 1];
    assert.equal(canTransition(from, to), true, `${from} -> ${to}`);
  }
});

test("transition walks draft to archived through the legal path", () => {
  let project = makeProject();
  const path: WebsiteProjectState[] = [
    "planning",
    "planned",
    "generating",
    "editing",
    "ready",
    "published",
    "archived",
  ];
  for (const next of path) {
    project = transition(project, next, next === "published" ? publishContext() : {});
    assert.equal(project.domainState, next);
  }
});

test("failed can recover to draft, planning, or editing", () => {
  for (const next of ["draft", "planning", "editing"] as const) {
    assert.equal(canTransition("failed", next), true);
    const recovered = transition(projectIn("failed"), next);
    assert.equal(recovered.domainState, next);
  }
});

test("archived can only return to draft", () => {
  assert.equal(canTransition("archived", "draft"), true);
  assert.equal(canTransition("archived", "published"), false);
  assert.equal(canTransition("archived", "ready"), false);
  const restored = transition(projectIn("archived"), "draft");
  assert.equal(restored.domainState, "draft");
});

test("ready requires homepage, theme, SEO, and publish target to become published", () => {
  const project = projectIn("ready");
  assert.throws(
    () => transition(project, "published"),
    (error: unknown) => error instanceof WebsiteBuilderError && error.code === "missing_homepage",
  );
  assert.throws(
    () => transition(project, "published", { homepage: makeHomepage() }),
    (error: unknown) => error instanceof WebsiteBuilderError && error.code === "missing_required",
  );
  const published = transition(project, "published", publishContext());
  assert.equal(published.domainState, "published");
});

test("self-transitions are illegal", () => {
  for (const state of WEBSITE_PROJECT_STATES) {
    assert.equal(canTransition(state, state), false);
    assert.throws(
      () => assertTransition(state, state),
      (error: unknown) => error instanceof WebsiteBuilderError && error.code === "illegal_transition",
    );
  }
});

const FORBIDDEN: Array<[WebsiteProjectState, WebsiteProjectState]> = [
  ["draft", "published"],
  ["draft", "ready"],
  ["draft", "generating"],
  ["planning", "generating"],
  ["planning", "published"],
  ["planned", "published"],
  ["generating", "published"],
  ["generating", "draft"],
  ["published", "generating"],
  ["published", "ready"],
  ["published", "draft"],
  ["archived", "published"],
  ["archived", "editing"],
  ["failed", "published"],
  ["failed", "ready"],
];

test("forbidden transitions throw illegal_transition", () => {
  for (const [from, to] of FORBIDDEN) {
    assert.equal(canTransition(from, to), false, `${from} -> ${to} must be blocked`);
    assert.throws(
      () => transition(projectIn(from), to, publishContext()),
      (error: unknown) => error instanceof WebsiteBuilderError && error.code === "illegal_transition",
    );
  }
});

test("ALLOWED_TRANSITIONS covers every project state", () => {
  for (const state of WEBSITE_PROJECT_STATES) {
    assert.ok(Array.isArray(ALLOWED_TRANSITIONS[state]));
  }
});

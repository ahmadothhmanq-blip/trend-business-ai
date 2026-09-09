/**
 * Readiness gates for interactive App Builder live preview.
 * Fails when login, navigation, CRUD, or interactivity contracts are broken.
 */

import type { StructuredAppModel } from "@/lib/ai-core/app-design-platform/types";
import { buildInteractiveAppPreviewHtml } from "@/lib/webapp/interactive-preview/build";
import {
  APP_PREVIEW_RUNTIME_VERSION,
  buildAppPreviewManifest,
  normalizePreviewPath,
} from "@/lib/webapp/interactive-preview/manifest";

export function findInteractiveAppPreviewReadinessIssues(
  model: StructuredAppModel,
  options?: { activeScreenPath?: string | null },
): string[] {
  const issues: string[] = [];
  const manifest = buildAppPreviewManifest(model, options);
  const html = buildInteractiveAppPreviewHtml({
    model,
    activeScreenPath: options?.activeScreenPath,
  });

  if (!html.includes('data-preview-runtime="interactive"')) {
    issues.push("Live preview is not interactive (missing runtime marker).");
  }
  if (!html.includes(APP_PREVIEW_RUNTIME_VERSION)) {
    issues.push("Live preview runtime version marker is missing.");
  }
  if (!html.includes("__PREVIEW_MANIFEST__")) {
    issues.push("Live preview manifest is missing.");
  }
  if (!html.includes("__PREVIEW_RUNTIME__")) {
    issues.push("Live preview runtime script is missing.");
  }
  if (!html.includes("sessionStorage")) {
    issues.push("Live preview must persist session state in sessionStorage.");
  }
  if (!html.includes("mockLogin") && !html.includes('action === "login"')) {
    issues.push("Live preview login action is missing.");
  }
  if (!html.includes("mockSignup") && !html.includes('action === "signup"')) {
    issues.push("Live preview signup/account-creation action is missing.");
  }

  if (manifest.screens.length === 0) {
    issues.push("Live preview has no screens — generated app structure is empty.");
  }

  const screenPaths = new Set(manifest.screens.map((s) => s.path));

  for (const screen of manifest.screens) {
    if (!screen.path) {
      issues.push(`Screen "${screen.name}" has an empty path and is unreachable.`);
    }
  }

  for (const nav of manifest.navigation) {
    const href = normalizePreviewPath(nav.href);
    if (!screenPaths.has(href)) {
      issues.push(
        `Broken navigation link "${nav.label}" → ${href} (no matching generated screen).`,
      );
    }
  }

  for (const screen of model.screens) {
    const path = normalizePreviewPath(screen.path);
    if (!screenPaths.has(path)) {
      issues.push(`Generated page is unreachable in preview: ${path}`);
    }
  }

  if (manifest.loginPath) {
    if (!screenPaths.has(manifest.loginPath)) {
      issues.push("Login screen path is missing from the interactive preview.");
    }
    if (!manifest.dashboardPath || !screenPaths.has(manifest.dashboardPath)) {
      issues.push("Login cannot redirect: dashboard path is missing.");
    }
    if (!html.includes("dashboardPath") && !html.includes(manifest.dashboardPath)) {
      issues.push("Login redirect target is not wired in the preview runtime.");
    }
    // Contract: runtime must navigate to dashboard after auth
    if (!html.includes("M.dashboardPath") && !html.includes("dashboardPath")) {
      issues.push("Login does not redirect correctly (dashboard navigation missing).");
    }
  }

  for (const entity of manifest.entities) {
    const crud = new Set(entity.crud);
    if (crud.has("list") || crud.has("read")) {
      if (!entity.seed.length) {
        issues.push(`CRUD entity "${entity.name}" has no in-memory seed data for list.`);
      }
    }
    if (crud.has("create") || crud.has("update") || crud.has("delete")) {
      const bound = manifest.screens.some((s) =>
        s.dataBindings.includes(entity.name),
      );
      if (!bound) {
        issues.push(
          `CRUD entity "${entity.name}" is not bound to any preview screen (actions unreachable).`,
        );
      }
    }
    if (!html.includes(entity.name)) {
      issues.push(`CRUD entity "${entity.name}" is missing from the preview manifest payload.`);
    }
  }

  // Interactive elements must be action-wired (no inert chrome buttons in runtime templates)
  const requiredSnippets = [
    'action === "login"',
    'action === "signup"',
    'data-action="nav"',
    'data-action="switch-role"',
    "mockLogin",
    "mockSignup",
  ];
  for (const snippet of requiredSnippets) {
    if (!html.includes(snippet)) {
      issues.push(`Interactive element contract missing: ${snippet}.`);
    }
  }
  if (manifest.entities.some((e) => e.crud.includes("create"))) {
    if (!html.includes('data-action="save-record"')) {
      issues.push("CRUD create/edit form action is non-functional (save-record missing).");
    }
    if (!html.includes('data-action="delete-record"')) {
      issues.push("CRUD delete action is non-functional (delete-record missing).");
    }
    if (!html.includes('data-action="search"')) {
      issues.push("CRUD search control is missing.");
    }
    if (!html.includes('data-action="page-next"')) {
      issues.push("CRUD pagination is missing.");
    }
  }

  // Structure parity: every model screen/nav/entity represented in manifest
  if (manifest.screens.length < model.screens.length) {
    issues.push(
      `Preview screen count (${manifest.screens.length}) is below generated app (${model.screens.length}).`,
    );
  }
  if (manifest.navigation.length < model.navigation.length) {
    issues.push(
      `Preview navigation count (${manifest.navigation.length}) is below generated app (${model.navigation.length}).`,
    );
  }
  if (manifest.entities.length < model.dataModels.length) {
    issues.push(
      `Preview entity count (${manifest.entities.length}) is below generated app (${model.dataModels.length}).`,
    );
  }
  // Authenticated templates may inject a Staff preview surface beyond the blueprint.
  const hasStaffRole = model.roles.some((role) =>
    ["admin", "manager", "employee"].includes(role.name.toLowerCase()),
  );
  if (
    hasStaffRole &&
    !manifest.navigation.some(
      (item) => item.href.includes("/admin/staff") || item.href === "/staff",
    )
  ) {
    issues.push("Authenticated preview is missing Staff navigation.");
  }

  return [...new Set(issues)];
}

export function assertInteractiveAppPreviewReady(
  model: StructuredAppModel,
  options?: { activeScreenPath?: string | null },
): { ready: boolean; issues: string[] } {
  const issues = findInteractiveAppPreviewReadinessIssues(model, options);
  return { ready: issues.length === 0, issues };
}

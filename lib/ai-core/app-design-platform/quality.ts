/**
 * Application quality checks for App Builder.
 */

import type {
  AppQualityReport,
  StructuredAppModel,
} from "@/lib/ai-core/app-design-platform/types";
import type { GeneratedProjectFile } from "@/lib/ai/types";

export function runAppQualityChecks(params: {
  model: StructuredAppModel;
  files?: GeneratedProjectFile[];
}): AppQualityReport {
  const { model, files = [] } = params;
  const checks: AppQualityReport["checks"] = [];

  checks.push({
    id: "structure",
    label: "App structure present",
    passed: model.screens.length > 0 && model.dataModels.length > 0,
    severity: "blocker",
    detail:
      model.screens.length > 0
        ? `${model.screens.length} screens, ${model.dataModels.length} models`
        : "Missing screens or data models",
  });

  const orphanNav = model.navigation.filter(
    (n) => !model.screens.some((s) => s.path === n.href),
  );
  checks.push({
    id: "navigation",
    label: "Navigation links resolve to screens",
    passed: orphanNav.length === 0,
    severity: "warning",
    detail:
      orphanNav.length === 0
        ? "All nav links match screens"
        : `Orphan links: ${orphanNav.map((n) => n.href).join(", ")}`,
  });

  const unbound = model.screens.filter(
    (s) => s.layout !== "auth" && s.dataBindings.length === 0,
  );
  checks.push({
    id: "data-connections",
    label: "Screens connected to data",
    passed: unbound.length <= Math.max(1, Math.floor(model.screens.length / 2)),
    severity: "warning",
    detail:
      unbound.length === 0
        ? "All interactive screens have data bindings"
        : `${unbound.length} screens without data bindings`,
  });

  checks.push({
    id: "roles",
    label: "Roles defined",
    passed: model.roles.length >= 2,
    severity: "warning",
    detail: `${model.roles.length} roles`,
  });

  checks.push({
    id: "components",
    label: "Component instances present",
    passed: model.components.length > 0,
    severity: "info",
    detail: `${model.components.length} component instances`,
  });

  checks.push({
    id: "branding",
    label: "Brand tokens set",
    passed: Boolean(model.brand.tokens.primary && model.brand.businessName),
    severity: "info",
    detail: model.brand.businessName || "Missing business name",
  });

  if (files.length > 0) {
    const hasPackage = files.some((f) => f.path === "package.json");
    const hasApp = files.some((f) => f.path.startsWith("app/"));
    checks.push({
      id: "build-files",
      label: "Generated project files",
      passed: hasPackage && hasApp,
      severity: "blocker",
      detail: `${files.length} files · package.json=${hasPackage} · app/=${hasApp}`,
    });
  }

  const blockers = checks.filter((c) => c.severity === "blocker" && !c.passed);
  const warnings = checks.filter((c) => c.severity === "warning" && !c.passed);
  const passed = checks.filter((c) => c.passed).length;
  const score = Math.round((passed / checks.length) * 100);

  return {
    ready: blockers.length === 0,
    score,
    checks,
    summary:
      blockers.length > 0
        ? `Not ready: ${blockers.length} blocker(s), ${warnings.length} warning(s).`
        : warnings.length > 0
          ? `Ready with ${warnings.length} warning(s). Score ${score}.`
          : `Ready. Quality score ${score}.`,
  };
}

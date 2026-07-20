/**
 * AI-powered application intelligence / analysis.
 */

import type {
  AppIntelligenceReport,
  AppIntelligenceSuggestion,
  StructuredAppModel,
} from "@/lib/ai-core/app-design-platform/types";
import { getAppTemplate } from "@/lib/ai-core/app-design-platform/templates";

export function runAppIntelligence(model: StructuredAppModel): AppIntelligenceReport {
  const suggestions: AppIntelligenceSuggestion[] = [];
  const strengths: string[] = [];
  const template = getAppTemplate(model.templateId);

  if (model.screens.length >= 5) {
    strengths.push(`${model.screens.length} screens defined`);
  }
  if (model.dataModels.length >= 2) {
    strengths.push(`${model.dataModels.length} data models`);
  }
  if (model.roles.length >= 2) {
    strengths.push(`Role model with ${model.roles.length} roles`);
  }
  if (model.brand.tokens.primary) {
    strengths.push("Brand tokens configured");
  }

  const hasAuth = model.screens.some((s) => /login|auth/i.test(s.path + s.name));
  if (!hasAuth) {
    suggestions.push({
      id: "missing-auth",
      category: "missing-screen",
      title: "Add authentication screen",
      description: "Most business apps need a login/sign-up flow.",
      priority: "high",
      command: "Add authentication screen",
      impact: "Security and user identity",
    });
  }

  const hasDashboard = model.screens.some((s) => /dashboard/i.test(s.path + s.name));
  if (!hasDashboard) {
    suggestions.push({
      id: "missing-dashboard",
      category: "missing-screen",
      title: "Add dashboard screen",
      description: "A KPI dashboard improves operational visibility.",
      priority: "medium",
      command: "Create customer dashboard",
    });
  }

  if (model.navigation.length < Math.min(3, model.screens.length)) {
    suggestions.push({
      id: "nav-coverage",
      category: "user-flow",
      title: "Improve navigation coverage",
      description: "Some screens may be hard to reach from primary navigation.",
      priority: "medium",
      impact: "Discoverability",
    });
  }

  for (const screen of model.screens) {
    if (screen.dataBindings.length === 0 && screen.layout !== "auth") {
      suggestions.push({
        id: `data-${screen.id}`,
        category: "data",
        title: `Connect data to “${screen.name}”`,
        description: "Screen has no data bindings — wire it to a data model.",
        priority: "medium",
        command: `Connect ${screen.name} to data`,
      });
    }
  }

  if (template) {
    for (const expected of template.screens) {
      const present = model.screens.some(
        (s) =>
          s.path === expected.path ||
          s.name.toLowerCase() === expected.name.toLowerCase(),
      );
      if (!present && !/login/i.test(expected.name)) {
        suggestions.push({
          id: `tpl-${expected.path}`,
          category: "industry",
          title: `Consider adding “${expected.name}”`,
          description: `${template.label} apps typically include this screen.`,
          priority: "low",
          command: `Add screen ${expected.name}`,
        });
      }
    }
  }

  if (!model.featureFlags.includes("notifications") && model.workflows.length > 0) {
    suggestions.push({
      id: "notif",
      category: "missing-feature",
      title: "Enable notifications",
      description: "Workflows benefit from user notifications.",
      priority: "low",
      command: "Add notifications feature",
    });
  }

  if (model.screens.length > 12) {
    suggestions.push({
      id: "ux-complexity",
      category: "ux",
      title: "Simplify information architecture",
      description: "Many screens can overwhelm users — consider grouping modules.",
      priority: "medium",
      impact: "UX clarity",
    });
  }

  if (!model.roles.some((r) => /admin/i.test(r.name))) {
    suggestions.push({
      id: "security-admin",
      category: "security",
      title: "Define an Admin role",
      description: "Admin role is recommended for settings and sensitive data.",
      priority: "high",
    });
  }

  suggestions.push({
    id: "perf-lazy",
    category: "performance",
    title: "Lazy-load heavy screens",
    description: "Charts, maps, and tables should load on demand in generated apps.",
    priority: "low",
    impact: "Initial load performance",
  });

  const penalty = suggestions.reduce((acc, s) => {
    if (s.priority === "critical") return acc + 20;
    if (s.priority === "high") return acc + 12;
    if (s.priority === "medium") return acc + 6;
    return acc + 2;
  }, 0);
  const score = Math.max(35, Math.min(98, 92 - penalty + strengths.length * 2));
  const grade =
    score >= 90 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : score >= 60 ? "D" : "F";

  return {
    score,
    grade,
    summary: `App “${model.settings.appName}” scored ${score}/100 (${grade}) with ${suggestions.length} improvement opportunities.`,
    suggestions: suggestions.slice(0, 16),
    strengths,
    generatedAt: new Date().toISOString(),
  };
}

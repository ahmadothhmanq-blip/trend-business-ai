/**
 * Minimum quality bar for App Builder business templates.
 * Enforced in tests so every industry template stays production-credible.
 */

import type { AppTemplateDefinition } from "@/lib/ai-core/app-design-platform/templates";
import { WEBAPP_ENTITY_KEYS } from "@/lib/ai/webapp-i18n/keys";

export const TEMPLATE_QUALITY_MIN = {
  minModels: 3,
  minFieldsPerModel: 4,
  minScreens: 5,
  minRoles: 3,
  minWorkflows: 2,
} as const;

/** Stricter bar for the five world-class verticals. */
export const FLAGSHIP_TEMPLATE_IDS = [
  "crm",
  "booking",
  "ecommerce",
  "healthcare",
  "finance",
] as const;

export const FLAGSHIP_QUALITY_MIN = {
  minModels: 4,
  minFieldsPerModel: 5,
  minScreens: 6,
  minRoles: 3,
  minWorkflows: 2,
} as const;

const ENTITY_KEY_SET = new Set<string>(WEBAPP_ENTITY_KEYS);

export type TemplateQualityIssue = {
  code:
    | "too_few_models"
    | "too_few_fields"
    | "phantom_binding"
    | "missing_entity_i18n"
    | "too_few_screens"
    | "too_few_roles"
    | "missing_admin_role"
    | "too_few_workflows"
    | "duplicate_model";
  message: string;
};

export function auditAppTemplate(template: AppTemplateDefinition): TemplateQualityIssue[] {
  const issues: TemplateQualityIssue[] = [];
  const modelNames = template.dataModels.map((m) => m.name);
  const modelSet = new Set(modelNames);
  const isFlagship = (FLAGSHIP_TEMPLATE_IDS as readonly string[]).includes(template.id);
  const floor = isFlagship ? FLAGSHIP_QUALITY_MIN : TEMPLATE_QUALITY_MIN;

  if (template.dataModels.length < floor.minModels) {
    issues.push({
      code: "too_few_models",
      message: `${template.id}: need ≥${floor.minModels} data models (has ${template.dataModels.length})`,
    });
  }

  const seen = new Set<string>();
  for (const model of template.dataModels) {
    if (seen.has(model.name)) {
      issues.push({
        code: "duplicate_model",
        message: `${template.id}: duplicate model ${model.name}`,
      });
    }
    seen.add(model.name);

    if (model.fields.length < floor.minFieldsPerModel) {
      issues.push({
        code: "too_few_fields",
        message: `${template.id}.${model.name}: need ≥${floor.minFieldsPerModel} fields (has ${model.fields.length})`,
      });
    }

    if (!ENTITY_KEY_SET.has(model.name)) {
      issues.push({
        code: "missing_entity_i18n",
        message: `${template.id}.${model.name}: missing WEBAPP_ENTITY_KEYS / dictionary entry`,
      });
    }
  }

  for (const screen of template.screens) {
    for (const binding of screen.dataBindings) {
      if (!modelSet.has(binding)) {
        issues.push({
          code: "phantom_binding",
          message: `${template.id} screen "${screen.name}" binds missing model ${binding}`,
        });
      }
    }
  }

  if (template.screens.length < floor.minScreens) {
    issues.push({
      code: "too_few_screens",
      message: `${template.id}: need ≥${floor.minScreens} screens`,
    });
  }

  if (template.roles.length < floor.minRoles) {
    issues.push({
      code: "too_few_roles",
      message: `${template.id}: need ≥${floor.minRoles} roles`,
    });
  }

  if (!template.roles.some((r) => r.name.toLowerCase() === "admin")) {
    issues.push({
      code: "missing_admin_role",
      message: `${template.id}: missing Admin role`,
    });
  }

  if (template.workflows.length < floor.minWorkflows) {
    issues.push({
      code: "too_few_workflows",
      message: `${template.id}: need ≥${floor.minWorkflows} workflow`,
    });
  }

  return issues;
}

export function auditAllAppTemplates(
  templates: AppTemplateDefinition[],
): TemplateQualityIssue[] {
  return templates.flatMap((template) => auditAppTemplate(template));
}

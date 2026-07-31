import type {
  WbComponentConstraintsDocument,
  WbComponentPropsSchemaDocument,
  WbComponentSlotsDocument,
  WbComponentValidationDocument,
  WbComponentValidationIssue,
  WbComponentVariantsDocument,
} from "@/lib/website/component-library/types";

function issue(
  code: string,
  message: string,
  path?: string,
): WbComponentValidationIssue {
  return { code, message, path };
}

/**
 * Validates declarative constraint rules against component documents.
 */
export function validateComponentConstraints(
  slots: WbComponentSlotsDocument,
  variants: WbComponentVariantsDocument,
  propsSchema: WbComponentPropsSchemaDocument,
  validation: WbComponentValidationDocument,
  constraints?: WbComponentConstraintsDocument,
): WbComponentValidationIssue[] {
  const issues: WbComponentValidationIssue[] = [];
  const slotIds = new Set(slots.slots.map((slot) => slot.id));
  const variantIds = new Set(variants.variants.map((variant) => variant.id));
  const propKeys = new Set(Object.keys(propsSchema.properties));

  for (const rule of validation.rules) {
    if (rule.path && !rule.path.startsWith("props.")) {
      issues.push(
        issue(
          "validation.path.format",
          `validation rule "${rule.id}" path must start with "props."`,
          `validation.rules.${rule.id}`,
        ),
      );
      continue;
    }
    if (rule.path) {
      const propKey = rule.path.replace(/^props\./, "");
      if (!propKeys.has(propKey)) {
        issues.push(
          issue(
            "validation.path.unknown",
            `validation rule "${rule.id}" references unknown prop "${propKey}"`,
            `validation.rules.${rule.id}`,
          ),
        );
      }
    }
  }

  for (const rule of constraints?.rules ?? []) {
    if (rule.when.slotId && !slotIds.has(rule.when.slotId)) {
      issues.push(
        issue(
          "constraints.slot.unknown",
          `constraint "${rule.id}" references unknown slot "${rule.when.slotId}"`,
          `constraints.rules.${rule.id}`,
        ),
      );
    }
    if (rule.when.variantId && !variantIds.has(rule.when.variantId)) {
      issues.push(
        issue(
          "constraints.variant.unknown",
          `constraint "${rule.id}" references unknown variant "${rule.when.variantId}"`,
          `constraints.rules.${rule.id}`,
        ),
      );
    }
    for (const propPath of rule.require?.props ?? []) {
      const propKey = propPath.replace(/^props\./, "");
      if (!propKeys.has(propKey)) {
        issues.push(
          issue(
            "constraints.prop.unknown",
            `constraint "${rule.id}" requires unknown prop "${propKey}"`,
            `constraints.rules.${rule.id}`,
          ),
        );
      }
    }
    for (const requiredSlot of rule.require?.slots ?? []) {
      if (!slotIds.has(requiredSlot)) {
        issues.push(
          issue(
            "constraints.require.slot",
            `constraint "${rule.id}" requires unknown slot "${requiredSlot}"`,
            `constraints.rules.${rule.id}`,
          ),
        );
      }
    }
  }

  return issues;
}

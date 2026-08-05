import type { DefinedTemplateV2Package } from "@/lib/website/template-v2/sdk/define-template";
import type { z } from "zod";
import {
  templateV2ComponentRegistrySchema,
  templateV2DesignTokensSchema,
  templateV2MotionConfigSchema,
  templateV2PageFlowSchema,
  templateV2PresentationProfileSchema,
  templateV2ResponsiveRulesSchema,
} from "@/lib/website/template-v2/validation/schemas";
import { templateV2Issue } from "@/lib/website/template-v2/validation/issues";
import type { TemplateV2ValidationIssue } from "@/lib/website/template-v2/validation/issues";

export type SdkTemplateValidationResult = {
  valid: boolean;
  issues: TemplateV2ValidationIssue[];
};

function addZodIssues(
  issues: TemplateV2ValidationIssue[],
  prefix: string,
  error: z.ZodError,
): void {
  for (const item of error.issues) {
    const joined = item.path.length ? item.path.map(String).join(".") : undefined;
    issues.push(
      templateV2Issue(
        "sdk.schema.invalid",
        `${prefix}${joined ? `.${joined}` : ""}: ${item.message}`,
        joined ? `${prefix}.${joined}` : prefix,
      ),
    );
  }
}

/**
 * Validate an SDK-defined V2 package in memory (no filesystem).
 */
export function validateDefinedTemplateV2(
  defined: DefinedTemplateV2Package,
): SdkTemplateValidationResult {
  const issues: TemplateV2ValidationIssue[] = [];

  if (defined.manifest.architecture?.version !== "v2") {
    issues.push(
      templateV2Issue(
        "sdk.architecture",
        "manifest.architecture.version must be v2",
        "manifest.architecture.version",
      ),
    );
  }

  if (defined.files.presentation.packageId !== defined.manifest.id) {
    issues.push(
      templateV2Issue(
        "sdk.package_id",
        `presentation.packageId must match manifest.id`,
        "files.presentation.packageId",
      ),
    );
  }

  const schemaChecks = [
    ["presentation", templateV2PresentationProfileSchema, defined.files.presentation],
    ["tokens", templateV2DesignTokensSchema, defined.files.tokens],
    ["motion", templateV2MotionConfigSchema, defined.files.motion],
    ["responsive", templateV2ResponsiveRulesSchema, defined.files.responsive],
    ["componentRegistry", templateV2ComponentRegistrySchema, defined.files.componentRegistry],
  ] as const;

  for (const [label, schema, value] of schemaChecks) {
    const result = schema.safeParse(value);
    if (!result.success) {
      addZodIssues(issues, label, result.error);
    }
  }

  const registryIds = new Set(defined.files.componentRegistry.components.map((c) => c.id));
  const { presentation } = defined.files;

  for (const componentId of [
    presentation.navigation.componentId,
    presentation.hero.componentId,
    presentation.footer.componentId,
  ]) {
    if (!registryIds.has(componentId)) {
      issues.push(
        templateV2Issue(
          "sdk.registry.missing_component",
          `Component "${componentId}" is not in component registry`,
          "files.componentRegistry",
        ),
      );
    }
  }

  for (const [flowKey, flow] of Object.entries(defined.files.flows)) {
    const flowResult = templateV2PageFlowSchema.safeParse(flow);
    if (!flowResult.success) {
      addZodIssues(issues, `flows.${flowKey}`, flowResult.error);
    }
  }

  return { valid: issues.length === 0, issues };
}

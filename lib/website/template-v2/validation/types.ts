import type { TemplateV2ValidationIssue } from "@/lib/website/template-v2/validation/issues";

export type TemplateV2ValidationResult = {
  valid: boolean;
  architectureVersion: "v1" | "v2";
  issues: TemplateV2ValidationIssue[];
};

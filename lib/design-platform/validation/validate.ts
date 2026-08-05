import type { ZodError } from "zod";
import type { TbdpDesignTokens } from "@/lib/design-platform/tokens/types";
import type { TbdpElevationLayer } from "@/lib/design-platform/foundations/elevation/types";
import { tbdpDesignTokensSchema } from "@/lib/design-platform/validation/schemas";
import type {
  TbdpValidationIssue,
  TbdpValidationResult,
} from "@/lib/design-platform/validation/types";

function zodIssuesToValidationIssues(error: ZodError): TbdpValidationIssue[] {
  return error.issues.map((issue) => ({
    code: issue.code,
    message: issue.message,
    path: issue.path.length ? issue.path.map(String).join(".") : undefined,
  }));
}

/** Validates a TBDP design token tree against the Phase 1 schema. */
export function validateTbdpDesignTokens(tokens: TbdpDesignTokens): TbdpValidationResult {
  const parsed = tbdpDesignTokensSchema.safeParse(tokens);
  if (parsed.success) {
    return { valid: true, issues: [] };
  }
  return {
    valid: false,
    issues: zodIssuesToValidationIssues(parsed.error),
  };
}

/** Validates elevation layer z-index ordering is monotonically increasing. */
export function validateElevationHierarchy(tokens: TbdpDesignTokens): TbdpValidationResult {
  const issues: TbdpValidationIssue[] = [];
  const order = tokens.elevation.hierarchy.order;
  let prevZ = -1;
  for (const layer of order) {
    const z = tokens.elevation.layers[layer as TbdpElevationLayer]?.zIndex;
    if (z === undefined) {
      issues.push({
        code: "elevation.missing_layer",
        message: `Elevation layer "${layer}" is missing`,
        path: `elevation.layers.${layer}`,
      });
      continue;
    }
    if (z <= prevZ) {
      issues.push({
        code: "elevation.order",
        message: `Layer "${layer}" z-index (${z}) must be greater than previous (${prevZ})`,
        path: `elevation.layers.${layer}.zIndex`,
      });
    }
    prevZ = z;
  }
  return { valid: issues.length === 0, issues };
}

/** Runs all TBDP Phase 1 validation checks. */
export function validateTbdpFoundation(tokens: TbdpDesignTokens): TbdpValidationResult {
  const schema = validateTbdpDesignTokens(tokens);
  const elevation = validateElevationHierarchy(tokens);
  const issues = [...schema.issues, ...elevation.issues];
  return { valid: issues.length === 0, issues };
}

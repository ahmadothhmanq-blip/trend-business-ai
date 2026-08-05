import { promises as fs } from "node:fs";
import path from "node:path";
import { z } from "zod";
import type { TemplateV2ManifestExtensions } from "@/lib/website/template-v2/contracts/architecture";
import type { TemplateV2RawManifest } from "@/lib/website/template-v2/contracts/package";
import { resolveV2ResponsiveFile } from "@/lib/website/template-v2/utils/component-naming";
import { templateV2Issue } from "@/lib/website/template-v2/validation/issues";
import {
  templateV2ComponentRegistrySchema,
  templateV2ManifestExtensionsSchema,
  templateV2MotionInputSchema,
  templateV2PageFlowSchema,
  templateV2PresentationProfileSchema,
  templateV2ResponsiveInputSchema,
  templateV2ResponsiveRulesSchema,
  templateV2TokensInputSchema,
} from "@/lib/website/template-v2/validation/schemas";
import type { TemplateV2ValidationIssue } from "@/lib/website/template-v2/validation/issues";
import type { TemplateV2ValidationResult } from "@/lib/website/template-v2/validation/types";

async function pathExists(target: string): Promise<boolean> {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

function resolvePackagePath(rootDir: string, relativeFile: string): string {
  const normalized = path.normalize(relativeFile).replace(/^[/\\]+/, "");
  if (normalized.includes("..")) {
    throw new Error(`path escapes package root: ${relativeFile}`);
  }
  const resolved = path.resolve(rootDir, normalized);
  const relative = path.relative(rootDir, resolved);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`path escapes package root: ${relativeFile}`);
  }
  return resolved;
}

async function readJsonFile(filePath: string): Promise<unknown> {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw) as unknown;
}

function addZodIssues(
  issues: TemplateV2ValidationIssue[],
  prefix: string,
  error: z.ZodError,
): void {
  for (const item of error.issues) {
    const joined = item.path.length ? item.path.map(String).join(".") : undefined;
    issues.push(
      templateV2Issue(
        "schema.invalid",
        `${prefix}${joined ? `.${joined}` : ""}: ${item.message}`,
        joined ? `${prefix}.${joined}` : prefix,
      ),
    );
  }
}

export function detectArchitectureVersionFromManifest(
  manifest: TemplateV2RawManifest | TemplateV2ManifestExtensions,
): "v1" | "v2" {
  return manifest.architecture?.version === "v2" ? "v2" : "v1";
}

export function parseManifestExtensions(
  manifest: unknown,
): TemplateV2ManifestExtensions {
  const parsed = templateV2ManifestExtensionsSchema.safeParse(manifest);
  if (!parsed.success) {
    return {};
  }
  return parsed.data;
}

async function loadDocument<T>(
  rootDir: string,
  relativeFile: string,
  schema: z.ZodType<T>,
  label: string,
  issues: TemplateV2ValidationIssue[],
): Promise<T | null> {
  let filePath: string;
  try {
    filePath = resolvePackagePath(rootDir, relativeFile);
  } catch (error) {
    issues.push(
      templateV2Issue(
        "path.invalid",
        error instanceof Error ? error.message : String(error),
        relativeFile,
      ),
    );
    return null;
  }

  if (!(await pathExists(filePath))) {
    issues.push(templateV2Issue("file.missing", `${label} file not found`, relativeFile));
    return null;
  }

  try {
    const json = await readJsonFile(filePath);
    const result = schema.safeParse(json);
    if (!result.success) {
      addZodIssues(issues, label, result.error);
      return null;
    }
    return result.data;
  } catch (error) {
    issues.push(
      templateV2Issue(
        "file.read",
        `${label}: ${error instanceof Error ? error.message : String(error)}`,
        relativeFile,
      ),
    );
    return null;
  }
}

function validatePresentationConsistency(
  issues: TemplateV2ValidationIssue[],
  manifest: TemplateV2RawManifest,
  presentation: z.infer<typeof templateV2PresentationProfileSchema> | null,
  registry: z.infer<typeof templateV2ComponentRegistrySchema> | null,
  flows: Record<string, z.infer<typeof templateV2PageFlowSchema>>,
): void {
  if (!presentation) return;

  if (presentation.packageId !== manifest.id) {
    issues.push(
      templateV2Issue(
        "presentation.package_id",
        `presentation.packageId "${presentation.packageId}" must match manifest.id "${manifest.id}"`,
        "presentation.json",
      ),
    );
  }

  const registryIds = new Set(registry?.components.map((c) => c.id) ?? []);
  const checkComponent = (componentId: string, context: string) => {
    if (registry && !registryIds.has(componentId)) {
      issues.push(
        templateV2Issue(
          "registry.missing_component",
          `Component "${componentId}" referenced in ${context} is not in component registry`,
          context,
        ),
      );
    }
  };

  checkComponent(presentation.navigation.componentId, "presentation.navigation");
  checkComponent(presentation.hero.componentId, "presentation.hero");
  checkComponent(presentation.footer.componentId, "presentation.footer");

  for (const [regionId, componentIds] of Object.entries(presentation.homeFlow.regions)) {
    if (!(regionId in presentation.layout.regions)) {
      issues.push(
        templateV2Issue(
          "flow.unknown_region",
          `homeFlow references unknown region "${regionId}"`,
          `presentation.homeFlow.regions.${regionId}`,
        ),
      );
    }
    for (const componentId of componentIds) {
      checkComponent(componentId, `presentation.homeFlow.regions.${regionId}`);
    }
  }

  for (const flow of Object.values(flows)) {
    for (const [regionId, componentIds] of Object.entries(flow.regions)) {
      for (const componentId of componentIds) {
        checkComponent(componentId, `flows.${flow.pageId}.regions.${regionId}`);
      }
    }
  }
}

const V2_REQUIRED_MANIFEST_FIELDS = [
  "presentation",
  "tokens",
  "motion",
  "componentLibrary",
  "pageFlows",
] as const satisfies ReadonlyArray<keyof TemplateV2ManifestExtensions>;

/**
 * Validate V2 presentation extensions for a template package directory.
 * V1 packages (no architecture.version v2) return valid with architectureVersion v1.
 */
export async function validateTemplateV2Package(
  packageDirectory: string,
  manifest: TemplateV2RawManifest,
): Promise<TemplateV2ValidationResult> {
  const issues: TemplateV2ValidationIssue[] = [];
  const extensions = parseManifestExtensions(manifest);
  const architectureVersion = detectArchitectureVersionFromManifest(extensions);

  if (architectureVersion === "v1") {
    return { valid: true, architectureVersion: "v1", issues: [] };
  }

  for (const field of V2_REQUIRED_MANIFEST_FIELDS) {
    if (!extensions[field]) {
      issues.push(
        templateV2Issue(
          "manifest.missing_v2_field",
          `V2 package requires manifest.${field}`,
          `manifest.${field}`,
        ),
      );
    }
  }

  const presentation = extensions.presentation
    ? await loadDocument(
        packageDirectory,
        extensions.presentation.file,
        templateV2PresentationProfileSchema,
        "presentation",
        issues,
      )
    : null;

  if (extensions.tokens) {
    await loadDocument(
      packageDirectory,
      extensions.tokens.file,
      templateV2TokensInputSchema,
      "tokens",
      issues,
    );
  }

  if (extensions.motion) {
    await loadDocument(
      packageDirectory,
      extensions.motion.file,
      templateV2MotionInputSchema,
      "motion",
      issues,
    );
  }

  if (extensions.responsive) {
    await loadDocument(
      packageDirectory,
      extensions.responsive.file,
      templateV2ResponsiveInputSchema,
      "responsive",
      issues,
    );
  } else if (extensions.responsiveConfig) {
    await loadDocument(
      packageDirectory,
      extensions.responsiveConfig.file,
      templateV2ResponsiveRulesSchema,
      "responsive",
      issues,
    );
  } else {
    await loadDocument(
      packageDirectory,
      resolveV2ResponsiveFile(extensions),
      templateV2ResponsiveRulesSchema,
      "responsive",
      issues,
    );
  }

  const registry = extensions.componentLibrary
    ? await loadDocument(
        packageDirectory,
        extensions.componentLibrary.file,
        templateV2ComponentRegistrySchema,
        "componentLibrary",
        issues,
      )
    : null;

  const flows: Record<string, z.infer<typeof templateV2PageFlowSchema>> = {};
  if (extensions.pageFlows) {
    for (const [flowKey, flowPath] of Object.entries(extensions.pageFlows)) {
      const flow = await loadDocument(
        packageDirectory,
        flowPath,
        templateV2PageFlowSchema,
        `pageFlows.${flowKey}`,
        issues,
      );
      if (flow) {
        flows[flowKey] = flow;
      }
    }
  }

  validatePresentationConsistency(issues, manifest, presentation, registry, flows);

  return {
    valid: issues.length === 0,
    architectureVersion: "v2",
    issues,
  };
}

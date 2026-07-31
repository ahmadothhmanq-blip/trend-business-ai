import { z } from "zod";
import { promises as fs } from "node:fs";
import path from "node:path";
import {
  WB_COMPONENT_LIBRARY_SPEC_VERSION,
  WB_COMPONENT_MANIFEST_FILENAME,
  WB_COMPONENTS_RELATIVE_PATH,
} from "@/lib/website/component-library/constants";
import {
  validateComponentComposition,
  validateComposableManifestConsistency,
} from "@/lib/website/component-library/composition";
import { validateComponentConstraints } from "@/lib/website/component-library/constraints";
import { assertRendererContract } from "@/lib/website/component-library/contracts/renderer";
import {
  parseWbComponentManifest,
  wbComponentCompositionDocumentSchema,
  wbComponentConstraintsDocumentSchema,
  wbComponentEditablePropertiesDocumentSchema,
  wbComponentPropsSchemaDocumentSchema,
  wbComponentRendererContractDocumentSchema,
  wbComponentResponsiveDocumentSchema,
  wbComponentSlotsDocumentSchema,
  wbComponentValidationDocumentSchema,
  wbComponentVariantsDocumentSchema,
} from "@/lib/website/component-library/spec/schema";
import type {
  WbComponentManifest,
  WbComponentPackageValidationResult,
  WbComponentResolvedPackage,
  WbComponentValidationIssue,
} from "@/lib/website/component-library/types";

export function resolveWbComponentsRoot(cwd: string = process.cwd()): string {
  return path.join(cwd, WB_COMPONENTS_RELATIVE_PATH);
}

async function pathExists(target: string): Promise<boolean> {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

function issue(
  code: string,
  message: string,
  issuePath?: string,
): WbComponentValidationIssue {
  return { code, message, path: issuePath };
}

function resolvePackagePath(rootDir: string, relativePath: string): string {
  const normalized = path.normalize(relativePath).replace(/^[/\\]+/, "");
  if (normalized.includes("..")) {
    throw new Error(`path escapes package root: ${relativePath}`);
  }
  const resolved = path.resolve(rootDir, normalized);
  const relative = path.relative(rootDir, resolved);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`path escapes package root: ${relativePath}`);
  }
  return resolved;
}

async function readJsonFile(filePath: string): Promise<unknown> {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw) as unknown;
}

function addZodIssues(
  issues: WbComponentValidationIssue[],
  prefix: string,
  error: z.ZodError,
): void {
  for (const item of error.issues) {
    const joined = item.path.length ? item.path.map(String).join(".") : undefined;
    issues.push(
      issue(
        "schema.invalid",
        `${prefix}${joined ? `.${joined}` : ""}: ${item.message}`,
        joined ? `${prefix}.${joined}` : prefix,
      ),
    );
  }
}

async function loadDocument<T>(
  rootDir: string,
  relativeFile: string,
  schema: z.ZodType<T>,
  label: string,
  issues: WbComponentValidationIssue[],
): Promise<T | null> {
  let filePath: string;
  try {
    filePath = resolvePackagePath(rootDir, relativeFile);
  } catch (error) {
    issues.push(
      issue(
        "path.invalid",
        error instanceof Error ? error.message : String(error),
        relativeFile,
      ),
    );
    return null;
  }

  if (!(await pathExists(filePath))) {
    issues.push(issue("file.missing", `${label} file not found`, relativeFile));
    return null;
  }

  try {
    const raw = await readJsonFile(filePath);
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      addZodIssues(issues, label, parsed.error);
      return null;
    }
    return parsed.data;
  } catch (error) {
    issues.push(
      issue(
        "file.unreadable",
        `${label} could not be read: ${error instanceof Error ? error.message : String(error)}`,
        relativeFile,
      ),
    );
    return null;
  }
}

function assertDocumentId(
  expectedId: string,
  actualId: string,
  label: string,
  file: string,
  issues: WbComponentValidationIssue[],
): void {
  if (expectedId !== actualId) {
    issues.push(
      issue(
        "document.id.mismatch",
        `${label} id "${actualId}" does not match manifest id "${expectedId}"`,
        file,
      ),
    );
  }
}

export type ValidateWbComponentPackageOptions = {
  requireDirectoryNameMatch?: boolean;
  installedComponentIds?: Set<string>;
};

export async function validateWbComponentPackage(
  packageDir: string,
  options?: ValidateWbComponentPackageOptions,
): Promise<WbComponentPackageValidationResult> {
  const issues: WbComponentValidationIssue[] = [];
  const packageDirName = path.basename(packageDir);
  const manifestPath = path.join(packageDir, WB_COMPONENT_MANIFEST_FILENAME);

  if (!(await pathExists(manifestPath))) {
    return {
      valid: false,
      issues: [
        issue(
          "manifest.missing",
          `${WB_COMPONENT_MANIFEST_FILENAME} not found in component directory`,
        ),
      ],
    };
  }

  let manifest: WbComponentManifest;
  try {
    manifest = parseWbComponentManifest(await readJsonFile(manifestPath));
  } catch (error) {
    if (error instanceof z.ZodError) {
      addZodIssues(issues, "manifest", error);
    } else {
      issues.push(
        issue(
          "manifest.invalid",
          error instanceof Error ? error.message : String(error),
        ),
      );
    }
    return { valid: false, issues };
  }

  if (
    options?.requireDirectoryNameMatch !== false &&
    packageDirName !== manifest.id
  ) {
    issues.push(
      issue(
        "package.dirname.mismatch",
        `component folder name "${packageDirName}" must match manifest id "${manifest.id}"`,
      ),
    );
  }

  if (manifest.specVersion !== WB_COMPONENT_LIBRARY_SPEC_VERSION) {
    issues.push(
      issue(
        "spec.version.mismatch",
        `manifest specVersion must be ${WB_COMPONENT_LIBRARY_SPEC_VERSION}`,
        "specVersion",
      ),
    );
  }

  const propsSchema = await loadDocument(
    packageDir,
    manifest.propsSchema.file,
    wbComponentPropsSchemaDocumentSchema,
    "propsSchema",
    issues,
  );
  const slots = await loadDocument(
    packageDir,
    manifest.slots.file,
    wbComponentSlotsDocumentSchema,
    "slots",
    issues,
  );
  const variants = await loadDocument(
    packageDir,
    manifest.variants.file,
    wbComponentVariantsDocumentSchema,
    "variants",
    issues,
  );
  const responsive = await loadDocument(
    packageDir,
    manifest.responsive.file,
    wbComponentResponsiveDocumentSchema,
    "responsive",
    issues,
  );
  const editableProperties = await loadDocument(
    packageDir,
    manifest.editableProperties.file,
    wbComponentEditablePropertiesDocumentSchema,
    "editableProperties",
    issues,
  );
  const validation = await loadDocument(
    packageDir,
    manifest.validation.file,
    wbComponentValidationDocumentSchema,
    "validation",
    issues,
  );
  const renderer = await loadDocument(
    packageDir,
    manifest.renderer.file,
    wbComponentRendererContractDocumentSchema,
    "renderer",
    issues,
  );
  const composition = manifest.composition
    ? await loadDocument(
        packageDir,
        manifest.composition.file,
        wbComponentCompositionDocumentSchema,
        "composition",
        issues,
      )
    : undefined;
  const constraints = manifest.constraints
    ? await loadDocument(
        packageDir,
        manifest.constraints.file,
        wbComponentConstraintsDocumentSchema,
        "constraints",
        issues,
      )
    : undefined;

  if (propsSchema) assertDocumentId(manifest.id, propsSchema.id, "propsSchema", manifest.propsSchema.file, issues);
  if (slots) assertDocumentId(manifest.id, slots.id, "slots", manifest.slots.file, issues);
  if (variants) assertDocumentId(manifest.id, variants.id, "variants", manifest.variants.file, issues);
  if (responsive) assertDocumentId(manifest.id, responsive.id, "responsive", manifest.responsive.file, issues);
  if (editableProperties) {
    assertDocumentId(manifest.id, editableProperties.id, "editableProperties", manifest.editableProperties.file, issues);
  }
  if (validation) assertDocumentId(manifest.id, validation.id, "validation", manifest.validation.file, issues);
  if (renderer) assertDocumentId(manifest.id, renderer.componentId, "renderer", manifest.renderer.file, issues);
  if (composition) assertDocumentId(manifest.id, composition.id, "composition", manifest.composition!.file, issues);
  if (constraints) assertDocumentId(manifest.id, constraints.id, "constraints", manifest.constraints!.file, issues);

  if (slots && manifest) {
    validateComposableManifestConsistency(manifest, slots, issues);
  }

  if (slots && variants && propsSchema && validation) {
    issues.push(
      ...validateComponentConstraints(
        slots as WbComponentResolvedPackage["slots"],
        variants as WbComponentResolvedPackage["variants"],
        propsSchema as WbComponentResolvedPackage["propsSchema"],
        validation as WbComponentResolvedPackage["validation"],
        constraints as WbComponentResolvedPackage["constraints"] | undefined,
      ),
    );
  }

  if (responsive && slots) {
    for (const rule of responsive.rules) {
      if (rule.slotId && !slots.slots.some((slot) => slot.id === rule.slotId)) {
        issues.push(
          issue(
            "responsive.slot.unknown",
            `responsive rule references unknown slot "${rule.slotId}"`,
            manifest.responsive.file,
          ),
        );
      }
    }
  }

  if (composition && slots && manifest) {
    const compositionValidation = validateComponentComposition(
      {
        manifest,
        slots: slots as WbComponentResolvedPackage["slots"],
        composition: composition as NonNullable<WbComponentResolvedPackage["composition"]>,
      },
      (composition as NonNullable<WbComponentResolvedPackage["composition"]>).example ?? [],
      { installedComponentIds: options?.installedComponentIds },
    );
    issues.push(...compositionValidation.issues);
  }

  if (renderer && manifest) {
    try {
      assertRendererContract(manifest.id, renderer);
    } catch (error) {
      issues.push(
        issue(
          "renderer.contract.invalid",
          error instanceof Error ? error.message : String(error),
          manifest.renderer.file,
        ),
      );
    }
  }

  return {
    valid: issues.length === 0,
    componentId: manifest.id,
    componentVersion: manifest.version,
    issues,
  };
}

export async function loadValidatedWbComponentPackage(
  packageDir: string,
  options?: ValidateWbComponentPackageOptions,
): Promise<WbComponentResolvedPackage> {
  const validationResult = await validateWbComponentPackage(packageDir, options);
  if (!validationResult.valid || !validationResult.componentId) {
    const summary = validationResult.issues.map((item) => item.message).join("; ");
    throw new Error(`Invalid component package: ${summary}`);
  }

  const manifest = parseWbComponentManifest(
    await readJsonFile(path.join(packageDir, WB_COMPONENT_MANIFEST_FILENAME)),
  );

  const load = async <T>(file: string, schema: z.ZodType<T>) =>
    schema.parse(await readJsonFile(resolvePackagePath(packageDir, file)));

  return {
    manifest,
    rootDir: packageDir,
    packageDirName: path.basename(packageDir),
    propsSchema: (await load(
      manifest.propsSchema.file,
      wbComponentPropsSchemaDocumentSchema,
    )) as WbComponentResolvedPackage["propsSchema"],
    slots: (await load(
      manifest.slots.file,
      wbComponentSlotsDocumentSchema,
    )) as WbComponentResolvedPackage["slots"],
    variants: (await load(
      manifest.variants.file,
      wbComponentVariantsDocumentSchema,
    )) as WbComponentResolvedPackage["variants"],
    responsive: (await load(
      manifest.responsive.file,
      wbComponentResponsiveDocumentSchema,
    )) as WbComponentResolvedPackage["responsive"],
    editableProperties: (await load(
      manifest.editableProperties.file,
      wbComponentEditablePropertiesDocumentSchema,
    )) as WbComponentResolvedPackage["editableProperties"],
    validation: (await load(
      manifest.validation.file,
      wbComponentValidationDocumentSchema,
    )) as WbComponentResolvedPackage["validation"],
    renderer: (await load(
      manifest.renderer.file,
      wbComponentRendererContractDocumentSchema,
    )) as WbComponentResolvedPackage["renderer"],
    composition: manifest.composition
      ? ((await load(
          manifest.composition.file,
          wbComponentCompositionDocumentSchema,
        )) as WbComponentResolvedPackage["composition"])
      : undefined,
    constraints: manifest.constraints
      ? ((await load(
          manifest.constraints.file,
          wbComponentConstraintsDocumentSchema,
        )) as WbComponentResolvedPackage["constraints"])
      : undefined,
    loadedAt: new Date().toISOString(),
  };
}

export function manifestFileName(): string {
  return WB_COMPONENT_MANIFEST_FILENAME;
}

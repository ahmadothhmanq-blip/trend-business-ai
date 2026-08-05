import { promises as fs } from "node:fs";
import path from "node:path";
import type { TemplateV2PackageBundle, TemplateV2RawManifest } from "@/lib/website/template-v2/contracts/package";
import { resolveV2ResponsiveFile } from "@/lib/website/template-v2/utils/component-naming";
import {
  consumeTbdpNativePackage,
  isTbdpNativeMotionManifest,
  isTbdpNativeResponsiveManifest,
  isTbdpNativeTokensManifest,
} from "@/lib/website/template-v2/tbdp";
import {
  detectArchitectureVersionFromManifest,
  validateTemplateV2Package,
} from "@/lib/website/template-v2/validation/validate-v2-package";
import {
  templateV2ComponentRegistrySchema,
  templateV2DesignTokensSchema,
  templateV2MotionConfigSchema,
  templateV2MotionInputSchema,
  templateV2PageFlowSchema,
  templateV2PresentationProfileSchema,
  templateV2ResponsiveInputSchema,
  templateV2ResponsiveRulesSchema,
  templateV2TokensInputSchema,
} from "@/lib/website/template-v2/validation/schemas";

const MANIFEST_FILENAME = "manifest.json";

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

async function readJsonFile<T>(filePath: string): Promise<T> {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw) as T;
}

async function readRequiredJson<T>(
  rootDir: string,
  relativeFile: string,
  label: string,
): Promise<T> {
  const filePath = resolvePackagePath(rootDir, relativeFile);
  if (!(await pathExists(filePath))) {
    throw new Error(`${label} file not found: ${relativeFile}`);
  }
  return readJsonFile<T>(filePath);
}

/**
 * Read raw manifest JSON including optional V2 extension fields.
 * Does not use the engine strict manifest parser (V3 fields are not in spec 2.0.0 yet).
 */
export async function readTemplatePackageManifestRaw(
  packageDirectory: string,
): Promise<TemplateV2RawManifest> {
  const manifestPath = path.join(packageDirectory, MANIFEST_FILENAME);
  if (!(await pathExists(manifestPath))) {
    throw new Error(`manifest.json not found in ${packageDirectory}`);
  }
  return readJsonFile<TemplateV2RawManifest>(manifestPath);
}

export type LoadTemplateV2PackageOptions = {
  language?: string | null;
};

export type LoadTemplateV2PackageResult =
  | { ok: true; bundle: TemplateV2PackageBundle }
  | { ok: false; error: string; issues?: Array<{ code: string; message: string }> };

/**
 * Load a V2 presentation bundle from disk. Returns error for V1 packages.
 */
export async function loadTemplateV2Package(
  packageDirectory: string,
  options: LoadTemplateV2PackageOptions = {},
): Promise<LoadTemplateV2PackageResult> {
  const manifest = await readTemplatePackageManifestRaw(packageDirectory);
  const architectureVersion = detectArchitectureVersionFromManifest(manifest);

  if (architectureVersion !== "v2") {
    return {
      ok: false,
      error: `Package "${manifest.id}" is not a V2 template (architecture.version !== "v2")`,
    };
  }

  const validation = await validateTemplateV2Package(packageDirectory, manifest);
  if (!validation.valid) {
    return {
      ok: false,
      error: `V2 package validation failed for "${manifest.id}"`,
      issues: validation.issues,
    };
  }

  if (
    !manifest.presentation?.file ||
    !manifest.tokens?.file ||
    !manifest.motion?.file ||
    !manifest.componentLibrary?.file ||
    !manifest.pageFlows
  ) {
    return {
      ok: false,
      error: `V2 package "${manifest.id}" is missing required manifest extension fields`,
    };
  }

  const responsiveFile =
    manifest.responsive?.file ??
    manifest.responsiveConfig?.file ??
    resolveV2ResponsiveFile(manifest);

  const presentation = templateV2PresentationProfileSchema.parse(
    await readRequiredJson(packageDirectory, manifest.presentation.file, "presentation"),
  );

  const tokensInput = templateV2TokensInputSchema.parse(
    await readRequiredJson(packageDirectory, manifest.tokens.file, "tokens"),
  );
  const motionInput = templateV2MotionInputSchema.parse(
    await readRequiredJson(packageDirectory, manifest.motion.file, "motion"),
  );
  const responsiveInput = templateV2ResponsiveInputSchema.parse(
    await readRequiredJson(packageDirectory, responsiveFile, "responsive"),
  );

  const componentRegistry = templateV2ComponentRegistrySchema.parse(
    await readRequiredJson(
      packageDirectory,
      manifest.componentLibrary.file,
      "componentLibrary",
    ),
  );

  const flows: TemplateV2PackageBundle["flows"] = {};
  for (const [flowKey, flowPath] of Object.entries(manifest.pageFlows)) {
    flows[flowKey] = templateV2PageFlowSchema.parse(
      await readRequiredJson(packageDirectory, flowPath, `pageFlows.${flowKey}`),
    );
  }

  const baseBundlePartial = {
    packageId: manifest.id,
    packageDirectory,
    architectureVersion: "v2" as const,
    manifest,
    presentation,
    componentRegistry,
    flows,
  };

  if (
    isTbdpNativeTokensManifest(tokensInput) &&
    isTbdpNativeMotionManifest(motionInput) &&
    isTbdpNativeResponsiveManifest(responsiveInput)
  ) {
    return {
      ok: true,
      bundle: consumeTbdpNativePackage({
        bundle: {
          ...baseBundlePartial,
          tokens: {} as TemplateV2PackageBundle["tokens"],
          motion: {} as TemplateV2PackageBundle["motion"],
          responsive: {} as TemplateV2PackageBundle["responsive"],
        },
        tokensRaw: tokensInput,
        motionRaw: motionInput,
        responsiveRaw: responsiveInput,
        language: options.language,
      }),
    };
  }

  return {
    ok: true,
    bundle: {
      ...baseBundlePartial,
      tokens: templateV2DesignTokensSchema.parse(tokensInput),
      motion: templateV2MotionConfigSchema.parse(motionInput),
      responsive: templateV2ResponsiveRulesSchema.parse(responsiveInput),
    },
  };
}

/**
 * Inspect manifest architecture without loading full V2 bundle.
 */
export async function inspectTemplatePackageArchitecture(
  packageDirectory: string,
): Promise<{ packageId: string; architectureVersion: "v1" | "v2" }> {
  const manifest = await readTemplatePackageManifestRaw(packageDirectory);
  return {
    packageId: manifest.id,
    architectureVersion: detectArchitectureVersionFromManifest(manifest),
  };
}

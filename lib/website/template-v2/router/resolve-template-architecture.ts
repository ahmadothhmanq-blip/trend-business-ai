import path from "node:path";
import { resolveWbTemplatesRoot } from "@/lib/website/template-engine/constants.server";
import type { TemplateArchitectureVersion } from "@/lib/website/template-v2/constants";
import { readTemplateArchitectureFromSettings } from "@/lib/website/template-v2/contracts/settings";
import type { TemplateV2RawManifest } from "@/lib/website/template-v2/contracts/package";
import { readTemplatePackageManifestRaw } from "@/lib/website/template-v2/loader/load-v2-package";
import { detectArchitectureVersionFromManifest } from "@/lib/website/template-v2/validation/validate-v2-package";

export type ResolveTemplateArchitectureInput = {
  packageId?: string;
  manifest?: TemplateV2RawManifest;
  projectSettings?: Record<string, unknown> | null;
  templatesRoot?: string;
};

export type ResolveTemplateArchitectureResult = {
  architectureVersion: TemplateArchitectureVersion;
  packageId: string | null;
  reason: string;
};

async function loadManifestForPackage(
  packageId: string,
  templatesRoot: string,
): Promise<TemplateV2RawManifest | null> {
  try {
    const packageDirectory = path.join(templatesRoot, packageId);
    return await readTemplatePackageManifestRaw(packageDirectory);
  } catch {
    return null;
  }
}

/**
 * Determine which template architecture applies. P0: routing only — no apply side effects.
 *
 * Rules:
 * 1. Project pinned to v2 + package supports v2 → v2
 * 2. Package manifest declares architecture.version v2 → v2
 * 3. Default → v1 (all current installed packages)
 */
export async function resolveTemplateArchitecture(
  input: ResolveTemplateArchitectureInput,
): Promise<ResolveTemplateArchitectureResult> {
  const settingsVersion = readTemplateArchitectureFromSettings(input.projectSettings);
  const templatesRoot = input.templatesRoot ?? resolveWbTemplatesRoot();

  let manifest = input.manifest ?? null;
  let packageId = input.packageId?.trim() || manifest?.id || null;

  if (!manifest && packageId) {
    manifest = await loadManifestForPackage(packageId, templatesRoot);
  }

  if (!packageId && manifest?.id) {
    packageId = manifest.id;
  }

  const packageArchitecture = manifest
    ? detectArchitectureVersionFromManifest(manifest)
    : "v1";

  if (settingsVersion === "v2") {
    if (packageArchitecture === "v2") {
      return {
        architectureVersion: "v2",
        packageId,
        reason: "project settings pin v2 and package supports v2",
      };
    }
    return {
      architectureVersion: "v1",
      packageId,
      reason: "project settings request v2 but package is v1 — safe fallback",
    };
  }

  if (packageArchitecture === "v2") {
    return {
      architectureVersion: "v2",
      packageId,
      reason: "package manifest declares architecture.version v2",
    };
  }

  return {
    architectureVersion: "v1",
    packageId,
    reason: "default v1 compatibility path",
  };
}

/** Synchronous resolver when manifest is already available. */
export function resolveTemplateArchitectureFromManifest(
  manifest: TemplateV2RawManifest,
  projectSettings?: Record<string, unknown> | null,
): ResolveTemplateArchitectureResult {
  const settingsVersion = readTemplateArchitectureFromSettings(projectSettings);
  const packageArchitecture = detectArchitectureVersionFromManifest(manifest);

  if (settingsVersion === "v2" && packageArchitecture === "v2") {
    return {
      architectureVersion: "v2",
      packageId: manifest.id,
      reason: "project settings pin v2 and package supports v2",
    };
  }

  if (settingsVersion === "v2" && packageArchitecture !== "v2") {
    return {
      architectureVersion: "v1",
      packageId: manifest.id,
      reason: "project settings request v2 but package is v1 — safe fallback",
    };
  }

  if (packageArchitecture === "v2") {
    return {
      architectureVersion: "v2",
      packageId: manifest.id,
      reason: "package manifest declares architecture.version v2",
    };
  }

  return {
    architectureVersion: "v1",
    packageId: manifest.id,
    reason: "default v1 compatibility path",
  };
}

export function shouldUseV1Apply(architectureVersion: TemplateArchitectureVersion): boolean {
  return architectureVersion === "v1";
}

export function shouldUseV2Apply(architectureVersion: TemplateArchitectureVersion): boolean {
  return architectureVersion === "v2";
}

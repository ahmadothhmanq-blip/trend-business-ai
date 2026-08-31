import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import {
  initializeWbTemplateEngine,
  loadWbTemplatePackages,
  validateWbTemplatePackage,
} from "@/lib/website/template-engine/index.server";
import { resolveWbTemplatesRoot } from "@/lib/website/template-engine/constants.server";
import { getRemoteMarketplaceListing } from "@/lib/website/template-marketplace/remote-catalog";
import {
  getTemplateMarketplaceRegistryListing,
  getWbTemplateMarketplaceRegistry,
} from "@/lib/website/template-marketplace/registry";
import type { WbTemplateMarketplaceListing } from "@/lib/website/template-marketplace/types";
import { PACKAGE_SUPERSESSION_ALIASES } from "@/lib/website/builder/package-supersession-aliases";

export const WB_TEMPLATE_REGISTRY_RELATIVE_PATH = "templates/website-registry";

export type InstallRemoteTemplateResult = {
  ok: true;
  listing: WbTemplateMarketplaceListing;
  alreadyInstalled: boolean;
  packageId: string;
  packageVersion: string;
};

export type InstallRemoteTemplateError = {
  ok: false;
  code: string;
  message: string;
  issues?: Array<{ code: string; message: string; path?: string }>;
};

async function pathExists(target: string): Promise<boolean> {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

export function resolveRegistryPackageDir(
  templateId: string,
  cwd: string = process.cwd(),
): string {
  return path.join(cwd, WB_TEMPLATE_REGISTRY_RELATIVE_PATH, templateId);
}

export function resolveInstalledPackageDir(
  templateId: string,
  cwd: string = process.cwd(),
): string {
  return path.join(resolveWbTemplatesRoot(cwd), templateId);
}

async function sha256File(filePath: string): Promise<string> {
  const content = await fs.readFile(filePath);
  return createHash("sha256").update(content).digest("hex");
}

async function verifyPackageChecksum(
  packageDir: string,
  expectedChecksum: string | undefined,
): Promise<void> {
  if (!expectedChecksum?.trim()) return;
  const manifestPath = path.join(packageDir, "manifest.json");
  const digest = await sha256File(manifestPath);
  const normalized = expectedChecksum.replace(/^sha256:/i, "").toLowerCase();
  if (digest !== normalized) {
    throw new Error(
      `Package checksum mismatch for manifest.json (expected ${normalized}, got ${digest})`,
    );
  }
}

async function copyPackageDirectory(
  sourceDir: string,
  targetDir: string,
): Promise<void> {
  await fs.mkdir(path.dirname(targetDir), { recursive: true });
  if (await pathExists(targetDir)) {
    await fs.rm(targetDir, { recursive: true, force: true });
  }
  await fs.cp(sourceDir, targetDir, { recursive: true });
}

async function downloadPackageArchive(
  packageUrl: string,
  targetDir: string,
): Promise<void> {
  const response = await fetch(packageUrl);
  if (!response.ok) {
    throw new Error(
      `Failed to download template package (${response.status} ${response.statusText})`,
    );
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    throw new Error(
      "Remote package URL returned JSON — expected a distributable package directory or archive endpoint",
    );
  }

  // Archive distribution is reserved for a future release; registry filesystem is authoritative today.
  throw new Error(
    `Remote package archives are not supported yet (received ${contentType || "unknown content type"})`,
  );
}

async function resolvePackageSourceDir(
  templateId: string,
  remote: WbTemplateMarketplaceListing,
): Promise<string> {
  const registryDir = resolveRegistryPackageDir(templateId);
  if (await pathExists(registryDir)) {
    return registryDir;
  }

  const registryId = remote.remote?.registryId?.trim() || templateId;
  const registryByRef = resolveRegistryPackageDir(registryId);
  if (registryByRef !== registryDir && (await pathExists(registryByRef))) {
    return registryByRef;
  }

  if (remote.remote?.packageUrl?.trim()) {
    const tempDir = path.join(
      resolveWbTemplatesRoot(),
      ".install-staging",
      `${templateId}-${Date.now()}`,
    );
    await downloadPackageArchive(remote.remote.packageUrl, tempDir);
    return tempDir;
  }

  throw new Error(
    `Template package "${templateId}" is not available in the local registry`,
  );
}

async function registerInstalledPackage(): Promise<void> {
  await loadWbTemplatePackages({ clearRegistry: true });
  await getWbTemplateMarketplaceRegistry().refresh();
}

/**
 * Install a remote marketplace template package into `templates/website/<id>/`,
 * validate it, and register it with the template engine + marketplace registry.
 */
export async function installRemoteTemplatePackage(
  templateId: string,
): Promise<InstallRemoteTemplateResult | InstallRemoteTemplateError> {
  const normalizedId = templateId.trim();
  const resolvedId = PACKAGE_SUPERSESSION_ALIASES[normalizedId] ?? normalizedId;
  if (!normalizedId) {
    return {
      ok: false,
      code: "input.invalid",
      message: "Template id is required",
    };
  }

  await initializeWbTemplateEngine();
  const existing = await getTemplateMarketplaceRegistryListing(resolvedId);
  if (existing?.availability === "installed") {
    await registerInstalledPackage();
    const listing = await getTemplateMarketplaceRegistryListing(resolvedId);
    if (!listing) {
      return {
        ok: false,
        code: "registry.missing",
        message: `Installed template "${resolvedId}" could not be resolved after refresh`,
      };
    }
    return {
      ok: true,
      listing:
        resolvedId === normalizedId
          ? listing
          : { ...listing, id: normalizedId },
      alreadyInstalled: true,
      packageId: listing.id,
      packageVersion: listing.version,
    };
  }

  const remote = getRemoteMarketplaceListing(normalizedId);
  const registryListing = await getTemplateMarketplaceRegistryListing(normalizedId);
  if (!remote && !registryListing) {
    return {
      ok: false,
      code: "listing.not_found",
      message: `Remote template "${normalizedId}" was not found in the marketplace catalog`,
    };
  }

  if (registryListing?.availability === "unavailable") {
    return {
      ok: false,
      code: "listing.unavailable",
      message: `Template "${normalizedId}" is not available for installation yet`,
    };
  }

  if (!remote) {
    return {
      ok: false,
      code: "listing.not_remote",
      message: `Template "${normalizedId}" is not available for installation`,
    };
  }

  let sourceDir: string;
  try {
    sourceDir = await resolvePackageSourceDir(resolvedId, remote);
  } catch (error) {
    return {
      ok: false,
      code: "package.source_missing",
      message:
        error instanceof Error
          ? error.message
          : `Package source for "${normalizedId}" is unavailable`,
    };
  }

  try {
    await verifyPackageChecksum(sourceDir, remote.remote?.checksum);
  } catch (error) {
    return {
      ok: false,
      code: "package.checksum_mismatch",
      message:
        error instanceof Error ? error.message : "Package checksum verification failed",
    };
  }

  const sourceValidation = await validateWbTemplatePackage(sourceDir);
  if (!sourceValidation.valid) {
    return {
      ok: false,
      code: "package.invalid",
      message: `Template package "${resolvedId}" failed validation`,
      issues: sourceValidation.issues,
    };
  }

  const targetDir = resolveInstalledPackageDir(resolvedId);
  try {
    await copyPackageDirectory(sourceDir, targetDir);
  } catch (error) {
    return {
      ok: false,
      code: "package.install_failed",
      message:
        error instanceof Error
          ? error.message
          : `Failed to install template package "${normalizedId}"`,
    };
  }

  const installedValidation = await validateWbTemplatePackage(targetDir);
  if (!installedValidation.valid) {
    await fs.rm(targetDir, { recursive: true, force: true }).catch(() => undefined);
    return {
      ok: false,
      code: "package.invalid",
      message: `Installed template package "${normalizedId}" failed validation`,
      issues: installedValidation.issues,
    };
  }

  await registerInstalledPackage();

  const listing = await getTemplateMarketplaceRegistryListing(normalizedId);
  if (!listing || listing.availability !== "installed") {
    return {
      ok: false,
      code: "registry.register_failed",
      message: `Template "${normalizedId}" was copied but not registered`,
    };
  }

  return {
    ok: true,
    listing,
    alreadyInstalled: false,
    packageId: listing.id,
    packageVersion: listing.version,
  };
}

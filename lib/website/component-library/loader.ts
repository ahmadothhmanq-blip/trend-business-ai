import { promises as fs } from "node:fs";
import path from "node:path";
import { WB_COMPONENT_LIBRARY_SPEC_VERSION } from "@/lib/website/component-library/constants";
import { getWbComponentRegistry } from "@/lib/website/component-library/registry";
import {
  loadValidatedWbComponentPackage,
  manifestFileName,
  resolveWbComponentsRoot,
  validateWbComponentPackage,
} from "@/lib/website/component-library/spec/validate-component";
import type {
  WbComponentLibraryStatus,
  WbComponentLoadReport,
  WbComponentResolvedPackage,
} from "@/lib/website/component-library/types";

async function pathExists(target: string): Promise<boolean> {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

async function discoverComponentDirectories(root: string): Promise<string[]> {
  if (!(await pathExists(root))) return [];
  const entries = await fs.readdir(root, { withFileTypes: true });
  const directories: string[] = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith(".")) continue;
    directories.push(path.join(root, entry.name));
  }
  return directories.sort((a, b) => a.localeCompare(b));
}

export type WbComponentLoaderOptions = {
  componentsRoot?: string;
  clearRegistry?: boolean;
};

/**
 * Scans `components/website/*` and validates each component package.
 * Safe when the directory is empty.
 */
export async function loadWbComponentPackages(
  options?: WbComponentLoaderOptions,
): Promise<WbComponentLoadReport> {
  const componentsRoot = options?.componentsRoot ?? resolveWbComponentsRoot();
  const registry = getWbComponentRegistry();

  if (options?.clearRegistry !== false) {
    registry.clear();
  }

  const report: WbComponentLoadReport = {
    discovered: 0,
    registered: 0,
    skipped: 0,
    errors: [],
  };

  const directories = await discoverComponentDirectories(componentsRoot);
  report.discovered = directories.length;

  // First pass: collect ids for composition cross-reference validation.
  const discoveredIds = new Set<string>();
  for (const directory of directories) {
    const manifestPath = path.join(directory, manifestFileName());
    if (!(await pathExists(manifestPath))) continue;
    try {
      const raw = await fs.readFile(manifestPath, "utf8");
      const parsed = JSON.parse(raw) as { id?: string };
      if (parsed.id) discoveredIds.add(parsed.id);
    } catch {
      // handled in second pass
    }
  }

  for (const directory of directories) {
    const manifestPath = path.join(directory, manifestFileName());
    if (!(await pathExists(manifestPath))) {
      report.skipped += 1;
      report.errors.push({
        directory,
        message: `${manifestFileName()} not found`,
      });
      continue;
    }

    try {
      const validation = await validateWbComponentPackage(directory, {
        installedComponentIds: discoveredIds,
      });
      if (!validation.valid) {
        report.skipped += 1;
        report.errors.push({
          directory,
          message: validation.issues.map((item) => item.message).join("; "),
          issues: validation.issues,
        });
        continue;
      }

      const pkg = await loadValidatedWbComponentPackage(directory, {
        installedComponentIds: discoveredIds,
      });

      if (registry.has(pkg.manifest.id)) {
        report.skipped += 1;
        report.errors.push({
          directory,
          message: `duplicate component id "${pkg.manifest.id}"`,
        });
        continue;
      }

      registry.register(pkg);
      report.registered += 1;
    } catch (error) {
      report.skipped += 1;
      report.errors.push({
        directory,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return report;
}

export async function loadWbComponentPackageById(
  componentId: string,
  options?: WbComponentLoaderOptions,
): Promise<WbComponentResolvedPackage | null> {
  await loadWbComponentPackages(options);
  return getWbComponentRegistry().getPackage(componentId);
}

export function getWbComponentLibraryStatus(
  componentsRoot?: string,
): WbComponentLibraryStatus {
  const registry = getWbComponentRegistry();
  return {
    libraryVersion: WB_COMPONENT_LIBRARY_SPEC_VERSION,
    componentsRoot: componentsRoot ?? resolveWbComponentsRoot(),
    installedCount: registry.size(),
    lastLoadedAt: registry.getLastLoadedAt(),
  };
}

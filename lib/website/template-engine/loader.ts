import { promises as fs } from "node:fs";
import path from "node:path";
import { resolveWbTemplatesRoot } from "@/lib/website/template-engine/constants.server";
import { getWbTemplateRegistry } from "@/lib/website/template-engine/registry";
import {
  loadValidatedWbTemplatePackage,
  validateWbTemplatePackage,
} from "@/lib/website/template-engine/spec/server";
import { WB_TEMPLATE_MANIFEST_FILENAME } from "@/lib/website/template-engine/spec/constants";
import type {
  WbTemplateLoadReport,
  WbTemplatePackage,
} from "@/lib/website/template-engine/types";

async function pathExists(target: string): Promise<boolean> {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

async function discoverTemplateDirectories(root: string): Promise<string[]> {
  if (!(await pathExists(root))) {
    return [];
  }

  const entries = await fs.readdir(root, { withFileTypes: true });
  const directories: string[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith(".")) continue;
    directories.push(path.join(root, entry.name));
  }

  return directories.sort((a, b) => a.localeCompare(b));
}

export type WbTemplateLoaderOptions = {
  templatesRoot?: string;
  clearRegistry?: boolean;
};

/**
 * Filesystem loader — scans `templates/website/*` and validates each package
 * against the Template Package Specification before registration.
 */
export async function loadWbTemplatePackages(
  options?: WbTemplateLoaderOptions,
): Promise<WbTemplateLoadReport> {
  const templatesRoot = options?.templatesRoot ?? resolveWbTemplatesRoot();
  const registry = getWbTemplateRegistry();

  if (options?.clearRegistry !== false) {
    registry.clear();
  }

  const report: WbTemplateLoadReport = {
    discovered: 0,
    registered: 0,
    skipped: 0,
    errors: [],
  };

  const directories = await discoverTemplateDirectories(templatesRoot);
  report.discovered = directories.length;

  for (const directory of directories) {
    const manifestPath = path.join(directory, WB_TEMPLATE_MANIFEST_FILENAME);
    if (!(await pathExists(manifestPath))) {
      report.skipped += 1;
      report.errors.push({
        directory,
        message: `${WB_TEMPLATE_MANIFEST_FILENAME} not found`,
      });
      continue;
    }

    try {
      const validation = await validateWbTemplatePackage(directory);
      if (!validation.valid) {
        report.skipped += 1;
        report.errors.push({
          directory,
          message: validation.issues.map((item) => item.message).join("; "),
          issues: validation.issues,
        });
        continue;
      }

      const pkg = await loadValidatedWbTemplatePackage(directory);

      if (registry.has(pkg.manifest.id)) {
        report.skipped += 1;
        report.errors.push({
          directory,
          message: `duplicate template id "${pkg.manifest.id}"`,
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

export async function loadWbTemplatePackageById(
  templateId: string,
  options?: WbTemplateLoaderOptions,
): Promise<WbTemplatePackage | null> {
  await loadWbTemplatePackages(options);
  return getWbTemplateRegistry().getPackage(templateId);
}

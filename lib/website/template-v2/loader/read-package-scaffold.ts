import { promises as fs } from "node:fs";
import path from "node:path";
import type { TemplateV2ComponentDefinition } from "@/lib/website/template-v2/contracts/component-registry";
import {
  componentIdToProjectPath,
} from "@/lib/website/template-v2/utils/component-naming";

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

export async function readPackageComponentScaffold(
  packageDirectory: string,
  packageId: string,
  component: TemplateV2ComponentDefinition,
): Promise<{ path: string; content: string } | null> {
  const scaffoldPath = resolvePackagePath(packageDirectory, component.scaffold);
  if (!(await pathExists(scaffoldPath))) {
    return null;
  }
  const content = await fs.readFile(scaffoldPath, "utf8");
  return {
    path: componentIdToProjectPath(packageId, component.scaffold),
    content,
  };
}

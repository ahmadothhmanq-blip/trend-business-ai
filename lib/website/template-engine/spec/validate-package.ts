import { z } from "zod";
import { promises as fs } from "node:fs";
import path from "node:path";
import { WB_TEMPLATE_ENGINE_VERSION } from "@/lib/website/template-engine/constants";
import { WB_TEMPLATE_MANIFEST_FILENAME } from "@/lib/website/template-engine/spec/constants";
import {
  parseWbTemplatePackageManifest,
  wbTemplateAssetsManifestSchema,
  wbTemplateCanvasDocumentSchema,
  wbTemplateComponentTypesDocumentSchema,
  wbTemplateLayoutDocumentSchema,
  wbTemplatePackageEntrySchema,
  wbTemplatePageBlueprintSchema,
  wbTemplatePlacementRulesDocumentSchema,
  wbTemplateRegionDocumentSchema,
} from "@/lib/website/template-engine/spec/schema";
import { satisfiesSemverRange } from "@/lib/website/template-engine/spec/semver";
import type {
  WbTemplatePackageManifest,
  WbTemplatePackageValidationResult,
  WbTemplateResolvedPackage,
  WbTemplateValidationIssue,
} from "@/lib/website/template-engine/spec/types";

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
): WbTemplateValidationIssue {
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
  issues: WbTemplateValidationIssue[],
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
  issues: WbTemplateValidationIssue[],
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

function validateEntryReferences(
  manifest: WbTemplatePackageManifest,
  entry: { defaultPageId: string; defaultLayoutId: string },
  issues: WbTemplateValidationIssue[],
): void {
  if (!manifest.pages.some((page) => page.id === entry.defaultPageId)) {
    issues.push(
      issue(
        "entry.page.missing",
        `entry.defaultPageId "${entry.defaultPageId}" is not declared in manifest.pages`,
        "entry.defaultPageId",
      ),
    );
  }
  if (!manifest.layouts.some((layout) => layout.id === entry.defaultLayoutId)) {
    issues.push(
      issue(
        "entry.layout.missing",
        `entry.defaultLayoutId "${entry.defaultLayoutId}" is not declared in manifest.layouts`,
        "entry.defaultLayoutId",
      ),
    );
  }
}

function validateLayoutDocuments(
  manifest: WbTemplatePackageManifest,
  layouts: Record<string, import("@/lib/website/template-engine/spec/types").WbTemplateLayoutDocument>,
  regionIds: Set<string>,
  issues: WbTemplateValidationIssue[],
): void {
  for (const layoutRef of manifest.layouts) {
    const layoutDoc = layouts[layoutRef.id];
    if (!layoutDoc) continue;

    if (layoutDoc.id !== layoutRef.id) {
      issues.push(
        issue(
          "layout.id.mismatch",
          `layout file ${layoutRef.file} id "${layoutDoc.id}" does not match manifest id "${layoutRef.id}"`,
          layoutRef.file,
        ),
      );
    }
    if (layoutDoc.kind !== layoutRef.kind) {
      issues.push(
        issue(
          "layout.kind.mismatch",
          `layout "${layoutRef.id}" kind mismatch between manifest and layout file`,
          layoutRef.file,
        ),
      );
    }

    for (const regionId of layoutDoc.regionOrder) {
      if (!regionIds.has(regionId)) {
        issues.push(
          issue(
            "layout.region.missing",
            `layout "${layoutRef.id}" references unknown region "${regionId}"`,
            layoutRef.file,
          ),
        );
      }
    }
  }
}

function validateRegionDocuments(
  manifest: WbTemplatePackageManifest,
  regions: Record<string, import("@/lib/website/template-engine/spec/types").WbTemplateRegionDocument>,
  knownComponentTypeIds: Set<string> | null,
  issues: WbTemplateValidationIssue[],
): void {
  for (const regionRef of manifest.regions) {
    const regionDoc = regions[regionRef.id];
    if (!regionDoc) continue;

    if (regionDoc.id !== regionRef.id) {
      issues.push(
        issue(
          "region.id.mismatch",
          `region file ${regionRef.file} id "${regionDoc.id}" does not match manifest id "${regionRef.id}"`,
          regionRef.file,
        ),
      );
    }
    if (regionDoc.role !== regionRef.role) {
      issues.push(
        issue(
          "region.role.mismatch",
          `region "${regionRef.id}" role mismatch between manifest and region file`,
          regionRef.file,
        ),
      );
    }

    if (regionDoc.placement.minComponents !== undefined) {
      if (regionDoc.placement.minComponents > regionDoc.placement.maxComponents) {
        issues.push(
          issue(
            "region.placement.invalid",
            `region "${regionRef.id}" minComponents exceeds maxComponents`,
            regionRef.file,
          ),
        );
      }
    }

    if (knownComponentTypeIds) {
      for (const typeId of regionDoc.placement.allowedComponentTypes) {
        if (
          typeId !== "custom" &&
          !knownComponentTypeIds.has(typeId) &&
          !regionDoc.placement.allowCustomComponents
        ) {
          issues.push(
            issue(
              "region.component-type.unknown",
              `region "${regionRef.id}" allows unknown component type "${typeId}"`,
              regionRef.file,
            ),
          );
        }
      }
    }
  }
}

function validatePageBlueprints(
  manifest: WbTemplatePackageManifest,
  pages: Record<string, import("@/lib/website/template-engine/spec/types").WbTemplatePageBlueprint>,
  layouts: Record<string, import("@/lib/website/template-engine/spec/types").WbTemplateLayoutDocument>,
  regionIds: Set<string>,
  issues: WbTemplateValidationIssue[],
): void {
  for (const pageRef of manifest.pages) {
    const pageDoc = pages[pageRef.id];
    if (!pageDoc) continue;

    if (pageDoc.id !== pageRef.id) {
      issues.push(
        issue(
          "page.id.mismatch",
          `page file ${pageRef.file} id "${pageDoc.id}" does not match manifest id "${pageRef.id}"`,
          pageRef.file,
        ),
      );
    }
    if (pageDoc.layoutId !== pageRef.layoutId) {
      issues.push(
        issue(
          "page.layout.mismatch",
          `page "${pageRef.id}" layoutId mismatch between manifest and page blueprint`,
          pageRef.file,
        ),
      );
    }

    const layout = layouts[pageDoc.layoutId];
    const layoutRegionOrder = new Set(layout?.regionOrder ?? []);

    for (const regionId of pageDoc.regions) {
      if (!regionIds.has(regionId)) {
        issues.push(
          issue(
            "page.region.missing",
            `page "${pageRef.id}" references unknown region "${regionId}"`,
            pageRef.file,
          ),
        );
        continue;
      }
      if (layout && !layoutRegionOrder.has(regionId)) {
        issues.push(
          issue(
            "page.region.not-in-layout",
            `page "${pageRef.id}" region "${regionId}" is not declared in layout "${pageDoc.layoutId}"`,
            pageRef.file,
          ),
        );
      }
    }
  }
}

function validatePlacementRules(
  manifest: WbTemplatePackageManifest,
  placementRules: import("@/lib/website/template-engine/spec/types").WbTemplatePlacementRulesDocument,
  regionIds: Set<string>,
  pageIds: Set<string>,
  issues: WbTemplateValidationIssue[],
): void {
  if (placementRules.regionOverrides) {
    for (const regionId of Object.keys(placementRules.regionOverrides)) {
      if (!regionIds.has(regionId)) {
        issues.push(
          issue(
            "placement.region-override.unknown",
            `placementRules.regionOverrides references unknown region "${regionId}"`,
            "placementRules.regionOverrides",
          ),
        );
      }
    }
  }

  for (const constraint of placementRules.constraints ?? []) {
    if (constraint.when.region && !regionIds.has(constraint.when.region)) {
      issues.push(
        issue(
          "placement.constraint.region",
          `constraint "${constraint.id}" references unknown region "${constraint.when.region}"`,
          "placementRules.constraints",
        ),
      );
    }
    if (constraint.when.page && !pageIds.has(constraint.when.page)) {
      issues.push(
        issue(
          "placement.constraint.page",
          `constraint "${constraint.id}" references unknown page "${constraint.when.page}"`,
          "placementRules.constraints",
        ),
      );
    }
  }
}

async function validateMediaFiles(
  rootDir: string,
  manifest: WbTemplatePackageManifest,
  issues: WbTemplateValidationIssue[],
): Promise<{ thumbnail: string; preview: string; gallery: string[] }> {
  const mediaPaths = {
    thumbnail: resolvePackagePath(rootDir, manifest.media.thumbnail),
    preview: resolvePackagePath(rootDir, manifest.media.preview),
    gallery: (manifest.media.gallery ?? []).map((item) =>
      resolvePackagePath(rootDir, item),
    ),
  };

  if (!(await pathExists(mediaPaths.thumbnail))) {
    issues.push(
      issue("media.thumbnail.missing", "thumbnail file not found", manifest.media.thumbnail),
    );
  }
  if (!(await pathExists(mediaPaths.preview))) {
    issues.push(
      issue("media.preview.missing", "preview image not found", manifest.media.preview),
    );
  }
  for (const [index, galleryPath] of mediaPaths.gallery.entries()) {
    if (!(await pathExists(galleryPath))) {
      issues.push(
        issue(
          "media.gallery.missing",
          `gallery image not found at index ${index}`,
          manifest.media.gallery?.[index],
        ),
      );
    }
  }

  return mediaPaths;
}

async function validateAssetsIndex(
  rootDir: string,
  manifest: WbTemplatePackageManifest,
  issues: WbTemplateValidationIssue[],
) {
  if (!manifest.assets?.index) return undefined;
  const assets = await loadDocument(
    rootDir,
    manifest.assets.index,
    wbTemplateAssetsManifestSchema,
    "assets.index",
    issues,
  );
  if (!assets) return undefined;

  for (const file of assets.files) {
    const assetPath = resolvePackagePath(rootDir, file.path);
    if (!(await pathExists(assetPath))) {
      issues.push(
        issue(
          "assets.file.missing",
          `asset "${file.id}" file not found`,
          file.path,
        ),
      );
    }
  }
  return assets;
}

export type ValidateWbTemplatePackageOptions = {
  engineVersion?: string;
  requireDirectoryNameMatch?: boolean;
};

export async function validateWbTemplatePackage(
  packageDir: string,
  options?: ValidateWbTemplatePackageOptions,
): Promise<WbTemplatePackageValidationResult> {
  const issues: WbTemplateValidationIssue[] = [];
  const engineVersion = options?.engineVersion ?? WB_TEMPLATE_ENGINE_VERSION;
  const packageDirName = path.basename(packageDir);
  const manifestPath = path.join(packageDir, WB_TEMPLATE_MANIFEST_FILENAME);

  if (!(await pathExists(manifestPath))) {
    return {
      valid: false,
      issues: [
        issue(
          "manifest.missing",
          `${WB_TEMPLATE_MANIFEST_FILENAME} not found in package directory`,
        ),
      ],
    };
  }

  let manifest: WbTemplatePackageManifest;
  try {
    const raw = await readJsonFile(manifestPath);
    manifest = parseWbTemplatePackageManifest(raw);
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
        `package folder name "${packageDirName}" must match manifest id "${manifest.id}"`,
      ),
    );
  }

  if (!satisfiesSemverRange(engineVersion, manifest.compatibility.engineVersion)) {
    issues.push(
      issue(
        "compatibility.engine",
        `engine version ${engineVersion} does not satisfy ${manifest.compatibility.engineVersion}`,
        "compatibility.engineVersion",
      ),
    );
  }

  const entry = await loadDocument(
    packageDir,
    manifest.entry,
    wbTemplatePackageEntrySchema,
    "entry",
    issues,
  );
  if (entry) {
    validateEntryReferences(manifest, entry, issues);
  }

  const canvas = await loadDocument(
    packageDir,
    manifest.canvas.file,
    wbTemplateCanvasDocumentSchema,
    "canvas",
    issues,
  );

  const placementRules = await loadDocument(
    packageDir,
    manifest.placementRules.file,
    wbTemplatePlacementRulesDocumentSchema,
    "placementRules",
    issues,
  );

  const componentTypes = manifest.componentTypes
    ? await loadDocument(
        packageDir,
        manifest.componentTypes.file,
        wbTemplateComponentTypesDocumentSchema,
        "componentTypes",
        issues,
      )
    : undefined;

  const layouts: WbTemplateResolvedPackage["layouts"] = {};
  for (const layoutRef of manifest.layouts) {
    const layoutDoc = await loadDocument(
      packageDir,
      layoutRef.file,
      wbTemplateLayoutDocumentSchema,
      `layout:${layoutRef.id}`,
      issues,
    );
    if (layoutDoc) layouts[layoutRef.id] = layoutDoc;
  }

  const regions: WbTemplateResolvedPackage["regions"] = {};
  for (const regionRef of manifest.regions) {
    const regionDoc = await loadDocument(
      packageDir,
      regionRef.file,
      wbTemplateRegionDocumentSchema,
      `region:${regionRef.id}`,
      issues,
    );
    if (regionDoc) regions[regionRef.id] = regionDoc;
  }

  const pages: WbTemplateResolvedPackage["pages"] = {};
  for (const pageRef of manifest.pages) {
    const pageDoc = await loadDocument(
      packageDir,
      pageRef.file,
      wbTemplatePageBlueprintSchema,
      `page:${pageRef.id}`,
      issues,
    );
    if (pageDoc) pages[pageRef.id] = pageDoc;
  }

  const regionIds = new Set(manifest.regions.map((item) => item.id));
  const pageIds = new Set(manifest.pages.map((item) => item.id));
  const knownComponentTypeIds = componentTypes
    ? new Set(componentTypes.types.map((item) => item.id))
    : null;

  validateLayoutDocuments(manifest, layouts, regionIds, issues);
  validateRegionDocuments(manifest, regions, knownComponentTypeIds, issues);
  validatePageBlueprints(manifest, pages, layouts, regionIds, issues);
  if (placementRules) {
    validatePlacementRules(manifest, placementRules, regionIds, pageIds, issues);
  }

  if (manifest.update.changelog) {
    const changelogPath = resolvePackagePath(packageDir, manifest.update.changelog);
    if (!(await pathExists(changelogPath))) {
      issues.push(
        issue(
          "update.changelog.missing",
          "changelog file not found",
          manifest.update.changelog,
        ),
      );
    }
  }
  if (manifest.update.migrationGuide) {
    const migrationPath = resolvePackagePath(
      packageDir,
      manifest.update.migrationGuide,
    );
    if (!(await pathExists(migrationPath))) {
      issues.push(
        issue(
          "update.migration.missing",
          "migration guide file not found",
          manifest.update.migrationGuide,
        ),
      );
    }
  }

  await validateMediaFiles(packageDir, manifest, issues);
  await validateAssetsIndex(packageDir, manifest, issues);

  if (!canvas) {
    issues.push(issue("canvas.missing", "canvas document is required", manifest.canvas.file));
  }
  if (!placementRules) {
    issues.push(
      issue(
        "placement-rules.missing",
        "placement rules document is required",
        manifest.placementRules.file,
      ),
    );
  }

  return {
    valid: issues.length === 0,
    packageId: manifest.id,
    packageVersion: manifest.version,
    issues,
  };
}

export async function loadValidatedWbTemplatePackage(
  packageDir: string,
  options?: ValidateWbTemplatePackageOptions,
): Promise<WbTemplateResolvedPackage> {
  const validation = await validateWbTemplatePackage(packageDir, options);
  if (!validation.valid || !validation.packageId) {
    const summary = validation.issues.map((item) => item.message).join("; ");
    throw new Error(`Invalid template package: ${summary}`);
  }

  const raw = await readJsonFile(path.join(packageDir, WB_TEMPLATE_MANIFEST_FILENAME));
  const manifest = parseWbTemplatePackageManifest(raw);
  const entry = wbTemplatePackageEntrySchema.parse(
    await readJsonFile(resolvePackagePath(packageDir, manifest.entry)),
  );
  const canvas = wbTemplateCanvasDocumentSchema.parse(
    await readJsonFile(resolvePackagePath(packageDir, manifest.canvas.file)),
  );
  const placementRules = wbTemplatePlacementRulesDocumentSchema.parse(
    await readJsonFile(resolvePackagePath(packageDir, manifest.placementRules.file)),
  );
  const componentTypes = manifest.componentTypes
    ? wbTemplateComponentTypesDocumentSchema.parse(
        await readJsonFile(
          resolvePackagePath(packageDir, manifest.componentTypes.file),
        ),
      )
    : undefined;

  const layouts: WbTemplateResolvedPackage["layouts"] = {};
  for (const layoutRef of manifest.layouts) {
    layouts[layoutRef.id] = wbTemplateLayoutDocumentSchema.parse(
      await readJsonFile(resolvePackagePath(packageDir, layoutRef.file)),
    );
  }

  const regions: WbTemplateResolvedPackage["regions"] = {};
  for (const regionRef of manifest.regions) {
    regions[regionRef.id] = wbTemplateRegionDocumentSchema.parse(
      await readJsonFile(resolvePackagePath(packageDir, regionRef.file)),
    );
  }

  const pages: WbTemplateResolvedPackage["pages"] = {};
  for (const pageRef of manifest.pages) {
    pages[pageRef.id] = wbTemplatePageBlueprintSchema.parse(
      await readJsonFile(resolvePackagePath(packageDir, pageRef.file)),
    );
  }

  const assets = manifest.assets?.index
    ? wbTemplateAssetsManifestSchema.parse(
        await readJsonFile(resolvePackagePath(packageDir, manifest.assets.index)),
      )
    : undefined;

  return {
    manifest,
    rootDir: packageDir,
    packageDirName: path.basename(packageDir),
    entryPath: resolvePackagePath(packageDir, manifest.entry),
    entry,
    canvas,
    placementRules,
    componentTypes,
    layouts,
    regions,
    pages,
    assets,
    mediaPaths: {
      thumbnail: resolvePackagePath(packageDir, manifest.media.thumbnail),
      preview: resolvePackagePath(packageDir, manifest.media.preview),
      gallery: (manifest.media.gallery ?? []).map((item) =>
        resolvePackagePath(packageDir, item),
      ),
    },
    loadedAt: new Date().toISOString(),
  };
}

export function manifestFileName(): string {
  return WB_TEMPLATE_MANIFEST_FILENAME;
}

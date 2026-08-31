import { readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildSiteImagesRequireModule,
  createSiteImageDepsFromFiles,
  type SiteImageDeps,
} from "@/lib/website/theme-preview/preview-stubs";
import type { ComponentType, ReactNode } from "react";
import { createRequire } from "node:module";
import ts from "typescript";
import { optimizeImageUrl } from "@/lib/ai-core/image-engine/optimize";
import { getProfessionalScaffoldByPath } from "@/lib/ai-core/components/scaffolds";

const nodeRequire = createRequire(import.meta.url);
const workspaceRoot = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "..",
  "..",
);

type ReactModule = typeof import("react");
type RenderToStaticMarkup = typeof import("react-dom/server").renderToStaticMarkup;

let previewReact: ReactModule | null = null;
let previewRenderToStaticMarkup: RenderToStaticMarkup | null = null;

function getPreviewReactRuntime(): {
  React: ReactModule;
  renderToStaticMarkup: RenderToStaticMarkup;
} {
  if (!previewReact || !previewRenderToStaticMarkup) {
    previewReact = nodeRequire("next/dist/compiled/react") as ReactModule;
    previewRenderToStaticMarkup = (
      nodeRequire(
        "next/dist/compiled/react-dom/cjs/react-dom-server-legacy.node.development.js",
      ) as { renderToStaticMarkup: RenderToStaticMarkup }
    ).renderToStaticMarkup;
  }
  return { React: previewReact, renderToStaticMarkup: previewRenderToStaticMarkup };
}

export type ProjectFileRef = { path: string; content: string };

type BaseDeps = SiteImageDeps & {
  Motion: ComponentType<Record<string, unknown>>;
};

const compiledCache = new Map<string, ComponentType<Record<string, unknown>>>();
const compiledValueCache = new Map<string, unknown>();

function normalizePath(filePath: string): string {
  return filePath.replaceAll("\\", "/");
}

function aliasToProjectPath(importPath: string): string {
  return normalizePath(importPath.replace(/^@\//, ""));
}

function isReadableFile(abs: string): boolean {
  try {
    return statSync(abs).isFile();
  } catch {
    return false;
  }
}

function readWorkspaceFile(relativePath: string): ProjectFileRef | null {
  const normalized = normalizePath(relativePath);
  const abs = join(workspaceRoot, normalized);
  if (!isReadableFile(abs)) return null;
  return { path: normalized, content: readFileSync(abs, "utf8") };
}

function findProjectFile(
  files: ProjectFileRef[],
  importPath: string,
): ProjectFileRef | null {
  const base = aliasToProjectPath(importPath);
  const candidates = [
    base,
    `${base}.tsx`,
    `${base}.ts`,
    `${base}/index.tsx`,
    `${base}/index.ts`,
  ];
  for (const candidate of candidates) {
    const match = files.find((f) => normalizePath(f.path) === candidate);
    if (match?.content?.trim()) return match;
  }
  for (const candidate of candidates) {
    const fromDisk = readWorkspaceFile(candidate);
    if (fromDisk?.content?.trim()) return fromDisk;
  }
  for (const candidate of candidates) {
    const scaffold = getProfessionalScaffoldByPath(candidate);
    if (scaffold?.trim()) {
      return { path: candidate, content: scaffold };
    }
  }
  return null;
}

function resolveReexportSource(
  source: string,
  exportName: string,
  files: ProjectFileRef[],
): ProjectFileRef | null {
  const re =
    new RegExp(
      `export\\s+\\{[^}]*\\b${exportName}\\b[^}]*\\}\\s+from\\s+["']([^"']+)["']`,
    );
  const match = source.match(re);
  if (!match?.[1]) return null;
  return findProjectFile(files, match[1]);
}

function resolveExportModule(
  file: ProjectFileRef,
  exportName: string,
  files: ProjectFileRef[],
  seen = new Set<string>(),
): ProjectFileRef {
  const visitKey = `${normalizePath(file.path)}::${exportName}`;
  if (seen.has(visitKey)) return file;
  seen.add(visitKey);

  if (isComponentExport(file.content, exportName)) return file;
  const reexported = resolveReexportSource(file.content, exportName, files);
  if (reexported) {
    return resolveExportModule(reexported, exportName, files, seen);
  }
  return file;
}

function isComponentExport(source: string, exportName: string): boolean {
  if (
    new RegExp(`export\\s+function\\s+${exportName}\\b`).test(source) ||
    new RegExp(`export\\s+default\\s+function\\s+${exportName}\\b`).test(source)
  ) {
    return true;
  }
  if (
    new RegExp(`export\\s+const\\s+${exportName}\\s*=\\s*\\(`).test(source) ||
    new RegExp(`export\\s+const\\s+${exportName}\\s*=\\s*function`).test(source)
  ) {
    return true;
  }
  return false;
}

function parseNamedImports(
  source: string,
): Array<{ names: string[]; from: string }> {
  const results: Array<{ names: string[]; from: string }> = [];
  const re = /^import\s+\{([^}]+)\}\s+from\s+["']([^"']+)["'];?\s*$/gm;
  for (const match of source.matchAll(re)) {
    const names = match[1]
      .split(",")
      .map((part) => {
        const trimmed = part.trim();
        if (!trimmed) return "";
        if (/^type\s+/.test(trimmed)) return "";
        const alias = trimmed.split(/\s+as\s+/);
        return (alias[alias.length - 1] ?? trimmed).trim();
      })
      .filter(Boolean);
    if (names.length) {
      results.push({ names, from: match[2] });
    }
  }
  return results;
}

function resolveDefaultExportName(source: string): string {
  const fn = source.match(/export\s+default\s+function\s+(\w+)/);
  if (fn?.[1]) return fn[1];
  const ident = source.match(/export\s+default\s+(\w+)\s*;/);
  if (ident?.[1]) return ident[1];
  return "DefaultExport";
}

function preprocessScaffoldSource(source: string): string {
  return source
    .replace(/^"use client";\s*/m, "")
    .replace(/^import\s+type\s+.*?;?\s*$/gm, "")
    .replace(/^import\s+.*?from\s+["']next[^"']*["'];?\s*$/gm, "")
    .replace(/^export\s+const\s+metadata\s*=[\s\S]*?;\s*$/m, "")
    .replace(
      /^import\s+\{([^}]+)\}\s+from\s+["']react["'];?\s*$/gm,
      (_, imports: string) => `const { ${imports} } = React;`,
    )
    .replace(
      /^import\s+\{[\s\S]*?\}\s+from\s+["'][^"']+["'];?\s*$/gm,
      "",
    )
    .replace(/^import\s+.*?from\s+["'][^"']+["'];?\s*$/gm, "")
    .replace(/^\s*\/\/ eslint-disable.*$/gm, "");
}

function siteImageDepsRecord(base: BaseDeps): Record<string, unknown> {
  return {
    Motion: base.Motion,
    HERO_IMAGE: base.HERO_IMAGE,
    PRODUCT_IMAGE: base.PRODUCT_IMAGE,
    SERVICE_IMAGE: base.SERVICE_IMAGE,
    BACKGROUND_IMAGE: base.BACKGROUND_IMAGE,
    GALLERY_IMAGES: base.GALLERY_IMAGES,
    SECTION_IMAGES: base.SECTION_IMAGES,
    TESTIMONIAL_IMAGES: base.TESTIMONIAL_IMAGES,
    resolveSiteImage: base.resolveSiteImage,
    resolveSlotImage: base.resolveSlotImage,
    slotImages: base.slotImages,
  };
}

function siteImageCacheKey(deps: Record<string, unknown>): string {
  const gallery = Array.isArray(deps.GALLERY_IMAGES)
    ? (deps.GALLERY_IMAGES as string[]).join("|")
    : "";
  const sections = Array.isArray(deps.SECTION_IMAGES)
    ? (deps.SECTION_IMAGES as string[]).join("|")
    : "";
  return [
    (deps.HERO_IMAGE as string | null | undefined) ?? "",
    gallery,
    sections,
  ].join("::");
}

function createPreviewRequire(
  React: ReactModule,
  siteImagesModule: Record<string, unknown>,
): (id: string) => unknown {
  return (id: string) => {
    if (id === "react" || id === "react/jsx-runtime") return React;
    if (id === "@/lib/site-images") return siteImagesModule;
    if (id === "@/lib/ai-core/image-engine/optimize") {
      return { optimizeImageUrl };
    }
    throw new Error(`V2 preview: unsupported require("${id}")`);
  };
}

function stripExportKeywordsForPreview(transpiled: string): string {
  return transpiled
    .replace(/\bexport\s+default\s+async\s+function\s+/g, "async function ")
    .replace(/\bexport\s+default\s+function\s+/g, "function ")
    .replace(/\bexport\s+default\s+class\s+/g, "class ")
    .replace(/\bexport\s+async\s+function\s+/g, "async function ")
    .replace(/\bexport\s+function\s+/g, "function ")
    .replace(/\bexport\s+class\s+/g, "class ")
    .replace(/\bexport\s+const\s+/g, "const ")
    .replace(/\bexport\s+let\s+/g, "let ")
    .replace(/\bexport\s+var\s+/g, "var ")
    .replace(/\bexport\s+default\s+/g, "__v2_default = ")
    // Pure re-export lines are resolved via resolveExportModule before compile.
    .replace(/^\s*export\s+type\s+[^;]+;?\s*$/gm, "")
    .replace(/^\s*export\s+\{[^}]*\}\s+from\s+["'][^"']+["'];?\s*$/gm, "")
    .replace(/^\s*export\s+\{[^}]*\}\s*;?\s*$/gm, "");
}

/**
 * Evaluate a component/module in Preview.
 *
 * Next.js keeps local helpers (e.g. resolveLinks) in module scope. The old
 * CommonJS + `exports.X = X` path could leave imported/local bindings missing
 * inside `new Function`. ESNext emit + explicit return keeps helpers and the
 * exported symbol in one lexical scope — same runtime behavior as the app.
 */
function compileModuleExport(
  source: string,
  exportName: string,
  deps: Record<string, unknown>,
  previewRequire: (id: string) => unknown,
): unknown {
  const depKeys = Object.keys(deps).sort();
  const cacheKey = `export::${exportName}::${source.length}::${source.slice(0, 80)}::${depKeys.join(",")}::${siteImageCacheKey(deps)}`;
  const cached = compiledValueCache.get(cacheKey);
  if (cached !== undefined) return cached;

  for (const { names, from } of parseNamedImports(source)) {
    if (from === "react" || from.startsWith("next") || from === "@/lib/site-images") {
      continue;
    }
    for (const name of names) {
      if (!(name in deps)) {
        throw new Error(
          `V2 preview: missing binding "${name}" from "${from}" while compiling "${exportName}"`,
        );
      }
    }
  }

  const cleaned = preprocessScaffoldSource(source);
  const transpiled = ts.transpileModule(cleaned, {
    compilerOptions: {
      jsx: ts.JsxEmit.React,
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.ESNext,
    },
  }).outputText;

  const body = stripExportKeywordsForPreview(transpiled);
  const { React } = getPreviewReactRuntime();
  const argNames = ["require", "React", ...depKeys];
  const runner = new Function(
    ...argNames,
    `"use strict";
let __v2_default;
${body}
const __v2_export = typeof ${exportName} !== "undefined" ? ${exportName} : __v2_default;
return { "${exportName}": __v2_export, default: __v2_default ?? __v2_export };`,
  ) as (
    requireFn: (id: string) => unknown,
    react: typeof React,
    ...rest: unknown[]
  ) => Record<string, unknown>;

  let result: Record<string, unknown>;
  try {
    result = runner(
      previewRequire,
      React,
      ...depKeys.map((key) => deps[key]),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      `V2 preview: runtime error compiling "${exportName}": ${message}`,
    );
  }

  const value = result[exportName] ?? result.default;
  if (value === undefined) {
    throw new Error(`V2 preview: export "${exportName}" was not compiled`);
  }

  compiledValueCache.set(cacheKey, value);
  return value;
}

function compileSource(
  source: string,
  exportName: string,
  deps: Record<string, unknown>,
  previewRequire: (id: string) => unknown,
): ComponentType<Record<string, unknown>> {
  const value = compileModuleExport(source, exportName, deps, previewRequire);
  if (typeof value !== "function") {
    throw new Error(`V2 preview: export "${exportName}" is not a component`);
  }

  const depKeys = Object.keys(deps).sort();
  const cacheKey = `component::${exportName}::${source.length}::${source.slice(0, 80)}::${depKeys.join(",")}`;
  const cached = compiledCache.get(cacheKey);
  if (cached) return cached;

  compiledCache.set(cacheKey, value as ComponentType<Record<string, unknown>>);
  return value as ComponentType<Record<string, unknown>>;
}

function compileMotion(
  files: ProjectFileRef[],
  base: BaseDeps,
  previewRequire: (id: string) => unknown,
): ComponentType<Record<string, unknown>> {
  const motionFile = findProjectFile(files, "@/components/ui/motion");
  if (!motionFile) {
    return base.Motion;
  }
  return compileSource(motionFile.content, "Motion", {}, previewRequire);
}

function compileModuleValue(
  file: ProjectFileRef,
  exportName: string,
  files: ProjectFileRef[],
  base: BaseDeps,
  extraDeps: Record<string, ComponentType<Record<string, unknown>>>,
  previewRequire: (id: string) => unknown,
  compiling = new Set<string>(),
): unknown {
  const fileKey = normalizePath(file.path);
  const compileKey = `value::${fileKey}::${exportName}`;
  const cached = compiledValueCache.get(compileKey);
  if (cached !== undefined) return cached;
  if (compiling.has(compileKey)) {
    throw new Error(`V2 preview: circular value export "${exportName}" in ${fileKey}`);
  }
  compiling.add(compileKey);

  const moduleDeps: Record<string, unknown> = {
    ...siteImageDepsRecord(base),
    ...extraDeps,
  };

  try {
    for (const { names, from } of parseNamedImports(file.content)) {
      if (from === "react" || from.startsWith("next")) continue;
      if (from === "@/lib/site-images") continue;

      const depFile = findProjectFile(files, from);
      if (!depFile) {
        throw new Error(
          `V2 preview: cannot resolve "${from}" (needed for ${names.join(", ")}) in ${fileKey}`,
        );
      }

      for (const name of names) {
        if (moduleDeps[name]) continue;
        if (from === "@/components/ui/motion" && name === "Motion") {
          moduleDeps.Motion = base.Motion;
          continue;
        }
        const resolved = resolveExportModule(depFile, name, files);
        if (isComponentExport(resolved.content, name)) {
          moduleDeps[name] = compileProjectModule(
            resolved,
            name,
            files,
            base,
            extraDeps,
            previewRequire,
            compiling,
          );
        } else {
          moduleDeps[name] = compileModuleValue(
            resolved,
            name,
            files,
            base,
            extraDeps,
            previewRequire,
            compiling,
          );
        }
      }
    }

    const value = compileModuleExport(
      file.content,
      exportName,
      moduleDeps,
      previewRequire,
    );
    compiledValueCache.set(compileKey, value);
    return value;
  } finally {
    compiling.delete(compileKey);
  }
}

function compileProjectModule(
  file: ProjectFileRef,
  exportName: string,
  files: ProjectFileRef[],
  base: BaseDeps,
  extraDeps: Record<string, ComponentType<Record<string, unknown>>>,
  previewRequire: (id: string) => unknown,
  compiling = new Set<string>(),
): ComponentType<Record<string, unknown>> {
  const fileKey = normalizePath(file.path);
  const compileKey = `file::${fileKey}::${exportName}`;
  const cached = compiledCache.get(compileKey);
  if (cached) return cached;
  if (compiling.has(compileKey)) {
    throw new Error(`V2 preview: circular component export "${exportName}" in ${fileKey}`);
  }
  compiling.add(compileKey);

  const moduleDeps: Record<string, unknown> = {
    ...siteImageDepsRecord(base),
    ...extraDeps,
  };

  try {
    for (const { names, from } of parseNamedImports(file.content)) {
      if (from === "react" || from.startsWith("next")) continue;
      if (from === "@/lib/site-images") continue;

      const depFile = findProjectFile(files, from);
      if (!depFile) {
        throw new Error(
          `V2 preview: cannot resolve "${from}" (needed for ${names.join(", ")}) in ${fileKey}`,
        );
      }

      for (const name of names) {
        if (moduleDeps[name]) continue;
        if (from === "@/components/ui/motion" && name === "Motion") {
          moduleDeps.Motion = base.Motion;
          continue;
        }
        const resolved = resolveExportModule(depFile, name, files);
        if (isComponentExport(resolved.content, name)) {
          moduleDeps[name] = compileProjectModule(
            resolved,
            name,
            files,
            base,
            extraDeps,
            previewRequire,
            compiling,
          );
        } else {
          moduleDeps[name] = compileModuleValue(
            resolved,
            name,
            files,
            base,
            extraDeps,
            previewRequire,
            compiling,
          );
        }
      }
    }

    const component = compileSource(
      file.content,
      exportName,
      moduleDeps,
      previewRequire,
    );
    compiledCache.set(compileKey, component);
    return component;
  } finally {
    compiling.delete(compileKey);
  }
}

export function renderV2PageMarkup(
  files: ProjectFileRef[],
  heroImageUrl?: string | null,
): string {
  const pageFile = files.find((f) => normalizePath(f.path) === "app/page.tsx");
  if (!pageFile?.content?.trim()) {
    throw new Error("V2 preview requires app/page.tsx in project.files");
  }

  try {
    const images = createSiteImageDepsFromFiles(files, heroImageUrl);
    const siteImagesModule = buildSiteImagesRequireModule(images);
    const { React, renderToStaticMarkup } = getPreviewReactRuntime();
    const previewRequire = createPreviewRequire(React, siteImagesModule);
    const motionStub: ComponentType<Record<string, unknown>> = ({ children, className }) =>
      React.createElement("div", { className: className as string }, children as ReactNode);

    const base: BaseDeps = {
      Motion: motionStub,
      ...images,
    };
    base.Motion = compileMotion(files, base, previewRequire);

    const pageDeps: Record<string, ComponentType<Record<string, unknown>>> = {};
    const pageValueDeps: Record<string, unknown> = {};
    for (const { names, from } of parseNamedImports(pageFile.content)) {
      if (from === "react" || from.startsWith("next") || from === "@/lib/site-images") {
        continue;
      }
      const depFile = findProjectFile(files, from);
      if (!depFile) {
        throw new Error(
          `V2 preview: cannot resolve "${from}" (needed for ${names.join(", ")}) in app/page.tsx`,
        );
      }
      for (const name of names) {
        const resolved = resolveExportModule(depFile, name, files);
        if (isComponentExport(resolved.content, name)) {
          pageDeps[name] = compileProjectModule(
            resolved,
            name,
            files,
            base,
            pageDeps,
            previewRequire,
          );
        } else {
          pageValueDeps[name] = compileModuleValue(
            resolved,
            name,
            files,
            base,
            pageDeps,
            previewRequire,
          );
        }
      }
    }

    const pageExport = resolveDefaultExportName(pageFile.content);
    const pageDepsRecord: Record<string, unknown> = {
      ...siteImageDepsRecord(base),
      ...pageDeps,
      ...pageValueDeps,
    };

    const Page = compileSource(
      pageFile.content,
      pageExport,
      pageDepsRecord,
      previewRequire,
    );
    return renderToStaticMarkup(React.createElement(Page, {}));
  } finally {
    // Release transpiled component closures after each preview — caches are per-request only.
    compiledCache.clear();
    compiledValueCache.clear();
  }
}

export function extractV2PackageIdFromPage(pageSource: string): string | null {
  const match = pageSource.match(/data-v2-package=(?:"([^"]+)"|'([^']+)')/);
  return match?.[1] || match?.[2] || null;
}

export function extractV2LayoutFromPage(pageSource: string): string | null {
  const match = pageSource.match(/data-v2-layout=(?:"([^"]+)"|'([^']+)')/);
  return match?.[1] || match?.[2] || null;
}

/** @internal test helper */
export function clearV2PreviewCompilerCache(): void {
  compiledCache.clear();
  compiledValueCache.clear();
}

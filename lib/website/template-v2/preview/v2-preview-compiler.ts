import { readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createSiteImageDepsFromFiles, type SiteImageDeps } from "@/lib/website/theme-preview/preview-stubs";
import {
  resolveSlotImage as canonicalResolveSlotImage,
  slotImages as canonicalSlotImages,
} from "@/lib/site-images";
import type { ComponentType, ReactNode } from "react";
import { createRequire } from "node:module";
import ts from "typescript";

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
): ProjectFileRef {
  if (isComponentExport(file.content, exportName)) return file;
  const reexported = resolveReexportSource(file.content, exportName, files);
  if (reexported) {
    return resolveExportModule(reexported, exportName, files);
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
    resolveSlotImage: base.resolveSlotImage ?? canonicalResolveSlotImage,
    slotImages: base.slotImages ?? canonicalSlotImages,
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

function createPreviewRequire(React: ReactModule): (id: string) => unknown {
  return (id: string) => {
    if (id === "react" || id === "react/jsx-runtime") return React;
    throw new Error(`V2 preview: unsupported require("${id}")`);
  };
}

function compileModuleExport(
  source: string,
  exportName: string,
  deps: Record<string, unknown>,
): unknown {
  const depKeys = Object.keys(deps).sort();
  const cacheKey = `export::${exportName}::${source.length}::${source.slice(0, 80)}::${depKeys.join(",")}::${siteImageCacheKey(deps)}`;
  const cached = compiledValueCache.get(cacheKey);
  if (cached !== undefined) return cached;

  const cleaned = preprocessScaffoldSource(source);
  const transpiled = ts.transpileModule(cleaned, {
    compilerOptions: {
      jsx: ts.JsxEmit.React,
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.CommonJS,
    },
  }).outputText;

  const exports: Record<string, unknown> = {};
  const { React } = getPreviewReactRuntime();
  const previewRequire = createPreviewRequire(React);
  const argNames = ["exports", "require", "React", ...depKeys];
  const runner = new Function(...argNames, transpiled) as (
    exports: Record<string, unknown>,
    requireFn: (id: string) => unknown,
    react: typeof React,
    ...rest: unknown[]
  ) => void;

  runner(exports, previewRequire, React, ...depKeys.map((key) => deps[key]));

  const value = exports[exportName] ?? exports.default;
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
): ComponentType<Record<string, unknown>> {
  const value = compileModuleExport(source, exportName, deps);
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
): ComponentType<Record<string, unknown>> {
  const motionFile = findProjectFile(files, "@/components/ui/motion");
  if (!motionFile) {
    return base.Motion;
  }
  return compileSource(motionFile.content, "Motion", {});
}

function compileModuleValue(
  file: ProjectFileRef,
  exportName: string,
  files: ProjectFileRef[],
  base: BaseDeps,
  extraDeps: Record<string, ComponentType<Record<string, unknown>>>,
): unknown {
  const fileKey = normalizePath(file.path);
  const cached = compiledValueCache.get(`value::${fileKey}::${exportName}`);
  if (cached !== undefined) return cached;

  const moduleDeps: Record<string, unknown> = {
    ...siteImageDepsRecord(base),
    ...extraDeps,
  };

  for (const { names, from } of parseNamedImports(file.content)) {
    if (from === "react" || from.startsWith("next")) continue;
    if (from === "@/lib/site-images") continue;

    const depFile = findProjectFile(files, from);
    if (!depFile) continue;

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
        );
      } else {
        moduleDeps[name] = compileModuleValue(
          resolved,
          name,
          files,
          base,
          extraDeps,
        );
      }
    }
  }

  const value = compileModuleExport(file.content, exportName, moduleDeps);
  compiledValueCache.set(`value::${fileKey}::${exportName}`, value);
  return value;
}

function compileProjectModule(
  file: ProjectFileRef,
  exportName: string,
  files: ProjectFileRef[],
  base: BaseDeps,
  extraDeps: Record<string, ComponentType<Record<string, unknown>>>,
): ComponentType<Record<string, unknown>> {
  const fileKey = normalizePath(file.path);
  const cached = compiledCache.get(`file::${fileKey}::${exportName}`);
  if (cached) return cached;

  const moduleDeps: Record<string, unknown> = {
    ...siteImageDepsRecord(base),
    ...extraDeps,
  };

  for (const { names, from } of parseNamedImports(file.content)) {
    if (from === "react" || from.startsWith("next")) continue;
    if (from === "@/lib/site-images") continue;

    const depFile = findProjectFile(files, from);
    if (!depFile) continue;

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
        );
      } else {
        moduleDeps[name] = compileModuleValue(
          resolved,
          name,
          files,
          base,
          extraDeps,
        );
      }
    }
  }

  const component = compileSource(file.content, exportName, moduleDeps);
  compiledCache.set(`file::${fileKey}::${exportName}`, component);
  return component;
}

export function renderV2PageMarkup(
  files: ProjectFileRef[],
  heroImageUrl?: string | null,
): string {
  const pageFile = files.find((f) => normalizePath(f.path) === "app/page.tsx");
  if (!pageFile?.content?.trim()) {
    throw new Error("V2 preview requires app/page.tsx in project.files");
  }

  const images = createSiteImageDepsFromFiles(files, heroImageUrl);
  const { React, renderToStaticMarkup } = getPreviewReactRuntime();
  const motionStub: ComponentType<Record<string, unknown>> = ({ children, className }) =>
    React.createElement("div", { className: className as string }, children as ReactNode);

  const base: BaseDeps = {
    Motion: motionStub,
    ...images,
  };
  base.Motion = compileMotion(files, base);

  const pageDeps: Record<string, ComponentType<Record<string, unknown>>> = {};
  const pageValueDeps: Record<string, unknown> = {};
  for (const { names, from } of parseNamedImports(pageFile.content)) {
    if (from === "react" || from.startsWith("next") || from === "@/lib/site-images") {
      continue;
    }
    const depFile = findProjectFile(files, from);
    if (!depFile) continue;
    for (const name of names) {
      const resolved = resolveExportModule(depFile, name, files);
      if (isComponentExport(resolved.content, name)) {
        pageDeps[name] = compileProjectModule(resolved, name, files, base, pageDeps);
      } else {
        pageValueDeps[name] = compileModuleValue(resolved, name, files, base, pageDeps);
      }
    }
  }

  const pageExport = resolveDefaultExportName(pageFile.content);
  const pageDepsRecord: Record<string, unknown> = {
    ...siteImageDepsRecord(base),
    ...pageDeps,
    ...pageValueDeps,
  };

  const Page = compileSource(pageFile.content, pageExport, pageDepsRecord);
  return renderToStaticMarkup(React.createElement(Page, {}));
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

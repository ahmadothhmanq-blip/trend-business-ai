import { resolveThemeSectionShellSource } from "@/lib/ai-core/components/scaffolds/themes/shells";
import { getThemeScaffoldById } from "@/lib/ai-core/components/scaffolds/themes";
import { getRendererComponent } from "@/lib/ai-core/design-renderer/components";
import type { WebsiteThemePresetId } from "@/lib/website/builder/theme-catalog";
import {
  createMotionStub,
  createSiteImageDepsFromFiles,
} from "@/lib/website/theme-preview/preview-stubs";
import type { ThemePreviewContent } from "@/lib/website/theme-preview/types";
import type { ComponentType } from "react";
import { createRequire } from "node:module";
import ts from "typescript";

const nodeRequire = createRequire(import.meta.url);

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

type CompiledComponent = ComponentType<Record<string, unknown>>;

type RuntimeDeps = {
  SectionShell: CompiledComponent;
  Motion: CompiledComponent;
  HERO_IMAGE: string | null;
  resolveSiteImage: (primary: string | null | undefined, index: number) => string | null;
  GALLERY_IMAGES: string[];
  SECTION_IMAGES: string[];
};

const componentCache = new Map<string, CompiledComponent>();
const sectionShellCache = new Map<WebsiteThemePresetId, CompiledComponent>();

function preprocessScaffoldSource(source: string): string {
  return source
    .replace(/^"use client";\s*/m, "")
    .replace(/^import\s+type\s+.*?;?\s*$/gm, "")
    .replace(
      /^import\s+\{([^}]+)\}\s+from\s+["']react["'];?\s*$/gm,
      (_, imports: string) => `const { ${imports} } = React;`,
    )
    .replace(/^import\s+.*?from\s+["'][^"']+["'];?\s*$/gm, "")
    .replace(/^\s*\/\/ eslint-disable.*$/gm, "");
}

function siteImageCacheKey(deps: RuntimeDeps): string {
  return [
    deps.HERO_IMAGE ?? "",
    deps.GALLERY_IMAGES.join("|"),
    deps.SECTION_IMAGES.join("|"),
  ].join("::");
}

function compileScaffoldSource(
  source: string,
  exportName: string,
  deps: RuntimeDeps,
): CompiledComponent {
  const cacheKey = `${exportName}::${source.length}::${source.slice(0, 64)}::${siteImageCacheKey(deps)}`;
  const cached = componentCache.get(cacheKey);
  if (cached) return cached;

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
  const runner = new Function(
    "exports",
    "React",
    "SectionShell",
    "Motion",
    "HERO_IMAGE",
    "resolveSiteImage",
    "GALLERY_IMAGES",
    "SECTION_IMAGES",
    transpiled,
  ) as (
    exports: Record<string, unknown>,
    react: typeof React,
    sectionShell: CompiledComponent,
    motion: CompiledComponent,
    heroImage: string | null,
    resolveSiteImage: RuntimeDeps["resolveSiteImage"],
    galleryImages: string[],
    sectionImages: string[],
  ) => void;

  runner(
    exports,
    React,
    deps.SectionShell,
    deps.Motion,
    deps.HERO_IMAGE,
    deps.resolveSiteImage,
    deps.GALLERY_IMAGES,
    deps.SECTION_IMAGES,
  );

  const component = exports[exportName];
  if (typeof component !== "function") {
    throw new Error(`Scaffold export "${exportName}" was not compiled`);
  }

  componentCache.set(cacheKey, component as CompiledComponent);
  return component as CompiledComponent;
}

function getSectionShellComponent(themeId: WebsiteThemePresetId): CompiledComponent {
  const cached = sectionShellCache.get(themeId);
  if (cached) return cached;

  const source = resolveThemeSectionShellSource(themeId);
  const images = createSiteImageDepsFromFiles(undefined, null);
  const deps: RuntimeDeps = {
    SectionShell: createMotionStub() as CompiledComponent,
    Motion: createMotionStub() as CompiledComponent,
    ...images,
  };
  const component = compileScaffoldSource(source, "SectionShell", deps);
  sectionShellCache.set(themeId, component);
  return component;
}

function createRuntimeDeps(
  themeId: WebsiteThemePresetId,
  heroImageUrl: string | null | undefined,
  files?: Array<{ path: string; content: string }>,
): RuntimeDeps {
  const images = createSiteImageDepsFromFiles(files, heroImageUrl);
  return {
    SectionShell: getSectionShellComponent(themeId),
    Motion: createMotionStub() as CompiledComponent,
    ...images,
  };
}

function resolveScaffoldSource(
  componentId: string,
  files?: Array<{ path: string; content: string }>,
): string | null {
  const spec = getRendererComponent(componentId as never);
  if (files?.length && spec?.path) {
    const normalized = spec.path.replaceAll("\\", "/");
    const match = files.find(
      (file) => file.path.replaceAll("\\", "/") === normalized,
    );
    if (match?.content?.trim()) return match.content;
  }
  return getThemeScaffoldById(componentId);
}

export function renderThemeScaffoldMarkup(
  componentId: string,
  themeId: WebsiteThemePresetId,
  props: Record<string, unknown>,
  content: ThemePreviewContent,
  files?: Array<{ path: string; content: string }>,
): string {
  const source = resolveScaffoldSource(componentId, files);
  if (!source) return "";

  const spec = getRendererComponent(componentId as never);
  const exportName = spec?.exportName || componentId;
  const deps = createRuntimeDeps(themeId, content.heroImageUrl, files);
  const { React, renderToStaticMarkup } = getPreviewReactRuntime();
  const Component = compileScaffoldSource(source, exportName, deps);
  const html = renderToStaticMarkup(React.createElement(Component, props));
  return `<div data-component="${componentId}" data-theme-scaffold="true">${html}</div>`;
}

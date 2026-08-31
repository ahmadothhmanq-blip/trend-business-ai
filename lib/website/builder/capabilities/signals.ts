import type { GeneratedProjectFile } from "@/lib/ai/types";
import type { GeneratedWebsiteProject } from "@/lib/website/types/generation";
import { readPersistedBlueprint } from "@/lib/website/template-v2/integration/production-pipeline";
import { isStructureFirstEnabled } from "@/lib/website/generation-flags";
import {
  mapSectionNameToKind,
} from "@/lib/website/template-v2/integration/strategy-section-order";
import type { ProjectAnalysisSignals } from "@/lib/website/builder/capabilities/types";
import type { SectionKind } from "@/lib/website/template-v2/variants/types";

const ROUTE_PAGE_PATTERN = /^app\/(.+\/)?page\.(tsx|jsx|js|ts)$/;

function normalizePath(path: string): string {
  return path.replace(/\\/g, "/").replace(/^\.\//, "");
}

function routeFromPagePath(filePath: string): string | null {
  const normalized = normalizePath(filePath);
  const match = normalized.match(ROUTE_PAGE_PATTERN);
  if (!match) return null;
  const segments = match[1]?.replace(/\/$/, "") ?? "";
  if (!segments) return "/";
  return `/${segments.replace(/\/page$/, "")}`;
}

function parseDependencies(files: GeneratedProjectFile[]): string[] {
  const pkg = files.find((f) => normalizePath(f.path) === "package.json");
  if (!pkg?.content) return [];
  try {
    const parsed = JSON.parse(pkg.content) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    return [
      ...Object.keys(parsed.dependencies ?? {}),
      ...Object.keys(parsed.devDependencies ?? {}),
    ].map((name) => name.toLowerCase());
  } catch {
    return [];
  }
}

function collectSearchHaystack(signals: Omit<ProjectAnalysisSignals, "project">): string {
  return [
    ...signals.filePaths,
    ...signals.routes,
    ...signals.componentIds,
    ...signals.sectionLabels,
    ...signals.pages,
    ...signals.contentBlocks,
    signals.strategy?.sectionPlan.map((s) => `${s.name} ${s.goal} ${s.contentNotes}`).join("\n") ?? "",
    signals.strategy?.pages.map((p) => `${p.name} ${p.path} ${p.purpose}`).join("\n") ?? "",
    signals.strategy?.sitemap.join("\n") ?? "",
    signals.blueprint?.sectionOrder.join("\n") ?? "",
  ]
    .join("\n")
    .toLowerCase();
}

/** Build a normalized, read-only signal snapshot from a generated project. */
export function extractProjectSignals(
  project: GeneratedWebsiteProject,
  files?: GeneratedProjectFile[],
): ProjectAnalysisSignals {
  const fileList = files ?? project.files ?? [];
  const filePaths = fileList.map((f) => normalizePath(f.path));
  const routes = [
    ...new Set(
      filePaths
        .map((path) => routeFromPagePath(path))
        .filter((route): route is string => Boolean(route)),
    ),
  ];

  const settings = (project.settings ?? {}) as Record<string, unknown>;
  const componentIds = [
    ...new Set([
      ...(project.components ?? []),
      ...(project.sections ?? []),
    ]),
  ];
  const sectionLabels = project.sections ?? [];

  return {
    project,
    files: fileList,
    filePaths,
    routes,
    componentIds,
    sectionLabels,
    dependencies: parseDependencies(fileList),
    settings,
    strategy: project.strategy,
    blueprint: readPersistedBlueprint(project),
    pages: project.pages ?? [],
    contentBlocks: project.content ?? [],
    hasSeoPackage: Boolean(project.seoPackage),
    language: typeof settings.language === "string" ? settings.language : undefined,
  };
}

export function projectSignalsHaystack(
  signals: ProjectAnalysisSignals,
): string {
  return collectSearchHaystack(signals);
}

export function includesAny(haystack: string, needles: string[]): boolean {
  return needles.some((needle) => haystack.includes(needle.toLowerCase()));
}

export function matchesPattern(haystack: string, pattern: RegExp): boolean {
  return pattern.test(haystack);
}

export function pathMatchesAny(paths: string[], patterns: RegExp[]): boolean {
  return paths.some((path) => patterns.some((pattern) => pattern.test(path)));
}

export function routeMatchesAny(routes: string[], fragments: string[]): boolean {
  const normalized = routes.map((r) => r.toLowerCase());
  return fragments.some((fragment) =>
    normalized.some((route) => route.includes(fragment.toLowerCase())),
  );
}

export function componentMatchesAny(
  componentIds: string[],
  fragments: string[],
): boolean {
  const haystack = componentIds.join(" ").toLowerCase();
  return fragments.some((fragment) => haystack.includes(fragment.toLowerCase()));
}

export function strategySectionMatches(
  signals: ProjectAnalysisSignals,
  pattern: RegExp,
): boolean {
  return (
    signals.strategy?.sectionPlan.some((section) =>
      pattern.test(`${section.name} ${section.goal} ${section.contentNotes}`),
    ) ?? false
  );
}

export function blueprintIncludesSection(
  signals: ProjectAnalysisSignals,
  sectionKind: string,
): boolean {
  if (isStructureFirstEnabled()) {
    const kind = sectionKind as SectionKind;
    const fromStrategy =
      signals.strategy?.sectionPlan.some((section) => {
        const mapped = mapSectionNameToKind(section.name);
        return mapped === kind;
      }) ?? false;
    if (fromStrategy) return true;
    return strategySectionMatches(
      signals,
      new RegExp(sectionKind, "i"),
    );
  }
  return signals.blueprint?.sectionOrder.includes(sectionKind as never) ?? false;
}

export function settingTruthy(
  settings: Record<string, unknown>,
  key: string,
): boolean {
  const value = settings[key];
  if (value === true || value === 1) return true;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "true" || normalized === "1" || normalized === "yes";
  }
  return false;
}

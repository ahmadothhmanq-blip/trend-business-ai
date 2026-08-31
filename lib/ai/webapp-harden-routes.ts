import type { GeneratedProjectFile } from "@/lib/ai/types";
import { normalizePath } from "@/lib/ai/webapp-harden-shared";

export function appRouteFromPagePath(filePath: string): string | null {
  const path = normalizePath(filePath);
  if (!path.startsWith("app/")) return null;
  if (!/\/page\.(tsx|ts|jsx|js)$/.test(path) && !/^app\/page\.(tsx|ts|jsx|js)$/.test(path)) {
    return null;
  }

  const rel = path
    .replace(/^app\//, "")
    .replace(/\/page\.(tsx|ts|jsx|js)$/, "")
    .replace(/^page\.(tsx|ts|jsx|js)$/, "");

  const segments = rel
    .split("/")
    .filter((segment) => segment && !/^\(.*\)$/.test(segment) && !/^@/.test(segment));
  return `/${segments.join("/")}`;
}

export function routeCollisionKey(route: string): string {
  return route
    .replace(/\[\.\.\.[^\]]+\]/g, "[...]")
    .replace(/\[[^\]]+\]/g, "[]");
}

export function routeGroupCount(filePath: string): number {
  return (normalizePath(filePath).match(/\/\([^/]+\)/g) ?? []).length;
}

export function dynamicParamName(route: string): string {
  return (route.match(/\[(?:\.\.\.)?([^\]]+)\]/) ?? [])[1]?.toLowerCase() ?? "";
}

export function pageKeepScore(file: GeneratedProjectFile, route: string): number {
  const param = dynamicParamName(route);
  let score = file.content.length - routeGroupCount(file.path) * 1000;
  if (["resource", "id", "slug", "entity", "item"].includes(param)) score += 50_000;
  if (["mode", "action", "tab", "locale", "view"].includes(param)) score -= 50_000;
  return score;
}

export function dropConflictingApiRoutes(files: GeneratedProjectFile[]): GeneratedProjectFile[] {
  const paths = new Set(files.map((file) => normalizePath(file.path)));
  const drop = new Set<string>();

  for (const path of paths) {
    const match = path.match(
      /^app\/api\/(.+)\/\[\[\.\.\.([^\]]+)\]\]\/route\.(tsx|ts|jsx|js)$/,
    );
    if (!match) continue;

    const base = match[1];
    for (const ext of ["ts", "tsx", "js", "jsx"]) {
      const staticRoute = `app/api/${base}/route.${ext}`;
      if (paths.has(staticRoute)) {
        // Optional catch-all matches the collection URL — keep the catch-all handler.
        drop.add(staticRoute);
      }
    }
  }

  return files.filter((file) => !drop.has(normalizePath(file.path)));
}

export function findApiRouteConflictIssues(files: GeneratedProjectFile[]): string[] {
  const paths = new Set(files.map((file) => normalizePath(file.path)));
  const issues: string[] = [];

  for (const path of paths) {
    const match = path.match(
      /^app\/api\/(.+)\/\[\[\.\.\.([^\]]+)\]\]\/route\.(tsx|ts|jsx|js)$/,
    );
    if (!match) continue;

    const base = match[1];
    const param = match[2];
    for (const ext of ["ts", "tsx", "js", "jsx"]) {
      const staticRoute = `app/api/${base}/route.${ext}`;
      if (paths.has(staticRoute)) {
        issues.push(
          `${staticRoute}: optional catch-all app/api/${base}/[[...${param}]]/route.${ext} conflicts at /api/${base}.`,
        );
      }
    }
  }

  return issues;
}

export function dropConflictingUiModules(files: GeneratedProjectFile[]): GeneratedProjectFile[] {
  const hasBarrel = files.some((file) => {
    const path = normalizePath(file.path);
    return path === "components/ui.tsx" || path === "components/ui.ts";
  });
  const hasFolder = files.some((file) => /^components\/ui\//.test(normalizePath(file.path)));
  if (!hasBarrel || !hasFolder) return files;

  return files
    .filter((file) => !/^components\/ui\//.test(normalizePath(file.path)))
    .map((file) => ({
      ...file,
      content: file.content.replace(
        /from\s+(['"])@\/components\/ui\/[^'"]+\1/g,
        `from "@/components/ui"`,
      ),
    }));
}

export function dropConflictingAppPages(files: GeneratedProjectFile[]): GeneratedProjectFile[] {
  const pages = files
    .map((file) => ({ file, route: appRouteFromPagePath(file.path) }))
    .filter((entry): entry is { file: GeneratedProjectFile; route: string } =>
      Boolean(entry.route),
    );

  const drop = new Set<string>();
  const byRoute = new Map<string, Array<{ file: GeneratedProjectFile; route: string }>>();
  for (const entry of pages) {
    const key = routeCollisionKey(entry.route);
    const list = byRoute.get(key) ?? [];
    list.push(entry);
    byRoute.set(key, list);
  }

  for (const group of byRoute.values()) {
    if (group.length < 2) continue;
    const rootPage = group.find(
      (entry) => normalizePath(entry.file.path) === "app/page.tsx",
    );
    if (rootPage) {
      for (const entry of group) {
        if (normalizePath(entry.file.path) !== "app/page.tsx") {
          drop.add(entry.file.path);
        }
      }
      continue;
    }
    const ranked = [...group].sort((a, b) => {
      const scoreDelta = pageKeepScore(b.file, b.route) - pageKeepScore(a.file, a.route);
      if (scoreDelta !== 0) return scoreDelta;
      return a.file.path.localeCompare(b.file.path);
    });
    for (const extra of ranked.slice(1)) {
      drop.add(extra.file.path);
    }
  }

  let next = files.filter((file) => !drop.has(file.path));

  next = next.filter((file) => {
    const match = normalizePath(file.path).match(/^app\/(\([^/]+\))\/layout\.(tsx|ts|jsx|js)$/);
    if (!match) return true;
    const prefix = `app/${match[1]}/`;
    return next.some(
      (other) =>
        normalizePath(other.path).startsWith(prefix) &&
        normalizePath(other.path) !== normalizePath(file.path),
    );
  });

  return next;
}

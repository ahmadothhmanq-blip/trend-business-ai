/**
 * Pre-publish internal link validation.
 */

import type { GeneratedProjectFile } from "@/lib/ai/types";
import type {
  LinkValidationIssue,
  LinkValidationReport,
  SiteStructurePlan,
} from "@/lib/ai-core/website-management/types";

function collectRoutes(files: GeneratedProjectFile[]): Set<string> {
  const routes = new Set<string>(["/"]);
  for (const file of files) {
    const m = file.path.match(/^app\/(.+)\/page\.tsx$/);
    if (!m) continue;
    const seg = m[1]!;
    if (seg.includes("[")) {
      // dynamic — register parent
      const parent = "/" + seg.split("/[")[0]!.replace(/\/$/, "");
      routes.add(parent || "/");
      continue;
    }
    routes.add("/" + seg);
  }
  if (files.some((f) => f.path === "app/page.tsx")) routes.add("/");
  return routes;
}

function extractHrefs(content: string): string[] {
  const hrefs: string[] = [];
  const re = /href\s*[:=]\s*["']([^"']+)["']/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(content))) {
    hrefs.push(match[1]!);
  }
  return hrefs;
}

export function validateWebsiteLinks(params: {
  files: GeneratedProjectFile[];
  structure?: SiteStructurePlan | null;
}): LinkValidationReport {
  const routes = collectRoutes(params.files);
  const issues: LinkValidationIssue[] = [];
  let checked = 0;

  for (const file of params.files) {
    if (!/\.(tsx|ts|jsx|js|html)$/.test(file.path)) continue;
    for (const href of extractHrefs(file.content)) {
      checked += 1;
      if (
        href.startsWith("http") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("javascript:")
      ) {
        continue;
      }
      if (href.startsWith("#")) {
        // Hash-only nav is a warning when structure expects real pages
        if (params.structure && params.structure.pages.length > 1) {
          const label = href.slice(1);
          const hasReal = params.structure.pages.some(
            (p) =>
              p.route.includes(label) ||
              p.label.toLowerCase() === label.toLowerCase(),
          );
          if (hasReal) {
            issues.push({
              id: `hash-${file.path}-${href}`,
              severity: "warning",
              href,
              sourceFile: file.path,
              message: `Hash link ${href} should prefer a real page route.`,
            });
          }
        }
        continue;
      }
      const path = href.split("?")[0]!.split("#")[0]!;
      if (!path.startsWith("/")) continue;
      const ok =
        routes.has(path) ||
        [...routes].some(
          (r) => path === r || path.startsWith(r + "/") || r.startsWith(path),
        );
      if (!ok) {
        issues.push({
          id: `broken-${file.path}-${href}`,
          severity: "error",
          href,
          sourceFile: file.path,
          message: `Broken internal link: ${href} (no matching page).`,
        });
      }
    }
  }

  const missingRoutes: string[] = [];
  if (params.structure) {
    for (const page of params.structure.pages) {
      if (page.route === "/") continue;
      if (!routes.has(page.route)) {
        missingRoutes.push(page.route);
        issues.push({
          id: `missing-page-${page.route}`,
          severity: "error",
          href: page.route,
          sourceFile: "sitemap",
          message: `Missing page for navigation item: ${page.label} (${page.route}).`,
        });
      }
    }
  }

  const errors = issues.filter((i) => i.severity === "error");
  return {
    ok: errors.length === 0,
    checked,
    issues,
    coverage: {
      navLinked: params.structure?.navLinks.length || 0,
      pagesPresent: routes.size,
      missingRoutes,
    },
  };
}

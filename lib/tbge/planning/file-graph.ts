/**
 * Deterministic file graph templates — no LLM.
 */

import type { TbgeProductAdapter } from "@/lib/tbge/adapters/types";
import type { FileGraphNode } from "@/lib/tbge/spec/types";

const WEBSITE_PROFESSIONAL_GRAPH: FileGraphNode[] = [
  {
    path: "package.json",
    generator: "scaffold-static",
    deps: [],
    wave: "static-scaffold",
    priority: 0,
  },
  {
    path: "app/globals.css",
    generator: "scaffold-css",
    deps: ["package.json"],
    wave: "static-scaffold",
    priority: 1,
  },
  {
    path: "app/layout.tsx",
    generator: "layout-root",
    deps: ["app/globals.css"],
    wave: "foundation",
    priority: 2,
  },
  {
    path: "components/layout/site-shell.tsx",
    generator: "ux-shells",
    deps: ["app/layout.tsx"],
    wave: "components",
    priority: 3,
  },
  {
    path: "components/ui/button.tsx",
    generator: "ui-primitives",
    deps: ["components/layout/site-shell.tsx"],
    wave: "components",
    priority: 4,
  },
  {
    path: "lib/seo.ts",
    generator: "lib-seo",
    deps: ["app/layout.tsx"],
    wave: "hooks-api",
    priority: 5,
  },
  {
    path: "app/page.tsx",
    generator: "page-home",
    deps: ["components/layout/site-shell.tsx", "lib/seo.ts"],
    wave: "pages",
    priority: 6,
  },
  {
    path: "app/about/page.tsx",
    generator: "page-secondary",
    deps: ["components/layout/site-shell.tsx"],
    wave: "pages",
    priority: 7,
    optional: true,
  },
  {
    path: "components/sections/bindings.ts",
    generator: "component-bind",
    deps: ["app/page.tsx"],
    wave: "inject",
    priority: 8,
  },
  {
    path: "package-lock.json",
    generator: "package-sync",
    deps: ["package.json"],
    wave: "configs-tail",
    priority: 9,
  },
];

const TEMPLATE_REGISTRY: Record<string, FileGraphNode[]> = {
  "website-professional": WEBSITE_PROFESSIONAL_GRAPH,
};

export function resolveFileGraphForAdapter(adapter: TbgeProductAdapter): FileGraphNode[] {
  const templateName = adapter.assemblyProfile.fileGraphTemplate;
  const template = TEMPLATE_REGISTRY[templateName];
  if (!template) {
    throw new Error(`Unknown file graph template: ${templateName}`);
  }

  const enabled = new Set(adapter.assemblyProfile.generators);
  return template.filter((node) => enabled.has(node.generator));
}

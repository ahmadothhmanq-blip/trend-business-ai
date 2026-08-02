import type { GeneratorPlugin } from "@/lib/tbge/assembly/generators/types";
import { pageByPath } from "@/lib/tbge/assembly/generators/shared";

function resolveSecondaryPagePath(nodePath: string): string {
  const match = nodePath.match(/^app(\/.*)?\/page\.tsx$/);
  if (!match) return "/";
  const raw = match[1] ?? "";
  return raw === "" ? "/" : raw;
}

export const pageSecondaryGenerator: GeneratorPlugin = {
  id: "page-secondary",
  label: "Secondary page",
  generate({ spec, node }) {
    const pagePath = resolveSecondaryPagePath(node.path);
    const page =
      pageByPath(spec, pagePath) ??
      spec.structure.pages.find((entry) => node.path.includes(entry.path.replace(/^\//, "")));

    const title = page?.name ?? "Page";
    const purpose = page?.purpose ?? spec.business.offer;
    const sections = (page?.sections ?? ["Content"])
      .map((section) => `      <section><h2>${section}</h2></section>`)
      .join("\n");

    const content = [
      'import { SiteShell } from "@/components/layout/site-shell";',
      'import { buildPageTitle } from "@/lib/seo";',
      "",
      "export const metadata = {",
      `  title: buildPageTitle(${JSON.stringify(title)}),`,
      `  description: ${JSON.stringify(purpose)},`,
      "};",
      "",
      "export default function SecondaryPage() {",
      "  return (",
      "    <SiteShell>",
      `      <h1>${title}</h1>`,
      `      <p>${purpose}</p>`,
      sections,
      "    </SiteShell>",
      "  );",
      "}",
      "",
    ].join("\n");

    return { path: node.path, content, language: "tsx" };
  },
};

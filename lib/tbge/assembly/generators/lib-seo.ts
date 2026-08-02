import type { GeneratorPlugin } from "@/lib/tbge/assembly/generators/types";

export const libSeoGenerator: GeneratorPlugin = {
  id: "lib-seo",
  label: "SEO helpers",
  generate({ spec, node }) {
    const content = [
      `export const siteName = ${JSON.stringify(spec.business.name)};`,
      `export const siteDescription = ${JSON.stringify(spec.business.offer)};`,
      "",
      "export function buildPageTitle(pageTitle?: string) {",
      "  return pageTitle ? `${pageTitle} | ${siteName}` : siteName;",
      "}",
      "",
    ].join("\n");
    return { path: node.path, content, language: "ts" };
  },
};

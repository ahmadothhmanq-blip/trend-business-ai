import type { GeneratorPlugin } from "@/lib/tbge/assembly/generators/types";
import { homePage } from "@/lib/tbge/assembly/generators/shared";

export const pageHomeGenerator: GeneratorPlugin = {
  id: "page-home",
  label: "Home page",
  generate({ spec, node }) {
    const page = homePage(spec);
    const sections = page.sections
      .map((section) => `      <section><h2>${section}</h2></section>`)
      .join("\n");

    const content = [
      'import { SiteShell } from "@/components/layout/site-shell";',
      'import { Button } from "@/components/ui/button";',
      'import { buildPageTitle } from "@/lib/seo";',
      "",
      "export const metadata = {",
      `  title: buildPageTitle(${JSON.stringify(page.name)}),`,
      `  description: ${JSON.stringify(page.purpose)},`,
      "};",
      "",
      "export default function HomePage() {",
      "  return (",
      "    <SiteShell>",
      `      <h1>${page.name}</h1>`,
      `      <p>${page.purpose}</p>`,
      sections,
      page.primaryCta ? `      <Button>${page.primaryCta}</Button>` : "",
      "    </SiteShell>",
      "  );",
      "}",
      "",
    ]
      .filter(Boolean)
      .join("\n");

    return { path: node.path, content, language: "tsx" };
  },
};

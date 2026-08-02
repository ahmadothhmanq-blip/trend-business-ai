import type { GeneratorPlugin } from "@/lib/tbge/assembly/generators/types";

export const uxShellsGenerator: GeneratorPlugin = {
  id: "ux-shells",
  label: "Site shell",
  generate({ spec, node }) {
    const navItems = spec.structure.navigation.items
      .map((item) => `        <a href="${item.href}">${item.label}</a>`)
      .join("\n");

    const content = [
      "export function SiteShell({ children }: { children: React.ReactNode }) {",
      "  return (",
      "    <div>",
      "      <header>",
      `        <strong>${spec.business.name}</strong>`,
      "        <nav>",
      navItems,
      "        </nav>",
      "      </header>",
      "      <main>{children}</main>",
      "    </div>",
      "  );",
      "}",
      "",
    ].join("\n");
    return { path: node.path, content, language: "tsx" };
  },
};

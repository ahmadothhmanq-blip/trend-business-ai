import type { GeneratorPlugin } from "@/lib/tbge/assembly/generators/types";

export const componentBindGenerator: GeneratorPlugin = {
  id: "component-bind",
  label: "Section bindings",
  generate({ spec, node }) {
    const bindings = spec.structure.pages.flatMap((page) =>
      page.sections.map((section) => ({
        page: page.path,
        section,
        component: spec.design.componentPalette[0] ?? "components/sections/default.tsx",
      })),
    );

    const content = [
      "export const sectionBindings = " + JSON.stringify(bindings, null, 2) + " as const;",
      "",
      "export type SectionBinding = (typeof sectionBindings)[number];",
      "",
    ].join("\n");

    return { path: node.path, content, language: "ts" };
  },
};

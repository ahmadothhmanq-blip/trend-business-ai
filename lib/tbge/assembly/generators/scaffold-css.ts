import type { GeneratorPlugin } from "@/lib/tbge/assembly/generators/types";
import { cssVariablesBlock } from "@/lib/tbge/assembly/generators/shared";

export const scaffoldCssGenerator: GeneratorPlugin = {
  id: "scaffold-css",
  label: "Global CSS scaffold",
  generate({ spec, node }) {
    const content = [
      cssVariablesBlock(spec),
      "",
      "body {",
      "  margin: 0;",
      "  background: var(--color-background);",
      "  color: var(--color-foreground);",
      "  font-family: system-ui, sans-serif;",
      "}",
      "",
    ].join("\n");
    return { path: node.path, content, language: "css" };
  },
};

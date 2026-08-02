import type { GeneratorPlugin } from "@/lib/tbge/assembly/generators/types";

export const uiPrimitivesGenerator: GeneratorPlugin = {
  id: "ui-primitives",
  label: "UI primitives",
  generate({ node }) {
    const content = [
      "export function Button({ children }: { children: React.ReactNode }) {",
      "  return (",
      '    <button type="button" style={{ background: "var(--color-primary)", color: "#fff" }}>',
      "      {children}",
      "    </button>",
      "  );",
      "}",
      "",
    ].join("\n");
    return { path: node.path, content, language: "tsx" };
  },
};

import type { GeneratorPlugin } from "@/lib/tbge/assembly/generators/types";
import { specPackageName } from "@/lib/tbge/assembly/generators/shared";

export const scaffoldStaticGenerator: GeneratorPlugin = {
  id: "scaffold-static",
  label: "Static scaffold",
  generate({ spec, node }) {
    const pkg = {
      name: specPackageName(spec),
      version: "0.1.0",
      private: true,
      scripts: {
        dev: "next dev",
        build: "next build",
        start: "next start",
      },
    };
    return {
      path: node.path,
      content: `${JSON.stringify(pkg, null, 2)}\n`,
      language: "json",
    };
  },
};

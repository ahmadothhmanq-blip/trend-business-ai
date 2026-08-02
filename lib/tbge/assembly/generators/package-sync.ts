import type { GeneratorPlugin } from "@/lib/tbge/assembly/generators/types";
import { specPackageName } from "@/lib/tbge/assembly/generators/shared";

export const packageSyncGenerator: GeneratorPlugin = {
  id: "package-sync",
  label: "Package lock sync",
  generate({ spec, node }) {
    const lock = {
      name: specPackageName(spec),
      version: "0.1.0",
      lockfileVersion: 1,
      packages: {},
    };
    return {
      path: node.path,
      content: `${JSON.stringify(lock, null, 2)}\n`,
      language: "json",
    };
  },
};

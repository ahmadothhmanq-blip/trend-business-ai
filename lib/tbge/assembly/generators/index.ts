/**
 * Built-in deterministic generators — register all plugins.
 */

import type { GeneratorRegistry } from "@/lib/tbge/assembly/generators/types";
import { componentBindGenerator } from "@/lib/tbge/assembly/generators/component-bind";
import { layoutRootGenerator } from "@/lib/tbge/assembly/generators/layout-root";
import { libSeoGenerator } from "@/lib/tbge/assembly/generators/lib-seo";
import { packageSyncGenerator } from "@/lib/tbge/assembly/generators/package-sync";
import { pageHomeGenerator } from "@/lib/tbge/assembly/generators/page-home";
import { pageSecondaryGenerator } from "@/lib/tbge/assembly/generators/page-secondary";
import { scaffoldCssGenerator } from "@/lib/tbge/assembly/generators/scaffold-css";
import { scaffoldStaticGenerator } from "@/lib/tbge/assembly/generators/scaffold-static";
import { uiPrimitivesGenerator } from "@/lib/tbge/assembly/generators/ui-primitives";
import { uxShellsGenerator } from "@/lib/tbge/assembly/generators/ux-shells";

const BUILTIN_GENERATORS = [
  scaffoldStaticGenerator,
  scaffoldCssGenerator,
  layoutRootGenerator,
  uxShellsGenerator,
  uiPrimitivesGenerator,
  libSeoGenerator,
  pageHomeGenerator,
  pageSecondaryGenerator,
  componentBindGenerator,
  packageSyncGenerator,
];

export function registerBuiltinGenerators(registry: GeneratorRegistry): void {
  for (const plugin of BUILTIN_GENERATORS) {
    registry.register(plugin);
  }
}

export { BUILTIN_GENERATORS };

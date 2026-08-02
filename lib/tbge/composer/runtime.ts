/**
 * Component Composer runtime — orchestrates theme, patterns, pages, validation.
 */

import { composePage } from "@/lib/tbge/composer/page-engine";
import { createComponentRegistry } from "@/lib/tbge/composer/registry";
import type { ComponentRegistry } from "@/lib/tbge/composer/plugins/types";
import { composeTheme } from "@/lib/tbge/composer/theme";
import type { ComposerResult, SiteComposition } from "@/lib/tbge/composer/types";
import { assertValidSiteComposition } from "@/lib/tbge/composer/validate";
import type { GenerationSpec } from "@/lib/tbge/spec/types";
import { isSpecLocked } from "@/lib/tbge/spec/lock";
import { assertValidGenerationSpec } from "@/lib/tbge/spec/validator";

export type ComponentComposerDeps = {
  registry?: ComponentRegistry;
};

export type ComponentComposer = {
  compose(spec: GenerationSpec): ComposerResult;
};

export function createComponentComposer(
  deps: ComponentComposerDeps = {},
): ComponentComposer {
  const registry = deps.registry ?? createComponentRegistry();

  return {
    compose(spec: GenerationSpec): ComposerResult {
      const started = performance.now();

      assertValidGenerationSpec(spec);
      if (!isSpecLocked(spec)) {
        throw new Error("ComponentComposer requires a locked GenerationSpec");
      }

      const patternPlugin = registry.resolvePattern(spec);
      const industryPattern = patternPlugin.compose(spec);
      const theme = composeTheme(spec);
      const pages = composePage({ spec, registry, industryPattern });

      const composition: SiteComposition = {
        specId: spec.specId,
        productId: spec.productId,
        profile: spec.profile,
        theme,
        industryPattern,
        pages,
        navigation: spec.structure.navigation.items,
        footerSections: spec.structure.footerSections ?? [],
      };

      assertValidSiteComposition(spec, composition);

      const sectionsComposed = pages.reduce((sum, page) => sum + page.sections.length, 0);

      return {
        composition,
        stats: {
          pagesComposed: pages.length,
          sectionsComposed,
          durationMs: performance.now() - started,
        },
      };
    },
  };
}

/** Default singleton for DI registration (Sprint 4). */
export const defaultComponentComposer = createComponentComposer();

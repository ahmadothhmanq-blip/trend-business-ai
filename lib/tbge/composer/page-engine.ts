/**
 * Page composition engine — builds composed pages from GenerationSpec structure.
 */

import { composeResponsiveLayout } from "@/lib/tbge/composer/layout";
import type { ComponentRegistry } from "@/lib/tbge/composer/plugins/types";
import { composeSectionsForPage } from "@/lib/tbge/composer/section-engine";
import type { ComposedPage, IndustryPatternComposition } from "@/lib/tbge/composer/types";
import type { GenerationSpec } from "@/lib/tbge/spec/types";

export function composePage(input: {
  spec: GenerationSpec;
  registry: ComponentRegistry;
  industryPattern: IndustryPatternComposition;
}): ComposedPage[] {
  return input.spec.structure.pages.map((page) => {
    const sections = composeSectionsForPage({
      spec: input.spec,
      page,
      registry: input.registry,
      industryPattern: input.industryPattern,
    });

    const pageContent = input.spec.content?.pages?.[page.path];

    return {
      path: page.path,
      name: page.name,
      title: pageContent?.title ?? page.name,
      description: pageContent?.description ?? page.purpose,
      purpose: page.purpose,
      primaryCta: page.primaryCta,
      layout: composeResponsiveLayout(input.spec, {
        sectionCount: sections.length,
      }),
      sections,
    };
  });
}

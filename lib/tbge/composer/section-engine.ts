/**
 * Section composition engine — maps page sections to composed components.
 */

import { composeResponsiveLayout, mergeLayoutOverrides } from "@/lib/tbge/composer/layout";
import type { ComponentRegistry } from "@/lib/tbge/composer/plugins/types";
import type { ComposedSection, IndustryPatternComposition } from "@/lib/tbge/composer/types";
import { resolveComponentVariant } from "@/lib/tbge/composer/variants";
import type { GenerationSpec } from "@/lib/tbge/spec/types";
import type { WebsitePageSpec } from "@/lib/tbge/spec/website-structure";

function orderSections(
  sections: string[],
  pattern: IndustryPatternComposition,
): string[] {
  const bias = pattern.sectionOrderBias.map((name) => name.toLowerCase());
  return [...sections].sort((a, b) => {
    const aIndex = bias.indexOf(a.toLowerCase());
    const bIndex = bias.indexOf(b.toLowerCase());
    const aRank = aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex;
    const bRank = bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex;
    if (aRank !== bRank) return aRank - bRank;
    return sections.indexOf(a) - sections.indexOf(b);
  });
}

export function composeSectionsForPage(input: {
  spec: GenerationSpec;
  page: WebsitePageSpec;
  registry: ComponentRegistry;
  industryPattern: IndustryPatternComposition;
}): ComposedSection[] {
  const ordered = orderSections(input.page.sections, input.industryPattern);
  const pageLayout = mergeLayoutOverrides(
    composeResponsiveLayout(input.spec, { sectionCount: ordered.length }),
    input.industryPattern.layoutOverrides,
  );

  return ordered.map((sectionName, sectionIndex) => {
    const variant = resolveComponentVariant({
      spec: input.spec,
      sectionName,
      sectionIndex,
      patternDensity: input.industryPattern.defaultVariantDensity,
    });
    const sectionLayout = composeResponsiveLayout(input.spec, {
      sectionCount: 1,
      stackDirection: sectionIndex === 0 ? "column" : pageLayout.stackDirection,
    });
    const plugin = input.registry.resolveSection(sectionName);

    return plugin.compose({
      spec: input.spec,
      page: input.page,
      sectionName,
      sectionIndex,
      variant,
      layout: mergeLayoutOverrides(sectionLayout, input.industryPattern.layoutOverrides),
      industryPattern: input.industryPattern,
    });
  });
}

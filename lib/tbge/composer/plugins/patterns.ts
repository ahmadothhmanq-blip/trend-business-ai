/**
 * Industry pattern composition plugins.
 */

import type { IndustryPatternPlugin } from "@/lib/tbge/composer/plugins/types";
import type { IndustryPatternComposition } from "@/lib/tbge/composer/types";
import type { GenerationSpec } from "@/lib/tbge/spec/types";

function basePattern(
  id: string,
  label: string,
  spec: GenerationSpec,
  overrides: Partial<IndustryPatternComposition>,
): IndustryPatternComposition {
  return {
    id,
    label,
    sectionOrderBias: spec.structure.pages.flatMap((page) => page.sections),
    defaultVariantDensity:
      spec.profile === "fast" ? "compact" : spec.profile === "ultra" ? "spacious" : "comfortable",
    ...overrides,
  };
}

export const gamingPatternPlugin: IndustryPatternPlugin = {
  id: "gaming",
  label: "Gaming",
  priority: 100,
  match(spec) {
    const industry = `${spec.business.industry} ${spec.business.industryId}`.toLowerCase();
    return industry.includes("game") || industry.includes("gaming");
  },
  compose(spec) {
    return basePattern("gaming", "Gaming", spec, {
      sectionOrderBias: ["Hero", "Games", "Features", "Contact", "CTA"],
      defaultVariantDensity: "spacious",
      layoutOverrides: {
        stackDirection: "column",
        grid: { columns: 12, gap: "2rem" },
      },
    });
  },
};

export const businessPatternPlugin: IndustryPatternPlugin = {
  id: "business",
  label: "Business",
  priority: 90,
  match(spec) {
    const industry = `${spec.business.industry} ${spec.business.industryId}`.toLowerCase();
    return industry.includes("business") || industry.includes("corporate") || industry.includes("professional");
  },
  compose(spec) {
    return basePattern("business", "Business", spec, {
      sectionOrderBias: ["Hero", "Services", "Features", "Team", "Contact"],
      defaultVariantDensity: "comfortable",
    });
  },
};

export const defaultPatternPlugin: IndustryPatternPlugin = {
  id: "default",
  label: "Default",
  priority: 0,
  match() {
    return true;
  },
  compose(spec) {
    return basePattern("default", "Default", spec, {});
  },
};

export const BUILTIN_PATTERN_PLUGINS = [
  gamingPatternPlugin,
  businessPatternPlugin,
  defaultPatternPlugin,
];

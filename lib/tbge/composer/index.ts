/**
 * Component Composer public API.
 */

export {
  createComponentComposer,
  defaultComponentComposer,
  type ComponentComposer,
  type ComponentComposerDeps,
} from "@/lib/tbge/composer/runtime";
export { createComponentRegistry } from "@/lib/tbge/composer/registry";
export { composeTheme } from "@/lib/tbge/composer/theme";
export { composeResponsiveLayout } from "@/lib/tbge/composer/layout";
export { composePage } from "@/lib/tbge/composer/page-engine";
export { composeSectionsForPage } from "@/lib/tbge/composer/section-engine";
export {
  resolveComponentVariant,
  resolveSectionComponentType,
} from "@/lib/tbge/composer/variants";
export {
  validateSiteComposition,
  assertValidSiteComposition,
} from "@/lib/tbge/composer/validate";
export type {
  SiteComposition,
  ComposedPage,
  ComposedSection,
  ComposedTheme,
  ComponentVariant,
  ResponsiveLayoutSpec,
  IndustryPatternComposition,
  ComposerResult,
  ComposerValidationResult,
} from "@/lib/tbge/composer/types";
export type {
  SectionComposerPlugin,
  IndustryPatternPlugin,
  ComponentRegistry,
} from "@/lib/tbge/composer/plugins/types";

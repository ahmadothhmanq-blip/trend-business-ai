/**
 * Component Composer plugin contracts.
 */

import type {
  ComposedSection,
  ComponentVariant,
  IndustryPatternComposition,
  ResponsiveLayoutSpec,
} from "@/lib/tbge/composer/types";
import type { GenerationSpec } from "@/lib/tbge/spec/types";
import type { WebsitePageSpec } from "@/lib/tbge/spec/website-structure";

export type SectionComposerContext = {
  spec: GenerationSpec;
  page: WebsitePageSpec;
  sectionName: string;
  sectionIndex: number;
  variant: ComponentVariant;
  layout: ResponsiveLayoutSpec;
  industryPattern: IndustryPatternComposition;
};

export type SectionComposerPlugin = {
  id: string;
  /** Match section names (case-insensitive); first match wins by priority. */
  match(sectionName: string): boolean;
  priority: number;
  compose(ctx: SectionComposerContext): ComposedSection;
};

export type IndustryPatternPlugin = {
  id: string;
  label: string;
  match(spec: GenerationSpec): boolean;
  priority: number;
  compose(spec: GenerationSpec): IndustryPatternComposition;
};

export type ComponentRegistry = {
  registerSection(plugin: SectionComposerPlugin, options?: { override?: boolean }): void;
  registerPattern(plugin: IndustryPatternPlugin, options?: { override?: boolean }): void;
  resolveSection(sectionName: string): SectionComposerPlugin;
  resolvePattern(spec: GenerationSpec): IndustryPatternPlugin;
  listSections(): SectionComposerPlugin[];
  listPatterns(): IndustryPatternPlugin[];
};

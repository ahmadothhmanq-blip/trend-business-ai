/**
 * Component Composer registry — section and industry pattern plugins.
 */

import { BUILTIN_PATTERN_PLUGINS } from "@/lib/tbge/composer/plugins/patterns";
import { BUILTIN_SECTION_PLUGINS } from "@/lib/tbge/composer/plugins/sections";
import type {
  ComponentRegistry,
  IndustryPatternPlugin,
  SectionComposerPlugin,
} from "@/lib/tbge/composer/plugins/types";
import type { GenerationSpec } from "@/lib/tbge/spec/types";

export function createComponentRegistry(
  plugins: {
    sections?: SectionComposerPlugin[];
    patterns?: IndustryPatternPlugin[];
  } = {},
): ComponentRegistry {
  const sections = [...BUILTIN_SECTION_PLUGINS];
  const patterns = [...BUILTIN_PATTERN_PLUGINS];

  for (const plugin of plugins.sections ?? []) {
    sections.push(plugin);
  }
  for (const plugin of plugins.patterns ?? []) {
    patterns.push(plugin);
  }

  function resolveSection(sectionName: string): SectionComposerPlugin {
    const matches = sections
      .filter((plugin) => plugin.match(sectionName))
      .sort((a, b) => b.priority - a.priority);
    const winner = matches[0];
    if (!winner) {
      throw new Error(`No section composer plugin for: ${sectionName}`);
    }
    return winner;
  }

  function resolvePattern(spec: GenerationSpec): IndustryPatternPlugin {
    const matches = patterns
      .filter((plugin) => plugin.match(spec))
      .sort((a, b) => b.priority - a.priority);
    const winner = matches[0];
    if (!winner) {
      throw new Error("No industry pattern plugin matched spec");
    }
    return winner;
  }

  return {
    registerSection(plugin, options) {
      if (!options?.override && sections.some((row) => row.id === plugin.id)) return;
      sections.push(plugin);
    },
    registerPattern(plugin, options) {
      if (!options?.override && patterns.some((row) => row.id === plugin.id)) return;
      patterns.push(plugin);
    },
    resolveSection,
    resolvePattern,
    listSections() {
      return [...sections];
    },
    listPatterns() {
      return [...patterns];
    },
  };
}

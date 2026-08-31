/**
 * Per-theme component scaffolds — exclusive markup per theme component ID.
 * Each theme lives in libraries/{theme}.ts for maintainability.
 *
 * Component IDs: ThemeLuxuryNav ThemeTechNav ThemeBoldFloatingCta (+ 58 more across 8 themes)
 */

import { BOLD_SCAFFOLDS } from "@/lib/ai-core/components/scaffolds/themes/libraries/bold";
import { GLOBAL_SCAFFOLDS } from "@/lib/ai-core/components/scaffolds/themes/libraries/global";
import { CORPORATE_SCAFFOLDS } from "@/lib/ai-core/components/scaffolds/themes/libraries/corporate";
import { CREATIVE_SCAFFOLDS } from "@/lib/ai-core/components/scaffolds/themes/libraries/creative";
import { EDITORIAL_SCAFFOLDS } from "@/lib/ai-core/components/scaffolds/themes/libraries/editorial";
import { LUXURY_SCAFFOLDS } from "@/lib/ai-core/components/scaffolds/themes/libraries/luxury";
import { MINIMAL_SCAFFOLDS } from "@/lib/ai-core/components/scaffolds/themes/libraries/minimal";
import { MODERN_SCAFFOLDS } from "@/lib/ai-core/components/scaffolds/themes/libraries/modern";
import { TECHNOLOGY_SCAFFOLDS } from "@/lib/ai-core/components/scaffolds/themes/libraries/technology";

export const THEME_SCAFFOLD_BY_ID: Record<string, string> = {
  ...LUXURY_SCAFFOLDS,
  ...MODERN_SCAFFOLDS,
  ...MINIMAL_SCAFFOLDS,
  ...CORPORATE_SCAFFOLDS,
  ...CREATIVE_SCAFFOLDS,
  ...TECHNOLOGY_SCAFFOLDS,
  ...EDITORIAL_SCAFFOLDS,
  ...BOLD_SCAFFOLDS,
  ...GLOBAL_SCAFFOLDS,
};

export function getThemeScaffoldById(id: string): string | null {
  return THEME_SCAFFOLD_BY_ID[id] ?? null;
}

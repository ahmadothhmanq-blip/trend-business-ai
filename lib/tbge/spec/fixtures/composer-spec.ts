/**
 * GenerationSpec fixture with content model for composer tests.
 */

import { createFullAssemblyTestSpec } from "@/lib/tbge/spec/fixtures/assembly-spec";
import type { GenerationSpec } from "@/lib/tbge/spec/types";

export function createComposerTestSpec(
  overrides: Partial<GenerationSpec> = {},
): GenerationSpec {
  const base = createFullAssemblyTestSpec();

  return {
    ...base,
    business: {
      ...base.business,
      industry: "Gaming",
      industryId: "gaming",
    },
    content: {
      brand: {
        voice: "Bold",
        tagline: "Play beyond limits",
        positioning: "Premium game studio",
      },
      pages: {
        "/": {
          title: "Nova Games Studio",
          description: "Premium game development",
          sections: [
            {
              id: "hero-1",
              type: "Hero",
              headline: "Build Worlds Players Love",
              subheadline: "Award-winning studio",
              cta: "View Games",
            },
            {
              id: "games-1",
              type: "Games",
              headline: "Our Titles",
              items: ["Starfall Arena", "Neon Drift"],
            },
          ],
        },
        "/about": {
          title: "About Nova Games",
          description: "Our story",
          sections: [
            {
              id: "story-1",
              type: "Story",
              headline: "Our Journey",
              body: "Founded by passionate developers.",
            },
          ],
        },
      },
      navigation: base.structure.navigation.items,
      ctas: ["View Games", "Contact Us"],
      localized: false,
    },
    ...overrides,
  };
}

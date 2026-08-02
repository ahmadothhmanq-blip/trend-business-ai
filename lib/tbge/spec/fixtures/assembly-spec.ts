/**
 * Full file graph fixture for assembly engine tests.
 */

import { websiteBuilderTbgeAdapter } from "@/lib/tbge/adapters/website-adapter";
import { resolveFileGraphForAdapter } from "@/lib/tbge/planning/file-graph";
import { createTestGenerationSpec } from "@/lib/tbge/spec/fixtures/test-spec";

export function createFullAssemblyTestSpec() {
  return createTestGenerationSpec({
    fileGraph: resolveFileGraphForAdapter(websiteBuilderTbgeAdapter),
    structure: {
      kind: "website",
      pages: [
        {
          name: "Home",
          path: "/",
          purpose: "Introduce the studio",
          sections: ["Hero", "Games", "Contact"],
          primaryCta: "View Games",
        },
        {
          name: "About",
          path: "/about",
          purpose: "Studio story",
          sections: ["Story", "Team"],
          primaryCta: "Contact Us",
        },
      ],
      navigation: {
        items: [
          { label: "Home", href: "/" },
          { label: "About", href: "/about" },
        ],
      },
    },
  });
}

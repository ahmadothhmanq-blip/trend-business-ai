/**
 * Website Builder TBGE product adapter definition (Sprint 1 — not wired).
 */

import { createPassthroughProductAdapter } from "@/lib/tbge/adapters/types";
import type { GenerationSpec } from "@/lib/tbge/spec/types";

const baseAdapter = createPassthroughProductAdapter({
  productId: "website-builder",
  label: "Website Builder",
  assemblyProfile: {
    fileGraphTemplate: "website-professional",
    generators: [
      "scaffold-static",
      "scaffold-css",
      "layout-root",
      "ux-shells",
      "ui-primitives",
      "lib-seo",
      "page-home",
      "page-secondary",
      "component-bind",
      "package-sync",
    ],
  },
  planningDirectives: [
    {
      id: "website-pages",
      instruction: "Plan a complete multi-page marketing website sitemap.",
    },
  ],
});

export const websiteBuilderTbgeAdapter = {
  ...baseAdapter,
  extendSpec(spec: GenerationSpec): GenerationSpec {
    return {
      ...spec,
      design: {
        ...spec.design,
        templateIntelligenceId:
          spec.design.templateIntelligenceId ?? spec.design.templateId,
      },
    };
  },
};

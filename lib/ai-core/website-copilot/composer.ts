/**
 * Static single-step command recipes for Website Copilot.
 */

import type {
  CapabilityMatch,
  CopilotExecutionPlan,
} from "@/lib/ai-core/website-copilot/types";

/**
 * Map a capability URI to a single execution plan (no DAG planner).
 */
export function composePlan(match: CapabilityMatch): CopilotExecutionPlan {
  switch (match.uri) {
    case "website.brand.color.set":
      return {
        capability: match.uri,
        tier: "local",
        executor: "local",
      };
    case "website.design.style.modernize":
    case "website.section.add.testimonials":
    case "website.section.regenerate.hero":
    case "website.content.rewrite.home":
    case "website.image.replace.all":
      return {
        capability: match.uri,
        tier: "ai-continue",
        executor: "ai-continue",
      };
    case "website.page.add":
    case "website.manage.catalog":
    case "website.manage.cms":
      return {
        capability: match.uri,
        tier: "local",
        executor: "structure",
      };
    case "website.seo.improve":
      return {
        capability: match.uri,
        tier: "ai-continue",
        executor: "seo",
      };
    case "website.advisory.compound":
    case "website.advisory.unknown":
    default:
      return {
        capability: match.uri,
        tier: "advisory",
        executor: "advisory",
      };
  }
}

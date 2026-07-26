/**
 * Rules-based capability router for Website Copilot (Phase 1 + Phase 2).
 */

import type { CapabilityMatch, CopilotCapabilityUri } from "@/lib/ai-core/website-copilot/types";

const ROUTING_RULES: Array<{ re: RegExp; uri: CopilotCapabilityUri }> = [
  {
    re: /regenerat.*hero|redo.*hero|hero.*regenerat/i,
    uri: "website.section.regenerate.hero",
  },
  {
    re: /rewrite.*(home|homepage)|rewrite.*copy/i,
    uri: "website.content.rewrite.home",
  },
  {
    re: /testimonial|review.*section|add.*testimonial/i,
    uri: "website.section.add.testimonials",
  },
  {
    re: /modern|minimal|corporate|make it more/i,
    uri: "website.design.style.modernize",
  },
  {
    re: /improve.*seo|seo.*improve|fix.*seo|optimize.*seo/i,
    uri: "website.seo.improve",
  },
  {
    re: /replace.*(all )?(images|photos)|refresh.*(images|photos)|new (stock )?images/i,
    uri: "website.image.replace.all",
  },
  {
    re: /add.*\bpage\b|create.*\bpage\b/i,
    uri: "website.page.add",
  },
  {
    re: /cms|blog post|add.*article|publish.*post/i,
    uri: "website.manage.cms",
  },
  {
    re: /catalog|add.*(service|product|menu)|update.*price/i,
    uri: "website.manage.catalog",
  },
  {
    re: /color|palette|primary color|#[0-9a-f]{3,8}/i,
    uri: "website.brand.color.set",
  },
];

/**
 * Normalize natural-language input to a capability match.
 */
export function routeCommand(command: string): CapabilityMatch {
  const text = command.trim();
  if (!text) {
    return {
      uri: "website.advisory.unknown",
      confidence: 0,
      slots: {},
    };
  }

  const matchedUris: CopilotCapabilityUri[] = [];
  for (const rule of ROUTING_RULES) {
    if (rule.re.test(text)) {
      matchedUris.push(rule.uri);
    }
  }

  const unique = [...new Set(matchedUris)];
  if (unique.length > 1) {
    return {
      uri: "website.advisory.compound",
      confidence: 1,
      slots: { capabilities: unique },
    };
  }

  if (unique.length === 1) {
    return {
      uri: unique[0]!,
      confidence: 1,
      slots: {},
    };
  }

  return {
    uri: "website.advisory.unknown",
    confidence: 0,
    slots: {},
  };
}

/**
 * Whether a routed capability requires AI usage credits.
 */
export function capabilityRequiresAi(uri: CopilotCapabilityUri): boolean {
  return (
    uri === "website.design.style.modernize" ||
    uri === "website.section.add.testimonials" ||
    uri === "website.section.regenerate.hero" ||
    uri === "website.content.rewrite.home" ||
    uri === "website.image.replace.all" ||
    uri === "website.seo.improve"
  );
}

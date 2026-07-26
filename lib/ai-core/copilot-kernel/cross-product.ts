/**
 * Cross-product compound command detection (Phase 5).
 */

import type { CopilotCrossProductSplit } from "@/lib/ai-core/copilot-kernel/types";

const WEBSITE_SIGNALS =
  /\b(website|web\s*site|homepage|hero|seo|testimonial|page|cms|catalog)\b/i;
const APP_SIGNALS =
  /\b(app|application|screen|dashboard|catalog|booking|database|admin\s+panel|product)\b/i;

const WEBSITE_ACTIONS = [
  {
    re: /modern|minimal|design/i,
    command: "Make the design more modern",
  },
  {
    re: /seo|search\s+engine/i,
    command: "Improve SEO for this site",
  },
  {
    re: /color|palette|primary/i,
    command: "Change the primary color to #2563eb",
  },
  {
    re: /hero/i,
    command: "Regenerate only the hero section",
  },
  {
    re: /page/i,
    command: "Add an About page",
  },
];

const APP_ACTIONS = [
  {
    re: /dashboard|screen|page/i,
    command: "Add a dashboard screen",
  },
  {
    re: /product|catalog|menu/i,
    command: "Add a new product called Widget",
  },
  {
    re: /booking/i,
    command: "Add booking feature",
  },
  {
    re: /database|backend/i,
    command: "Connect database",
  },
  {
    re: /color|design|modern/i,
    command: "Change primary color to blue",
  },
];

function pickCommand(
  text: string,
  actions: Array<{ re: RegExp; command: string }>,
  fallback: string,
): string {
  for (const action of actions) {
    if (action.re.test(text)) return action.command;
  }
  return fallback;
}

export type CrossProductDetection = {
  isCrossProduct: boolean;
  split?: CopilotCrossProductSplit;
};

/**
 * Detect when a single command references both website and app work.
 */
export function detectCrossProductCommand(
  command: string,
  product: "website" | "app",
  linkedGenerationId?: string,
): CrossProductDetection {
  const text = command.trim();
  if (!text) return { isCrossProduct: false };

  const hasWebsite = WEBSITE_SIGNALS.test(text);
  const hasApp = APP_SIGNALS.test(text);

  if (!hasWebsite || !hasApp) {
    return { isCrossProduct: false };
  }

  const websiteCommand = pickCommand(
    text,
    WEBSITE_ACTIONS,
    "Make the design more modern",
  );
  const appCommand = pickCommand(
    text,
    APP_ACTIONS,
    "Add a dashboard screen",
  );

  return {
    isCrossProduct: true,
    split: {
      websiteCommand,
      appCommand,
      linkedGenerationId: linkedGenerationId?.trim() || undefined,
    },
  };
}

export function crossProductAdvisorySummary(
  product: "website" | "app",
): string {
  return product === "website"
    ? "This command spans both your website and app. Run each product command separately using the split below."
    : "This command spans both your app and website. Run each product command separately using the split below.";
}

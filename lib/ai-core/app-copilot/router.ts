/**
 * Rules-based capability router for App Copilot (Phase 4).
 */

import type {
  AppCapabilityMatch,
  AppCopilotCapabilityUri,
} from "@/lib/ai-core/app-copilot/types";

const ROUTING_RULES: Array<{ re: RegExp; uri: AppCopilotCapabilityUri }> = [
  {
    re: /(?:change|set|update)\s+(?:app\s+|application\s+)?(?:colors?|theme|primary)/i,
    uri: "app.brand.color.set",
  },
  {
    re: /add\s+(?:a\s+)?(?:new\s+)?(product|menu item|service|course|property|vehicle)/i,
    uri: "app.catalog.add",
  },
  {
    re: /(?:remove|delete)\s+(?:the\s+)?(?:product|item|menu item)/i,
    uri: "app.catalog.remove",
  },
  {
    re: /(?:change|update|set)\s+(?:the\s+)?(?:price\s+(?:of|for)\s+)/i,
    uri: "app.catalog.price.update",
  },
  {
    re: /(?:remove|delete)\s+(?:the\s+)?(?:screen|page)/i,
    uri: "app.screen.remove",
  },
  {
    re: /(?:add|create)\s+(?:a\s+)?(?:new\s+)?(?:screen|page|dashboard)/i,
    uri: "app.screen.add",
  },
  {
    re: /(?:rename|set)\s+(?:the\s+)?(?:app|application)/i,
    uri: "app.settings.rename",
  },
  {
    re: /add\s+(?:a\s+)?(?:new\s+)?role/i,
    uri: "app.role.add",
  },
  {
    re: /add\s+booking\s+feature/i,
    uri: "app.feature.booking",
  },
  {
    re: /change\s+application\s+design|redesign\s+app/i,
    uri: "app.design.redesign",
  },
  {
    re: /add\s+customer\s+management|add\s+payment\s+system/i,
    uri: "app.data.add-model",
  },
  {
    re: /connect\s+database/i,
    uri: "app.backend.provision",
  },
  {
    re: /create\s+admin\s+panel/i,
    uri: "app.admin.panel",
  },
  {
    re: /improve.*app|regenerat.*app|make.*modern|enhance.*design/i,
    uri: "app.assistant.continue",
  },
];

export function routeAppCommand(command: string): AppCapabilityMatch {
  const text = command.trim();
  if (!text) {
    return { uri: "app.advisory.unknown", confidence: 0, slots: {} };
  }

  const matchedUris: AppCopilotCapabilityUri[] = [];
  for (const rule of ROUTING_RULES) {
    if (rule.re.test(text)) {
      matchedUris.push(rule.uri);
    }
  }

  const unique = [...new Set(matchedUris)];
  if (unique.length > 1) {
    return {
      uri: "app.advisory.compound",
      confidence: 1,
      slots: { capabilities: unique },
    };
  }

  if (unique.length === 1) {
    return { uri: unique[0]!, confidence: 1, slots: {} };
  }

  return { uri: "app.advisory.unknown", confidence: 0, slots: {} };
}

export function appCapabilityRequiresAi(uri: AppCopilotCapabilityUri): boolean {
  return uri === "app.assistant.continue";
}

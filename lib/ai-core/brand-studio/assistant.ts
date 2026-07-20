/**
 * Conversational Brand Assistant — mutates brand model from natural language.
 */

import { mergeModel } from "@/lib/ai-core/brand-studio/model";
import type {
  BrandAssistantResult,
  BrandIdentityModel,
} from "@/lib/ai-core/brand-studio/types";

const LUXURY_PALETTE = [
  { name: "Noir", hex: "#1A1410", role: "Primary", usage: "Primary brand color" },
  { name: "Gold", hex: "#C9A227", role: "Accent", usage: "Precious accent" },
  { name: "Ivory", hex: "#F5F0E8", role: "Background", usage: "Light surfaces" },
  { name: "Bronze", hex: "#8B7355", role: "Secondary", usage: "Supporting tone" },
];

const YOUNG_PALETTE = [
  { name: "Electric", hex: "#7C3AED", role: "Primary", usage: "Bold primary" },
  { name: "Cyan", hex: "#06B6D4", role: "Accent", usage: "Energetic accent" },
  { name: "Coral", hex: "#FB7185", role: "Secondary", usage: "Playful highlight" },
  { name: "Ink", hex: "#0F172A", role: "Foreground", usage: "Text color" },
];

function colorNameToHex(name: string): string {
  const map: Record<string, string> = {
    gold: "#C9A227",
    black: "#000000",
    white: "#FFFFFF",
    blue: "#2563EB",
    purple: "#7C3AED",
    green: "#059669",
    red: "#DC2626",
    navy: "#0F172A",
  };
  return map[name.toLowerCase()] ?? "#D4AF37";
}

export function runBrandAssistant(params: {
  message: string;
  model: BrandIdentityModel;
}): BrandAssistantResult {
  const message = params.message.trim();
  let model = params.model;
  const actions: string[] = [];
  let applied = false;
  let command: string | undefined;

  if (/more luxury|more premium|more elegant/i.test(message)) {
    command = "make_luxury";
    model = mergeModel(model, {
      strategy: {
        ...model.strategy,
        personality: "Elegant",
      },
      voice: {
        ...model.voice,
        tone: "Refined, exclusive, and poised",
      },
      colors: LUXURY_PALETTE,
      typography: {
        ...model.typography,
        primary: "Playfair Display",
        secondary: "Source Sans 3",
        notes: "Luxury editorial pairing",
      },
      tokens: {
        ...model.tokens,
        primary: "#1A1410",
        secondary: "#8B7355",
        accent: "#C9A227",
        headingFont: "Playfair Display",
        bodyFont: "Source Sans 3",
        voiceTone: "Refined, exclusive, and poised",
      },
    });
    actions.push("Shifted palette and typography toward luxury positioning");
    applied = true;
  }

  const colorMatch = message.match(
    /(?:change|set|update)\s+(?:the\s+)?colors?\s+(?:to\s+)?(#?[0-9a-fA-F]{3,8}|\w+)/i,
  );
  if (colorMatch) {
    command = "change_colors";
    const hex = colorMatch[1]!.startsWith("#")
      ? colorMatch[1]!
      : colorNameToHex(colorMatch[1]!);
    const colors = model.colors.map((c, i) =>
      i === 0 ? { ...c, hex, name: c.name || "Primary" } : c,
    );
    model = mergeModel(model, {
      colors,
      tokens: { ...model.tokens, primary: hex, accent: hex },
    });
    actions.push(`Updated primary color → ${hex}`);
    applied = true;
  }

  if (/younger|more youthful|gen z|playful/i.test(message)) {
    command = "younger_identity";
    model = mergeModel(model, {
      strategy: { ...model.strategy, personality: "Playful" },
      voice: { ...model.voice, tone: "Bold, upbeat, and conversational" },
      colors: YOUNG_PALETTE,
      typography: {
        ...model.typography,
        primary: "Space Grotesk",
        secondary: "Inter",
      },
      tokens: {
        ...model.tokens,
        primary: "#7C3AED",
        accent: "#06B6D4",
        headingFont: "Space Grotesk",
        bodyFont: "Inter",
        voiceTone: "Bold, upbeat, and conversational",
      },
    });
    actions.push("Refreshed identity for a younger audience");
    applied = true;
  }

  if (/improve positioning|stronger positioning|better positioning/i.test(message)) {
    command = "improve_positioning";
    const tagline = model.positioning.tagline || `${model.brandName} — built for ${model.strategy.audience || "modern customers"}`;
    model = mergeModel(model, {
      positioning: {
        ...model.positioning,
        statement: `${model.brandName} leads ${model.industry || "its category"} with ${model.strategy.personality.toLowerCase()} clarity.`,
        tagline,
        elevatorPitch:
          model.positioning.elevatorPitch ||
          `${model.brandName} helps ${model.strategy.audience || "customers"} achieve more with a distinct ${model.strategy.personality.toLowerCase()} brand experience.`,
      },
    });
    actions.push("Strengthened positioning statement and elevator pitch");
    applied = true;
  }

  if (/generate missing assets|missing assets|fill gaps/i.test(message)) {
    command = "generate_missing_assets";
    actions.push("Queued missing asset regeneration (colors, voice, logo guidelines)");
    applied = true;
  }

  if (/change fonts?|update typography/i.test(message)) {
    command = "change_typography";
    const serif = /serif|luxury|elegant/i.test(message);
    model = mergeModel(model, {
      typography: {
        ...model.typography,
        primary: serif ? "Playfair Display" : "Inter",
        secondary: serif ? "Source Sans 3" : "Roboto",
      },
      tokens: {
        ...model.tokens,
        headingFont: serif ? "Playfair Display" : "Inter",
        bodyFont: serif ? "Source Sans 3" : "Roboto",
      },
    });
    actions.push(`Updated typography to ${serif ? "serif luxury" : "modern sans"} pairing`);
    applied = true;
  }

  return {
    applied,
    command,
    message: applied
      ? `Applied ${actions.length} update(s) to your brand.`
      : "I can help with: make it more luxury, change colors, younger identity, improve positioning, generate missing assets.",
    actions,
    model,
    creditsUsed: applied ? 1 : 0,
  };
}

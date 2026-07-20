/**
 * Brand Kit integration — consumes tokens without modifying Brand Studio.
 */

import type { BrandKitContext } from "@/lib/ai-core/image-design-platform/types";
import { brandTokensToContext } from "@/lib/ai-core/image-design-platform/model";

export type BrandIdentityTokens = {
  brandName?: string;
  primary?: string;
  secondary?: string;
  accent?: string;
  headingFont?: string;
  bodyFont?: string;
  voiceTone?: string;
  tagline?: string;
};

export function applyBrandIdentityTokens(tokens: BrandIdentityTokens): BrandKitContext {
  return brandTokensToContext(tokens);
}

export function buildBrandPromptSuffix(brand?: BrandKitContext): string {
  if (!brand) return "";
  const parts: string[] = [];
  if (brand.brandName) parts.push(`Brand: ${brand.brandName}`);
  if (brand.primary) parts.push(`Primary color ${brand.primary}`);
  if (brand.secondary) parts.push(`Secondary ${brand.secondary}`);
  if (brand.accent) parts.push(`Accent ${brand.accent}`);
  if (brand.voiceTone) parts.push(`Tone: ${brand.voiceTone}`);
  if (brand.tagline) parts.push(`Tagline inspiration: ${brand.tagline}`);
  return parts.length ? `. ${parts.join(". ")}.` : "";
}

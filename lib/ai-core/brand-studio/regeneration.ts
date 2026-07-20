/**
 * Partial regeneration helpers.
 */

import type { BrandIdentityModel } from "@/lib/ai-core/brand-studio/types";

const DELIVERABLE_SECTIONS: Record<string, (keyof BrandIdentityModel | string)[]> = {
  "brand-strategy": ["strategy"],
  "brand-story": ["files"],
  "logo-guidelines": ["logoDirection"],
  "color-palette": ["colors", "tokens"],
  typography: ["typography", "tokens"],
  "voice-tone": ["voice", "positioning"],
  logos: ["logos", "logoVariants"],
};

export function resolveRegenerationDeliverables(
  message: string,
  model: BrandIdentityModel,
): string[] {
  const lower = message.toLowerCase();
  const deliverables: string[] = [];

  if (/logo|mark|icon/i.test(lower)) deliverables.push("logo-guidelines");
  if (/color|palette|theme/i.test(lower)) deliverables.push("color-palette");
  if (/typography|font/i.test(lower)) deliverables.push("typography");
  if (/voice|tone|tagline/i.test(lower)) deliverables.push("voice-tone");
  if (/strategy|positioning|mission/i.test(lower)) deliverables.push("brand-strategy");
  if (/story|narrative/i.test(lower)) deliverables.push("brand-story");
  if (/social|card|stationery|email/i.test(lower)) {
    if (/social/i.test(lower)) deliverables.push("social-kit");
    if (/card/i.test(lower)) deliverables.push("business-card");
    if (/email/i.test(lower)) deliverables.push("email-signature");
  }

  if (!deliverables.length) {
    if (!model.logoVariants.length) deliverables.push("logo-guidelines");
    if (!model.colors.length) deliverables.push("color-palette");
    if (!model.strategy.document) deliverables.push("brand-strategy");
    else deliverables.push("voice-tone", "color-palette");
  }

  return [...new Set(deliverables)];
}

export function sectionsForDeliverables(deliverables: string[]): string[] {
  const sections = new Set<string>();
  for (const d of deliverables) {
    for (const s of DELIVERABLE_SECTIONS[d] ?? []) sections.add(s);
  }
  return [...sections];
}

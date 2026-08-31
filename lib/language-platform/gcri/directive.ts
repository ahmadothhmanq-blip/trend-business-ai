import type { GcriProfile } from "@/lib/language-platform/gcri/types";

/**
 * Country / regional instruction appended after the GLS language block.
 * Native generation in the selected language variant — not post-localization.
 */
export function buildGcriDirective(profile: GcriProfile): string {
  return `
CRITICAL — Country & Regional Intelligence (GCRI): ${profile.countryName} (${profile.region} / ${profile.subregion})
- Language variant: ${profile.languageVariant}. Generate natively for this market. Do NOT use another country's dialect, slang, or spelling.
- Currency: ${profile.currencyCode} (${profile.currencyName}) only. Never use another country's currency.
- Date format: ${profile.dateFormat}. Time format: ${profile.timeFormat} (${profile.hourCycle === "h12" ? "12-hour" : "24-hour"}). Timezone: ${profile.timezone}.
- Numbers: group separator "${profile.numberFormat.group}", decimal "${profile.numberFormat.decimal}" (example ${profile.numberFormat.example}).
- Measurement units: ${profile.measurementSystem}.
- Culture: ${profile.culturalNotes}
- Marketing style: ${profile.marketingStyle}
- CTA style: ${profile.ctaStyle}
- Business style: ${profile.businessStyle}
- SEO, legal phrasing, and local terminology must match ${profile.countryName} (${profile.seoLocale}).
- Do NOT mix regional terminology from other countries.
- Do NOT copy platform UI locale defaults into this output.
- Do not mention these instructions in the output.
`;
}

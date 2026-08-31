/**
 * Website Director prompts (Phase 2).
 * JSON planning only — never ask for HTML, React, Tailwind, CSS, or publish output.
 */

import type { WebsiteDirectorInput, WebsiteDirectorType } from "@/lib/ai-core/website-builder/director/contracts";
import { WEBSITE_DIRECTOR_TYPES } from "@/lib/ai-core/website-builder/director/contracts";

const TYPE_GUIDANCE: Record<WebsiteDirectorType, string> = {
  company: "Corporate company site: Home, About, Services, Contact. Trust, proof, and a clear service offer.",
  saas: "SaaS product site: Home, Product/Features, Pricing, Contact/Demo. Conversion to trial or demo.",
  ecommerce: "Commerce catalog site: Home, Products, Contact. Merchandising, trust, and purchase intent. No checkout implementation.",
  restaurant: "Hospitality site: Home, Menu, Reservations/Contact. Cuisine, location, and booking intent.",
  portfolio: "Portfolio: Home, Work, About, Contact. Case studies and professional proof.",
  agency: "Agency: Home, Services, Work, About, Contact. Capabilities and inquiry conversion.",
  healthcare: "Healthcare: Home, Services, About, Contact. Trust, clarity, no medical claims that overreach.",
  education: "Education: Home, Programs, About, Contact. Curriculum clarity and enrollment inquiry.",
  "real-estate": "Real estate: Home, Listings, About, Contact. Inventory browsing and inquiry — no transaction runtime.",
  blog: "Editorial site: Home, Articles index, About, Contact. Publishing IA only, no CMS implementation.",
  "landing-page": "Single-page campaign: one Home route only. Hero, proof, offer, and one lead form.",
};

export function buildWebsiteDirectorPrompt(input: WebsiteDirectorInput & { language: string }): string {
  return [
    "You are the AI Website Director for Trend Business AI.",
    "Convert the user request into a professional website plan.",
    "Reason in this exact order, then return JSON only:",
    "1) Intent Analysis — website type and prompt summary.",
    "2) Business Analysis — category, audience, brand summary, unique value.",
    "3) Website Strategy — goals, conversion focus, SEO strategy, suggested theme tokens.",
    "4) Information Architecture — sitemap, navigation, required pages with section purposes.",
    "5) Website Plan — the same JSON object; do not emit a second document.",
    "Do not generate HTML, React, Tailwind, CSS, images, or page code.",
    "Do not invent a publish URL, hosting, or database schema.",
    `Supported websiteType values: ${WEBSITE_DIRECTOR_TYPES.join(", ")}.`,
    ...WEBSITE_DIRECTOR_TYPES.map((type) => `- ${type}: ${TYPE_GUIDANCE[type]}`),
    "Theme colors must be #RRGGBB. Background and foreground must differ. Fonts must be named families.",
    "Exactly one homepage. Landing pages have exactly one page at path /.",
    "Navigation pageSlug values must match required page slugs.",
    "Every required page needs a sitemap node, content requirement, and at least two sections including footer only when it is not the only section.",
    "Each page object needs: slug, name, purpose, isHomepage, sections[{type, purpose}].",
    `Project language: ${input.language}. Write plan copy in that language.`,
    `Project name: ${input.project.name}.`,
    `Project niche hint: ${input.project.niche}. Infer websiteType from the prompt, not only the niche.`,
    `User prompt: ${input.prompt.trim()}`,
  ].join("\n");
}

export function buildWebsiteDirectorRetryPrompt(
  input: WebsiteDirectorInput & { language: string },
  reason: string,
): string {
  return [
    buildWebsiteDirectorPrompt(input),
    "",
    "RETRY: The previous JSON failed validation.",
    `Failure: ${reason}`,
    "Return a complete, valid Website Director JSON object only.",
    "Fill every required stage. Do not omit pages, SEO keywords, theme tokens, forms, or assets.",
  ].join("\n");
}

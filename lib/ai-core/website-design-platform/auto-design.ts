/**
 * Phase 1 — AI Auto Design Decision Engine.
 * From a free-text brief, decide industry, template, layout, colors,
 * typography, components, and animations without user picks.
 */

import {
  selectTemplateIntelligence,
  getTemplateIntelligence,
  resolveComponentsForIndustryAndTemplate,
} from "@/lib/ai-core/template-intelligence";
import type {
  AutoDesignDecision,
  DesignPlatformFamily,
  DesignPlatformVertical,
  TemplateControlSurface,
} from "@/lib/ai-core/website-design-platform/types";
import { resolveLocaleFromLanguage } from "@/lib/ai-core/website-design-platform/i18n";
import { buildControlSurfaceForTemplate } from "@/lib/ai-core/website-design-platform/template-architecture";
import { mapIndustryToVertical } from "@/lib/ai-core/website-design-platform/families";

export type AutoDesignInput = {
  prompt: string;
  language?: string | null;
  explicitTemplateId?: string | null;
  brandStyle?: string | null;
  industry?: string | null;
};

function inferIndustryId(prompt: string, hint?: string | null): string {
  if (hint?.trim()) return hint.trim().toLowerCase();
  const p = prompt.toLowerCase();
  if (/furniture|sofa|bedroom|living room|showroom|أثاث|مفروشات|كنب/.test(p))
    return "furniture";
  if (
    /travel|tourism|tour\b|destination|vacation|itinerary|cruise|resort|hotel|سفر|سياحة/.test(
      p,
    ) &&
    !/furniture|أثاث|sofa/.test(p)
  ) {
    return "tourism";
  }
  if (
    /car|vehicle|dealership|automotive|garage/.test(p) &&
    !/travel|tourism|tour\b|destination|vacation|resort|hotel/.test(p) &&
    !/furniture|sofa/.test(p)
  ) {
    return "automotive";
  }
  if (/real estate|realtor|property|listing|home buyer|عقار/.test(p))
    return "real-estate";
  if (/restaurant|dining|bistro|cafe|menu|chef|مطعم/.test(p)) return "restaurant";
  if (/computer company|computers?|it services|hardware|servers|تكنولوجيا|حاسوب|حواسيب/.test(p))
    return "technology";
  if (/saas|subscription software|b2b platform/.test(p)) return "saas";
  if (/ecommerce|online store|shopify|product shop/.test(p))
    return "ecommerce";
  if (/agency|creative studio|portfolio|design firm/.test(p)) return "agency";
  if (/clinic|dental|medical|healthcare|hospital|عيادة/.test(p)) return "clinic";
  if (/lawyer|attorney|law firm|legal consultant|litigation/.test(p)) return "law";
  if (/blog|magazine|editorial|article|newsletter/.test(p)) return "blog";
  if (/landing page|product launch|lead gen|waitlist|campaign page/.test(p))
    return "landing-page";
  if (/school|university|education|course|bootcamp|academy/.test(p)) return "education";
  if (
    /ai company|artificial intelligence|machine learning|software|tech company/.test(
      p,
    )
  )
    return "technology";
  return "business";
}

function inferBusinessType(prompt: string, industry: string): string {
  const p = prompt.toLowerCase();
  if (/travel|tourism|tour\b|destination|vacation|itinerary|cruise/.test(p)) {
    return "Travel and tourism company";
  }
  if (
    /dealership|garage/.test(p) &&
    !/travel|tourism|destination|vacation/.test(p)
  ) {
    return "Automotive dealership";
  }
  if (/showroom/.test(p) && /travel|tourism|destination|vacation/.test(p)) {
    return "Travel and tourism company";
  }
  if (/saas|subscription|platform/.test(p)) return "SaaS product";
  if (/agency|studio|creative/.test(p)) return "Creative agency";
  if (/restaurant|bistro|dining|cafe/.test(p)) return "Restaurant";
  if (/hotel|resort|boutique stay/.test(p)) return "Hotel";
  if (/clinic|dental|medical/.test(p)) return "Healthcare practice";
  if (/real estate|realtor|property/.test(p)) return "Real estate brokerage";
  if (/ecommerce|shop|store|product brand/.test(p)) return "Ecommerce brand";
  if (/consult|advisory|finance|bank/.test(p)) return "Professional services";
  if (/ai company|artificial intelligence|ml platform/.test(p))
    return "AI company";
  if (/software|tech|developer/.test(p)) return "Software company";
  return industry || "Business";
}

function inferAudience(
  prompt: string,
  vertical: DesignPlatformVertical,
): string {
  const p = prompt.toLowerCase();
  if (/b2b|enterprise|cto|founder/.test(p)) return "B2B decision makers";
  if (/luxury|hnw|vip|premium buyers/.test(p)) return "Affluent buyers";
  if (/tourist|traveler|guest/.test(p)) return "Travelers & guests";
  if (/patient|family/.test(p)) return "Patients & families";
  const defaults: Record<DesignPlatformVertical, string> = {
    Automotive: "Car buyers & enthusiasts",
    "Real Estate": "Home buyers & investors",
    "Luxury Brands": "Discerning luxury consumers",
    "AI Companies": "Technical buyers & innovators",
    SaaS: "Product teams & operators",
    Software: "Businesses seeking software solutions",
    Corporate: "Enterprise stakeholders",
    Consulting: "Business leaders seeking expertise",
    Finance: "Clients seeking financial clarity",
    Agency: "Brands seeking creative partners",
    Portfolio: "Prospective clients & collaborators",
    Restaurant: "Diners seeking memorable experiences",
    Hotel: "Travelers seeking stays",
    Travel: "Adventure & leisure travelers",
    Ecommerce: "Online shoppers",
    "Product Brands": "Brand-conscious consumers",
  };
  return defaults[vertical] || "Ideal customers";
}

function inferBrandStyle(
  prompt: string,
  family: DesignPlatformFamily,
  hint?: string | null,
): string {
  if (hint?.trim()) return hint.trim();
  const p = prompt.toLowerCase();
  if (/luxury|premium|noir|gold|elegant/.test(p)) return "Luxury";
  if (/minimal|clean|simple|whitespace/.test(p)) return "Minimal";
  if (/bold|creative|expressive|artistic/.test(p)) return "Creative";
  if (/corporate|trust|professional|finance/.test(p)) return "Corporate";
  if (/tech|futuristic|ai|saas|software/.test(p)) return "Technology";
  const familyDefault: Record<DesignPlatformFamily, string> = {
    Luxury: "Luxury",
    Technology: "Modern Technology",
    Business: "Corporate",
    Creative: "Creative",
    Hospitality: "Warm Hospitality",
    Commerce: "Modern Commerce",
  };
  return familyDefault[family];
}

const DEFAULT_SECTIONS = [
  "hero",
  "features",
  "services",
  "social-proof",
  "cta",
  "contact",
  "footer",
];

function requiredSectionsForVertical(
  vertical: DesignPlatformVertical,
): string[] {
  const map: Partial<Record<DesignPlatformVertical, string[]>> = {
    Automotive: [
      "hero",
      "vehicle-showcase",
      "inventory",
      "finance",
      "testimonials",
      "appointment",
      "footer",
    ],
    "Real Estate": [
      "hero",
      "listings",
      "neighborhoods",
      "testimonials",
      "contact",
      "footer",
    ],
    SaaS: [
      "hero",
      "features",
      "product",
      "pricing",
      "testimonials",
      "faq",
      "cta",
      "footer",
    ],
    "AI Companies": [
      "hero",
      "capabilities",
      "product",
      "case-studies",
      "pricing",
      "cta",
      "footer",
    ],
    Restaurant: [
      "hero",
      "menu",
      "gallery",
      "story",
      "reservations",
      "map",
      "footer",
    ],
    Hotel: [
      "hero",
      "rooms",
      "amenities",
      "gallery",
      "booking",
      "location",
      "footer",
    ],
    Ecommerce: [
      "hero",
      "collections",
      "products",
      "story",
      "testimonials",
      "cta",
      "footer",
    ],
    Agency: [
      "hero",
      "work",
      "services",
      "process",
      "testimonials",
      "contact",
      "footer",
    ],
    Portfolio: [
      "hero",
      "selected-work",
      "about",
      "services",
      "contact",
      "footer",
    ],
  };
  return map[vertical] || DEFAULT_SECTIONS;
}

/**
 * Run full auto-design analysis and produce a ready-to-apply decision.
 * User does not need to choose template, colors, or components.
 */
export function runAutoDesignDecision(
  input: AutoDesignInput,
): AutoDesignDecision {
  const prompt = (input.prompt || "").trim();
  const industry = inferIndustryId(prompt, input.industry);

  const { family, vertical } = mapIndustryToVertical(industry, prompt);
  const businessType = inferBusinessType(prompt, industry);
  const brandStyle = inferBrandStyle(prompt, family, input.brandStyle);
  const targetAudience = inferAudience(prompt, vertical);
  const requiredSections = requiredSectionsForVertical(vertical);

  const ti = selectTemplateIntelligence({
    prompt,
    industry,
    businessType,
    targetAudience,
    brandStyle,
    designStyle: brandStyle,
    explicitTemplateId: input.explicitTemplateId,
  });

  const template = getTemplateIntelligence(ti.template.id) || ti.template;
  const resolvedComponents = resolveComponentsForIndustryAndTemplate(
    template,
    industry,
    prompt,
  );

  const controlSurface: TemplateControlSurface =
    buildControlSurfaceForTemplate(template);

  const locale = resolveLocaleFromLanguage(input.language || "English");

  return {
    industry,
    businessType,
    targetAudience,
    brandStyle,
    requiredSections,
    family,
    vertical,
    templateIntelligenceId: template.id,
    premiumTemplateId: template.premiumTemplateId,
    designPreset: template.designPreset,
    layoutStructure: template.layoutStructure,
    colors: { ...template.colors },
    typography: { ...template.typography },
    components: resolvedComponents.map(String),
    animations: {
      id: template.animations.id,
      label: template.animations.label,
    },
    controlSurface,
    confidence: ti.confidence,
    reason: `Auto-designed for ${vertical} (${family}): ${ti.reason}`,
    locale: {
      language: locale.language,
      dir: locale.dir,
      rtl: locale.rtl,
    },
  };
}

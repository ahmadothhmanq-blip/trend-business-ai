/**
 * Abstract, domain-neutral display names for website structure templates.
 * IDs (slugs) stay stable for routing, files, and component prefixes.
 *
 * Keep in sync with lib/website/builder/template-display-names.ts
 */
export const TEMPLATE_DISPLAY_NAME_SEQUENCE = [
  "Elegant",
  "Global",
  "Classic",
  "Luxury",
  "Modern",
  "Refined",
  "Professional",
  "Minimal",
  "Contemporary",
  "Premium",
  "Bold",
  "Advanced",
  "Creative",
  "Signature",
  "Soft",
  "Timeless",
  "Sophisticated",
  "Prestige",
  "Distinctive",
  "Elite",
  "Clean",
  "Dynamic",
  "Balanced",
  "Stylish",
  "Iconic",
  "Visionary",
  "Polished",
  "Exclusive",
  "Pure",
  "Essential",
  "Dramatic",
  "Vibrant",
  "Sleek",
  "Authentic",
  "Powerful",
  "Graceful",
  "Innovative",
  "Strategic",
  "Luxury Modern",
  "Classic Premium",
  "Global Elite",
  "Modern Prestige",
  "Elegant Signature",
  "Bold Vision",
  "Pure Minimal",
  "Creative Studio",
  "Premium Classic",
  "Refined Modern",
  "Timeless Luxury",
  "Signature Elite",
];

const REGISTRY_TEMPLATE_IDS = [
  "corporate-business",
  "saas-enterprise",
  "restaurant-premium",
  "real-estate-premium",
  "medical-premium",
  "creative-agency-premium",
  "ecommerce-premium",
  "education-premium",
  "finance-premium",
  "hotel-resort-premium",
  "ai-startup-signal",
  "modern-business",
  "restaurant-signature",
  "real-estate-prestige",
  "creative-portfolio",
  "ti-luxury-noir",
  "ti-modern-clean",
  "ti-minimal-white",
  "ti-red-premium",
  "ti-technology-dark",
  "ti-automotive-showroom",
  "ti-automotive-luxury",
  "ti-automotive-corporate",
  "ti-automotive-modern",
  "ti-automotive-technology",
  "ti-luxury-brands-atelier",
  "ti-software-studio",
  "ti-consulting-clarity",
  "ti-agency-portfolio",
  "ti-travel-horizon",
  "ti-law-firm",
  "ti-education-campus",
  "ti-blog-editorial",
  "ti-landing-conversion",
  "ti-cafe-artisan",
  "ti-architecture-monograph",
  "ti-construction-industrial",
  "ti-dental-smile",
  "ti-pharmacy-wellness",
  "ti-insurance-shield",
  "ti-beauty-glow",
  "ti-fitness-pulse",
  "ti-logistics-freight",
  "ti-manufacturing-precision",
  "ti-nonprofit-impact",
];

const TI_PACKAGE_DISPLAY_ALIASES = {
  "ti-corporate-trust": "corporate-business",
  "ti-saas-growth": "saas-enterprise",
  "ti-restaurant-dining": "restaurant-premium",
  "ti-real-estate-listings": "real-estate-premium",
  "ti-medical-care": "medical-premium",
  "ti-creative-studio": "creative-agency-premium",
  "ti-ecommerce-atelier": "ecommerce-premium",
  "ti-university-heritage": "education-premium",
  "ti-finance-ledger": "finance-premium",
  "ti-hotel-sanctuary": "hotel-resort-premium",
  "ti-ai-company-signal": "ai-startup-signal",
};

function buildBrandNames() {
  const names = {};
  REGISTRY_TEMPLATE_IDS.forEach((id, index) => {
    const name = TEMPLATE_DISPLAY_NAME_SEQUENCE[index] ?? id;
    names[id] = { name, nameAr: name };
  });
  for (const [tiId, packageId] of Object.entries(TI_PACKAGE_DISPLAY_ALIASES)) {
    names[tiId] = names[packageId] ?? { name: tiId, nameAr: tiId };
  }
  return names;
}

export const TEMPLATE_BRAND_NAMES = buildBrandNames();

export function brandNameFor(id) {
  return TEMPLATE_BRAND_NAMES[id]?.name ?? id;
}

export function brandNameArFor(id) {
  return TEMPLATE_BRAND_NAMES[id]?.nameAr ?? brandNameFor(id);
}

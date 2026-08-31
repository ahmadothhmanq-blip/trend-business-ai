/**
 * Industry Image Gate — blocks off-domain subjects (e.g. cars on mobile-app sites).
 */

const DOMAIN_BLOCKLIST: Record<string, string[]> = {
  "mobile-app-landing": [
    "car",
    "automotive",
    "vehicle",
    "dealership",
    "سيارة",
    "سيارات",
  ],
  "electronics-retail": [
    "car",
    "automotive",
    "vehicle",
    "dealership",
    "restaurant",
    "food plate",
    "chef",
    "real estate",
    "property listing",
    "مطعم",
    "عقار",
    "سيارة",
  ],
  "restaurant-local": ["software dashboard", "saas ui", "code editor"],
  "saas-b2b": ["food photography", "restaurant plate", "chef kitchen"],
  "real-estate": ["mobile app screenshot", "phone mockup only"],
  "fashion-retail": [
    "car",
    "automotive",
    "vehicle",
    "smartphone",
    "mobile phone",
    "restaurant",
    "food plate",
    "real estate",
    "construction",
    "hospital",
    "سيارة",
    "جوال",
    "موبايل",
    "مطعم",
    "عقار",
  ],
};

const ARCHETYPE_ALIASES: Record<string, string> = {
  "electronics-retail": "electronics-retail",
  "fashion-retail": "fashion-retail",
  fashion: "fashion-retail",
  clothing: "fashion-retail",
  apparel: "fashion-retail",
  "mobile-app": "mobile-app-landing",
  app: "mobile-app-landing",
  "real-estate": "real-estate",
  restaurant: "restaurant-local",
  saas: "saas-b2b",
};

export function normalizeArchetypeForImageGate(
  archetypeOrIndustry?: string | null,
): string {
  const key = (archetypeOrIndustry ?? "").toLowerCase().trim();
  if (DOMAIN_BLOCKLIST[key]) return key;
  if (key.includes("electronics-retail") || key.includes("phone-store")) {
    return "electronics-retail";
  }
  if (
    /موبايل|جوال|هواتف|smartphone|mobile-phone|phone-store/.test(key) &&
    !key.includes("app-landing") &&
    !key.includes("mobile-app")
  ) {
    return "electronics-retail";
  }
  for (const [alias, id] of Object.entries(ARCHETYPE_ALIASES)) {
    if (key.includes(alias)) return id;
  }
  return key;
}

export function getIndustryBlockedTokens(archetypeOrIndustry?: string | null): string[] {
  const id = normalizeArchetypeForImageGate(archetypeOrIndustry);
  return DOMAIN_BLOCKLIST[id] ?? [];
}

export function passesIndustryImageGate(params: {
  prompt: string;
  archetypeOrIndustry?: string | null;
}): { passed: boolean; reason?: string } {
  const blocked = getIndustryBlockedTokens(params.archetypeOrIndustry);
  if (!blocked.length) return { passed: true };

  const hay = params.prompt.toLowerCase();
  for (const token of blocked) {
    if (hay.includes(token.toLowerCase())) {
      return {
        passed: false,
        reason: `Off-domain image subject "${token}" for ${params.archetypeOrIndustry ?? "site"}`,
      };
    }
  }
  return { passed: true };
}

export function sanitizePromptForIndustryGate(params: {
  prompt: string;
  archetypeOrIndustry?: string | null;
  fallbackHint?: string;
}): string {
  const gate = passesIndustryImageGate(params);
  if (gate.passed) return params.prompt;
  const hint =
    params.fallbackHint ??
    `Professional imagery appropriate for ${params.archetypeOrIndustry ?? "this business"}`;
  return `${hint}. ${params.prompt}`.replace(
    new RegExp(getIndustryBlockedTokens(params.archetypeOrIndustry).join("|"), "gi"),
    "",
  );
}

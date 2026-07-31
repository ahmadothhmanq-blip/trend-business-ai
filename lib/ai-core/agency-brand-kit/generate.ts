import { getDefaultTextProvider } from "@/lib/ai/provider-config";
import { providerManager } from "@/lib/ai/provider-manager";
import type { BusinessIntelligenceProfile } from "@/lib/ai-core/business-intelligence/types";
import type { DesignDNAPrinciples } from "@/lib/ai-core/design-dna/types";
import type { AgencyBrandKit } from "@/lib/ai-core/agency-brand-kit/types";
import { buildBrandGuidelines } from "@/lib/ai-core/agency-brand-kit/guidelines";
import { generateBrandLogoAssets } from "@/lib/ai-core/agency-brand-kit/logo-svg";

type BrandKitPayload = Partial<AgencyBrandKit>;

const PALETTE_BY_MOOD: Record<string, AgencyBrandKit["colorPalette"]> = {
  luxury: {
    primary: "#1a1a1a",
    secondary: "#c9a962",
    accent: "#d4af37",
    background: "#faf9f7",
    foreground: "#1a1a1a",
    surface: "#ffffff",
  },
  warm: {
    primary: "#2d1810",
    secondary: "#8b5a3c",
    accent: "#c4784a",
    background: "#faf6f1",
    foreground: "#2d1810",
    surface: "#ffffff",
  },
  tech: {
    primary: "#0f172a",
    secondary: "#3b82f6",
    accent: "#6366f1",
    background: "#f8fafc",
    foreground: "#0f172a",
    surface: "#ffffff",
  },
  minimal: {
    primary: "#18181b",
    secondary: "#71717a",
    accent: "#18181b",
    background: "#ffffff",
    foreground: "#18181b",
    surface: "#fafafa",
  },
  corporate: {
    primary: "#1e3a5f",
    secondary: "#2563eb",
    accent: "#0ea5e9",
    background: "#f8fafc",
    foreground: "#0f172a",
    surface: "#ffffff",
  },
};

function inferPalette(profile: BusinessIntelligenceProfile): AgencyBrandKit["colorPalette"] {
  const hay = `${profile.tone} ${profile.visualStyle.join(" ")} ${profile.colorPalette.join(" ")}`.toLowerCase();
  if (/luxury|premium|gold|elegant/.test(hay)) return PALETTE_BY_MOOD.luxury;
  if (/tech|saas|digital|ai|cyber/.test(hay)) return PALETTE_BY_MOOD.tech;
  if (/minimal|clean|scandinavian/.test(hay)) return PALETTE_BY_MOOD.minimal;
  if (/warm|earth|wood|furniture|organic/.test(hay)) return PALETTE_BY_MOOD.warm;
  return PALETTE_BY_MOOD.corporate;
}

function inferTypography(dna: DesignDNAPrinciples): AgencyBrandKit["typography"] {
  switch (dna.benchmark) {
    case "apple-quality":
      return { display: "SF Pro Display", heading: "SF Pro Display", body: "SF Pro Text" };
    case "stripe-quality":
    case "vercel-quality":
      return { display: "Inter", heading: "Inter", body: "Inter" };
    case "linear-quality":
      return { display: "Inter", heading: "Inter", body: "IBM Plex Sans" };
    case "notion-quality":
      return { display: "Inter", heading: "Inter", body: "Inter" };
    case "claude-quality":
      return { display: "Source Serif 4", heading: "Inter", body: "Inter" };
    default:
      return { display: "Playfair Display", heading: "DM Sans", body: "DM Sans" };
  }
}

function slugCompany(industry: string): string {
  const prefixes: Record<string, string[]> = {
    furniture: ["Atelier", "Forma", "Lignum", "Haven", "Modulo"],
    restaurant: ["Saffron", "Ember", "Harvest", "Noir", "Terrace"],
    clinic: ["Vitae", "Clarity", "Apex", "Wellness", "Harmony"],
    law: ["Sterling", "Apex", "Meridian", "Crown", "Summit"],
    saas: ["Nexus", "Pulse", "Vertex", "Flow", "Scale"],
    technology: ["Nexus", "Vertex", "Prism", "Core", "Signal"],
    tourism: ["Horizon", "Voyage", "Atlas", "Summit", "Odyssey"],
    "real-estate": ["Landmark", "Crest", "Vista", "Prime", "Harbor"],
    ecommerce: ["Curate", "Luxe", "Form", "Studio", "Market"],
    agency: ["Studio", "Craft", "Form", "Axis", "Collective"],
  };

  const key = industry.toLowerCase().replace(/\s+/g, "-");
  const pool = prefixes[key] || ["Apex", "Meridian", "Prime", "Studio", "Craft"];
  const suffix = industry.split(/\s+/)[0] || "Co";
  const cap = suffix.charAt(0).toUpperCase() + suffix.slice(1).toLowerCase();
  const prefix = pool[Math.abs(hashString(industry)) % pool.length];
  return `${prefix} ${cap}`;
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = (h + s.charCodeAt(i) * (i + 1)) % 997;
  }
  return h;
}

function fallbackBrandKit(params: {
  profile: BusinessIntelligenceProfile;
  designDNA: DesignDNAPrinciples;
  prompt: string;
}): AgencyBrandKit {
  const { profile, designDNA } = params;
  const companyName = slugCompany(profile.industry);
  const tagline =
    profile.heroMessaging[0] ||
    `${profile.subcategory} for ${profile.audience[0] || "discerning clients"}`;

  return {
    companyName,
    tagline,
    logoConcept: `Abstract mark representing ${profile.subcategory} — geometric, memorable, scalable`,
    logoStyle: designDNA.benchmark === "apple-quality" ? "wordmark-minimal" : "icon-wordmark",
    colorPalette: inferPalette(profile),
    typography: inferTypography(designDNA),
    trustElements: [
      "Industry certifications placeholder",
      "Client satisfaction metrics",
      "Years of experience",
      "Award or recognition badge",
    ],
    contactPlaceholders: {
      email: `hello@${companyName.toLowerCase().replace(/\s+/g, "")}.com`,
      phone: "+1 (555) 000-0000",
      address: "123 Business Avenue, Suite 100",
    },
  };
}

function finalizeBrandKit(
  kit: AgencyBrandKit,
  params: {
    profile: BusinessIntelligenceProfile;
    designDNA: DesignDNAPrinciples;
  },
): AgencyBrandKit {
  const logoAssets = generateBrandLogoAssets(kit);
  const guidelines = buildBrandGuidelines({
    brandKit: kit,
    profile: params.profile,
    designDNA: params.designDNA,
    logoAssets,
  });
  return {
    ...kit,
    logos: {
      light: logoAssets.logoLight,
      dark: logoAssets.logoDark,
      monogram: logoAssets.monogram,
      favicon: logoAssets.favicon,
    },
    guidelines,
  };
}

/**
 * Generate a complete brand kit from business intelligence + design DNA.
 * Creates temporary company identity when user provides only a prompt.
 */
export async function generateAgencyBrandKit(params: {
  prompt: string;
  profile: BusinessIntelligenceProfile;
  designDNA: DesignDNAPrinciples;
  language?: string;
  onProgress?: (message: string) => void;
}): Promise<AgencyBrandKit> {
  params.onProgress?.("[agency-brand] Generating brand identity…");

  const resolved = providerManager.resolve(getDefaultTextProvider());
  if (!resolved) {
    return finalizeBrandKit(fallbackBrandKit(params), params);
  }

  try {
    const result = await providerManager.generateJson<BrandKitPayload>(
      {
        system: `You are a senior brand strategist at an elite digital agency.
Create a unique, credible brand identity for a business. Never use real existing brand names.
Respond with JSON only.`,
        prompt: `Business: ${params.profile.industry} — ${params.profile.subcategory}
Audience: ${params.profile.audience.join(", ")}
Tone: ${params.profile.tone}
Visual style: ${params.profile.visualStyle.join(", ")}
Design benchmark: ${params.designDNA.label}
User request: ${params.prompt.slice(0, 400)}
Language: ${params.language ?? "en"}

Return JSON:
{
  "companyName": "unique invented company name",
  "tagline": "memorable tagline under 80 chars",
  "logoConcept": "logo concept description",
  "logoStyle": "wordmark-minimal | icon-wordmark | lettermark | emblem",
  "colorPalette": { "primary": "#hex", "secondary": "#hex", "accent": "#hex", "background": "#hex", "foreground": "#hex", "surface": "#hex" },
  "typography": { "display": "font", "heading": "font", "body": "font" },
  "trustElements": ["trust badge 1", "trust badge 2", "trust badge 3"],
  "contactPlaceholders": { "email": "...", "phone": "...", "address": "..." }
}`,
        temperature: 0.7,
      },
      resolved,
    );

    const fallback = fallbackBrandKit(params);
    return finalizeBrandKit(
      {
        companyName:
        typeof result.companyName === "string" && result.companyName.trim()
          ? result.companyName.trim()
          : fallback.companyName,
      tagline:
        typeof result.tagline === "string" && result.tagline.trim()
          ? result.tagline.trim()
          : fallback.tagline,
      logoConcept:
        typeof result.logoConcept === "string"
          ? result.logoConcept
          : fallback.logoConcept,
      logoStyle:
        typeof result.logoStyle === "string"
          ? result.logoStyle
          : fallback.logoStyle,
      colorPalette: result.colorPalette?.primary
        ? { ...fallback.colorPalette, ...result.colorPalette }
        : fallback.colorPalette,
      typography: result.typography?.display
        ? { ...fallback.typography, ...result.typography }
        : fallback.typography,
      trustElements: Array.isArray(result.trustElements) && result.trustElements.length
        ? result.trustElements.map(String)
        : fallback.trustElements,
      contactPlaceholders: result.contactPlaceholders?.email
        ? { ...fallback.contactPlaceholders, ...result.contactPlaceholders }
        : fallback.contactPlaceholders,
      },
      params,
    );
  } catch {
    return finalizeBrandKit(fallbackBrandKit(params), params);
  }
}

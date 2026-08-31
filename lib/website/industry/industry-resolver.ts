import { detectWebsiteIndustrySync } from "@/lib/ai-core/industry-intelligence/detect";
import { getSiteArchetypeDefinition } from "@/lib/website/site-plan/archetypes";
import { detectSiteArchetypeFromText } from "@/lib/website/site-plan/detect-archetype";
import { pickExplicitRoutingIndustryId } from "@/lib/website/site-plan/normalize-routing-industry";
import type { SiteArchetypeId } from "@/lib/website/site-plan/types";

/** SitePlan archetype → premium-stock / image-profile routing id. */
const ARCHETYPE_STOCK_MAP: Partial<Record<SiteArchetypeId, string>> = {
  "electronics-retail": "electronics-retail",
  "fashion-retail": "fashion",
  "real-estate": "real-estate",
  "restaurant-local": "restaurant",
  "saas-b2b": "saas",
  "mobile-app-landing": "technology",
  "ecommerce-dropshipping": "ecommerce",
  "general-business": "business",
};

const ROUTING_INDUSTRY_HINTS: Record<string, { label: string; imageHints: string[] }> =
  {
    furniture: {
      label: "Furniture / Home Furnishings",
      imageHints: ["furniture showroom", "living room sofa", "bedroom set"],
    },
    fashion: {
      label: "Fashion / Boutique",
      imageHints: ["fashion lookbook", "boutique interior", "garment detail"],
    },
    "electronics-retail": {
      label: "Electronics / Mobile Retail",
      imageHints: ["smartphone product shot", "tech retail interior", "repair bench"],
    },
    restaurant: {
      label: "Restaurant",
      imageHints: ["restaurant interior", "chef plating", "dining atmosphere"],
    },
    "real-estate": {
      label: "Real Estate",
      imageHints: ["property exterior", "modern living room", "neighborhood"],
    },
    clinic: {
      label: "Clinic / Healthcare",
      imageHints: ["medical clinic", "doctor consultation", "healthcare facility"],
    },
    automotive: {
      label: "Automotive / Dealership",
      imageHints: [
        "luxury vehicle exterior",
        "car showroom interior",
        "automotive dealership",
      ],
    },
    saas: {
      label: "SaaS / Software",
      imageHints: ["product UI mockup", "team collaboration", "abstract tech"],
    },
    ecommerce: {
      label: "E-commerce",
      imageHints: ["product on white", "lifestyle product shot", "online retail"],
    },
    tourism: {
      label: "Tourism / Travel",
      imageHints: ["destination landscape", "travel experience", "resort exterior"],
    },
    education: {
      label: "Education",
      imageHints: ["classroom learning", "students collaboration", "campus"],
    },
    technology: {
      label: "Technology",
      imageHints: ["technology workspace", "hardware product", "innovation lab"],
    },
    law: {
      label: "Law & Legal",
      imageHints: ["law office library", "attorney consultation", "legal courtroom"],
    },
  };

export type WebsiteIndustrySource =
  | "explicit"
  | "haystack"
  | "catalog"
  | "archetype"
  | "default";

export type WebsiteIndustryInput = {
  prompt?: string | null;
  title?: string | null;
  description?: string | null;
  industryId?: string | null;
  businessIndustry?: string | null;
  sitePlanArchetype?: string | null;
  archetypeId?: SiteArchetypeId | null;
};

export type ResolvedWebsiteIndustry = {
  industryId: string;
  source: WebsiteIndustrySource;
  confidence: number;
  archetypeId: SiteArchetypeId;
  industryLabel: string;
  imageHints: string[];
};

export function detectStockIndustryFromHaystack(haystack: string): string | null {
  const lower = haystack.toLowerCase();

  if (
    /محاماة|محاماه|محامي|قانوني|استشارات\s*قانونية/.test(haystack) ||
    /\b(law\s*firm|lawyer|attorney|legal\s+advisory|litigation|solicitor)\b/i.test(
      lower,
    )
  ) {
    return "law";
  }

  if (
    /ملابس|أزياء|موضة|فستان|فساتين|بوتيك/.test(haystack) ||
    /\b(fashion|clothing|apparel|boutique|dress|wear|garment|lookbook|tailor)\b/i.test(
      lower,
    )
  ) {
    return "fashion";
  }

  if (
    /موبايل|جوالات|جوال|هواتف|هاتف|إلكترونيات|الكترونيات|اكسسوارات\s*جوال/.test(
      haystack,
    ) ||
    /\b(smartphones?|mobile\s*phones?|phone\s*store|cell\s*phones?|handsets?|gadgets?)\b/i.test(
      lower,
    ) ||
    /\bmobile\s*(shop|store|retail|company|dealer|outlet)\b/i.test(lower) ||
    /\b(electronics?\s*(store|shop|retail)|phone\s*repair|trade[\s-]?in)\b/i.test(
      lower,
    )
  ) {
    return "electronics-retail";
  }

  if (/\b(mobile\s*app|app\s*landing|تطبيق|تطبيقات)\b/i.test(lower)) {
    return "technology";
  }

  if (
    /مطعم|مقهى|كافيه/.test(haystack) ||
    /\b(restaurant|cafe|café|dining|bakery|food\s*service)\b/i.test(lower)
  ) {
    return "restaurant";
  }

  if (
    /عقار|عقارات/.test(haystack) ||
    /\b(real[\s-]?estate|property|realtor|brokerage)\b/i.test(lower)
  ) {
    return "real-estate";
  }

  if (
    /أثاث|مفروشات|مفروشة|غرف\s*نوم/.test(haystack) ||
    /\b(furniture|furnishing|sofa|bedroom\s*store|home\s*decor|mattress)\b/i.test(
      lower,
    )
  ) {
    return "furniture";
  }

  if (
    /عيادة|طبيب/.test(haystack) ||
    /\b(clinic|medical|healthcare|hospital|dental)\b/i.test(lower)
  ) {
    return "clinic";
  }

  if (
    /سيارات|سيارة|وكالة سيارات/.test(haystack) ||
    /\b(automotive|car\s*company|car\s*dealer|dealership|vehicle|motors?)\b/i.test(
      lower,
    )
  ) {
    return "automotive";
  }

  return null;
}

/**
 * Canonical industry resolver — single source for routing, images, and persistence.
 */
export function resolveWebsiteIndustry(
  params: WebsiteIndustryInput,
): ResolvedWebsiteIndustry {
  const haystack = [
    params.prompt,
    params.title,
    params.description,
    params.industryId,
    params.businessIndustry,
  ]
    .filter(Boolean)
    .join(" ");

  const archetypeId =
    params.archetypeId ??
    (params.sitePlanArchetype as SiteArchetypeId | undefined) ??
    detectSiteArchetypeFromText(haystack);

  const def = getSiteArchetypeDefinition(archetypeId);
  const explicitIndustryId = pickExplicitRoutingIndustryId(
    params.industryId,
    params.businessIndustry,
  );
  const autoIndustry = explicitIndustryId
    ? null
    : detectWebsiteIndustrySync({
        prompt: params.prompt,
        title: params.title,
        description: params.description,
        industryId: params.industryId,
        businessIndustry: params.businessIndustry,
      });
  const detectedIndustry = detectStockIndustryFromHaystack(haystack);
  const autoRoutingId =
    autoIndustry && autoIndustry.industryId !== "business"
      ? autoIndustry.industryId
      : null;

  let industryId: string;
  let source: WebsiteIndustrySource;
  let confidence: number;

  if (explicitIndustryId) {
    industryId = explicitIndustryId;
    source = "explicit";
    confidence = 1;
  } else if (detectedIndustry) {
    industryId = detectedIndustry;
    source = "haystack";
    confidence = 0.92;
  } else if (autoRoutingId) {
    industryId = autoRoutingId;
    source = "catalog";
    confidence = autoIndustry?.confidence ?? 0.8;
  } else if (ARCHETYPE_STOCK_MAP[archetypeId]) {
    industryId = ARCHETYPE_STOCK_MAP[archetypeId]!;
    source = "archetype";
    confidence = 0.65;
  } else {
    industryId = "business";
    source = "default";
    confidence = 0.5;
  }

  const industryMeta = ROUTING_INDUSTRY_HINTS[industryId];
  const industryLabel =
    industryMeta?.label ??
    (autoIndustry && autoIndustry.industryId !== "business"
      ? autoIndustry.profile.label
      : def.label);

  return {
    industryId,
    source,
    confidence,
    archetypeId,
    industryLabel,
    imageHints: industryMeta?.imageHints ?? [...def.imageHints],
  };
}

export function resolveWebsiteIndustryId(params: WebsiteIndustryInput): string {
  return resolveWebsiteIndustry(params).industryId;
}

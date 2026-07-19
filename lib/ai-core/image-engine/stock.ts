/**
 * Curated high-quality Unsplash photography by industry + role.
 * Used when AI image providers are unavailable — never SVG placeholders for photos.
 */

import type { CoreAssetRole } from "@/lib/ai-core/layers/types";

type StockPack = Partial<Record<CoreAssetRole | string, string[]>>;

function u(id: string, w = 1600): string {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=82`;
}

/** Industry → role → Unsplash photo paths (photo-…). */
const STOCK: Record<string, StockPack> = {
  tourism: {
    hero: [u("photo-1469854523086-cc02fe5d8800"), u("photo-1476514525535-07fb3b4ae5f1")],
    section: [u("photo-1507525428034-b723cf961d3e"), u("photo-1488646953014-85cb44e25828")],
    product: [u("photo-1530521954074-e64f6810b32d")],
    service: [u("photo-1436491865332-7a61a109cc05")],
    background: [u("photo-1506905925346-21bda4d32df4")],
    gallery: [u("photo-1501785888041-af3ef285b470"), u("photo-1519681393784-d120267933ba")],
  },
  restaurant: {
    hero: [u("photo-1414235077428-338989a2e8c0"), u("photo-1517248135467-4c7edcad34c4")],
    section: [u("photo-1504674900247-0877df9cc836"), u("photo-1559339352-11d035aa65de")],
    product: [u("photo-1540189549336-e6e99c3679fe")],
    service: [u("photo-1550966871-3ed3cdb5ed0c")],
    background: [u("photo-1555396273-367ea4eb4db5")],
    gallery: [u("photo-1559339352-11d035aa65de"), u("photo-1466978913421-dad2ebd01d17")],
  },
  "real-estate": {
    hero: [u("photo-1600596542815-ffad4c1539a9"), u("photo-1600585154340-be6161a56a0c")],
    section: [u("photo-1600607687939-ce8a6c25118c"), u("photo-1560448204-e02f11c3d0e2")],
    product: [u("photo-1600566753190-17f0baa2a6c3")],
    service: [u("photo-1560518883-ce09059eeffa")],
    background: [u("photo-1493809842364-78817add7ffb")],
    gallery: [u("photo-1600585154526-990dced4db0d"), u("photo-1600047509807-ba8f99d2cd00")],
  },
  saas: {
    hero: [u("photo-1551434678-e076c223a6922"), u("photo-1460925895917-afdab827c52f")],
    section: [u("photo-1553877522-43269d4ea984"), u("photo-1517245386807-bb43f82c33c4")],
    product: [u("photo-1551288049-bebda4e38f71")],
    service: [u("photo-1522071820081-009f0129c71c")],
    background: [u("photo-1451187580459-43490279c0fa")],
    gallery: [u("photo-1519389950473-47ba0277781c"), u("photo-1504384308090-c894fdcc538d")],
  },
  ecommerce: {
    hero: [u("photo-1441986300917-64674bd600d8"), u("photo-1472851294608-062f824d29cc")],
    section: [u("photo-1483985988355-763728e1935b"), u("photo-1523275335684-37898b6baf30")],
    product: [u("photo-1526170375885-4d8ecf77b99f")],
    service: [u("photo-1556742049-0cfed4f6a45d")],
    background: [u("photo-1445205170230-053b83016050")],
    gallery: [u("photo-1556740738-b6a63e27c4df"), u("photo-1607083206869-4c7672e72a8a")],
  },
  automotive: {
    hero: [u("photo-1492144534655-ae79c964c9d7"), u("photo-1503376780353-7e6692767b70")],
    section: [u("photo-1542362567-b07e54358753"), u("photo-1485291571150-772bcfc10da5")],
    product: [u("photo-1544636331-e26879cd4d9b")],
    service: [u("photo-1486262715619-67b85e0b08d3")],
    background: [u("photo-1493238792120-0d746b213b5e")],
    gallery: [u("photo-1502877338538-ec513f5b8c4c"), u("photo-1511919884226-fd3cad54694b")],
  },
  clinic: {
    hero: [u("photo-1519494026892-80bbd2d6fd0d"), u("photo-1576091160399-112ba8d25d1d")],
    section: [u("photo-1631217868264-e5b90bb7e133"), u("photo-1584820927498-cfe4941b8a57")],
    product: [u("photo-1579684385127-1ef15d508118")],
    service: [u("photo-1559839734-2b71ea197ec2")],
    background: [u("photo-1516549655169-df83a0774514")],
    gallery: [u("photo-1666214280557-f1b5022eb634"), u("photo-1576091160550-2173dba999ef")],
  },
  education: {
    hero: [u("photo-1523050854058-8df90110c9f1"), u("photo-1509062522246-3755977927d7")],
    section: [u("photo-1524178232363-1fb2b075b655"), u("photo-1427504494785-3a97de334f38")],
    product: [u("photo-1434030216411-0b793f4b4173")],
    service: [u("photo-1523240795612-9a054b0db644")],
    background: [u("photo-1497633762265-9d179a990aa6")],
    gallery: [u("photo-1522202176988-66273c2fd55f"), u("photo-1516321318423-f06f85e504b3")],
  },
  agency: {
    hero: [u("photo-1542744173-8e7e53415bb5"), u("photo-1552664730-d307ca884978")],
    section: [u("photo-1600880292203-757bb62b4baf"), u("photo-1556761175-5973dc0f32e7")],
    product: [u("photo-1561070791-2526d30994b5")],
    service: [u("photo-1553877522-43269d4ea984")],
    background: [u("photo-1497366216548-37526070297c")],
    gallery: [u("photo-1522071820081-009f0129c71c"), u("photo-1559136555-9303baea8ebd")],
    testimonial: [u("photo-1507003211169-0a1dd7228f2d", 800), u("photo-1494790108377-be9c29b29330", 800)],
  },
  finance: {
    hero: [u("photo-1554224155-6726b3ff858f"), u("photo-1460925895917-afdab827c52f")],
    section: [u("photo-1551836022-d5d88e9218df"), u("photo-1454165804606-c3d57bc86b40")],
    product: [u("photo-1551288049-bebda4e38f71")],
    service: [u("photo-1600880292089-90a7e086ee0c")],
    background: [u("photo-1486406146926-c627a92ad1ab")],
    gallery: [u("photo-1557804506-669a67965ba0"), u("photo-1507679799987-c73779587ccf")],
    testimonial: [u("photo-1472099645785-5658abf4ff4e", 800), u("photo-1438761681033-6461ffad8d80", 800)],
  },
  business: {
    hero: [u("photo-1497366811353-6870744d04b2"), u("photo-1486406146926-c627a92ad1ab")],
    section: [u("photo-1454165804606-c3d57bc86b40"), u("photo-1521737711867-e3b97375f902")],
    product: [u("photo-1556761175-b413da4baf72")],
    service: [u("photo-1600880292089-90a7e086ee0c")],
    background: [u("photo-1497215728101-856f4ea42174")],
    gallery: [u("photo-1557804506-669a67965ba0"), u("photo-1542744173-05336fcc7ad4")],
    testimonial: [u("photo-1500648767791-00dcc994a43e", 800), u("photo-1544005313-94ddf0286df2", 800)],
  },
};

// Ensure every pack has testimonial portraits (premium stock fallback).
for (const key of Object.keys(STOCK)) {
  const pack = STOCK[key]!;
  if (!pack.testimonial?.length) {
    pack.testimonial = [
      u("photo-1507003211169-0a1dd7228f2d", 800),
      u("photo-1494790108377-be9c29b29330", 800),
    ];
  }
}

function resolveIndustry(industry?: string | null): string {
  const raw = (industry || "business").toLowerCase().replace(/[_\s]+/g, "-");
  if (raw in STOCK) return raw;
  if (raw.includes("tour") || raw.includes("travel")) return "tourism";
  if (raw.includes("restaurant") || raw.includes("food")) return "restaurant";
  if (raw.includes("real") || raw.includes("estate")) return "real-estate";
  if (raw.includes("saas") || raw.includes("software") || raw.includes("tech")) {
    return "saas";
  }
  if (raw.includes("ecom") || raw.includes("shop")) return "ecommerce";
  if (raw.includes("auto") || raw.includes("car")) return "automotive";
  if (raw.includes("clinic") || raw.includes("health")) return "clinic";
  if (raw.includes("school") || raw.includes("education")) return "education";
  if (raw.includes("agency") || raw.includes("studio")) return "agency";
  if (raw.includes("financ") || raw.includes("bank") || raw.includes("invest")) {
    return "finance";
  }
  return "business";
}

/**
 * Pick a curated premium stock URL for an asset role.
 */
export function resolvePremiumStockUrl(params: {
  industry?: string | null;
  role: string;
  seed?: string;
}): string {
  const pack = STOCK[resolveIndustry(params.industry)] ?? STOCK.business;
  const roleKey = params.role in pack ? params.role : "hero";
  const list =
    pack[roleKey] ||
    pack.hero ||
    STOCK.business.hero || [
      u("photo-1497366811353-6870744d04b2"),
    ];
  let hash = 0;
  const seed = params.seed || params.role;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash + seed.charCodeAt(i) * (i + 1)) % 997;
  }
  return list[hash % list.length]!;
}

export function isPremiumStockUrl(url: string | null | undefined): boolean {
  return Boolean(url?.includes("images.unsplash.com"));
}

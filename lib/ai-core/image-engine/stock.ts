/**
 * Curated high-quality Unsplash photography by industry + role.
 * Used when AI image providers are unavailable — never SVG placeholders for photos.
 */

import type { CoreAssetRole } from "@/lib/ai-core/layers/types";
import { optimizePhotoUrlForRole } from "@/lib/ai-core/image-engine/optimize";
import {
  AUTOMOTIVE_VEHICLE_PHOTO_IDS,
  resolveStockIndustryForRole,
} from "@/lib/ai-core/image-engine/industry-slot-policy";

type StockPack = Partial<Record<CoreAssetRole | string, string[]>>;

function u(id: string, w = 1920, q = 88): string {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=${q}`;
}

function heroU(id: string): string {
  return u(id, 2400, 90);
}

function portraitU(id: string): string {
  return u(id, 960, 88);
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
    hero: [u("photo-1551434678-e076c223a692"), u("photo-1460925895917-afdab827c52f")],
    section: [u("photo-1553877522-43269d4ea984"), u("photo-1517245386807-bb43f82c33c4")],
    product: [u("photo-1551288049-bebda4e38f71")],
    service: [u("photo-1559136555-9303baea8ebd")],
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
  fashion: {
    hero: [
      heroU("photo-1515372039744-b8f02a3ae446"),
      heroU("photo-1515886657613-9f3515b0c78f"),
      heroU("photo-1483985988355-763728e1935b"),
    ],
    section: [
      u("photo-1445205170230-053b83016050"),
      u("photo-1617137968427-85924c800a22"),
      u("photo-1558769132-cb1aea458c5e"),
    ],
    product: [
      u("photo-1558618666-fcd25c85cd64"),
      u("photo-1594633312681-425c7b97ccd1"),
      u("photo-1556905055-8f358a7a47b2"),
    ],
    service: [
      u("photo-1496747611176-843222e1e57c"),
      u("photo-1509631179647-0177331693ae"),
    ],
    background: [heroU("photo-1591047139829-d91aecb6caea")],
    gallery: [
      u("photo-1515372039744-b8f02a3ae446"),
      u("photo-1515886657613-9f3515b0c78f"),
      u("photo-1496747611176-843222e1e57c"),
      u("photo-1509631179647-0177331693ae"),
      u("photo-1558618666-fcd25c85cd64"),
    ],
  },
  automotive: {
    hero: [u("photo-1492144534655-ae79c964c9d7"), u("photo-1503376780353-7e6692767b70")],
    section: [u("photo-1542362567-b07e54358753"), u("photo-1485291571150-772bcfc10da5")],
    product: [u("photo-1544636331-e26879cd4d9b")],
    service: [u("photo-1486262715619-67b85e0b08d3")],
    background: [u("photo-1493238792120-0d746b213b5e")],
    gallery: [u("photo-1502877338538-ec513f5b8c4c"), u("photo-1511919884226-fd3cad54694b")],
  },
  law: {
    hero: [heroU("photo-1589829545856-d10d557cf57f"), heroU("photo-1450101499163-c8848c66ca85")],
    section: [u("photo-1454165804606-c3d57bc86b40"), u("photo-1521791136064-7986c2920216")],
    product: [u("photo-1505663494775-6b4c4e8e8b0e")],
    service: [u("photo-1554224155-6726b3ff858f")],
    background: [u("photo-1521791136064-7986c2920216")],
    gallery: [
      u("photo-1450101499163-c8848c66ca85"),
      u("photo-1589829545856-d10d557cf57f"),
      u("photo-1454165804606-c3d57bc86b40"),
    ],
    testimonial: [
      portraitU("photo-1560250097-0b93528c311a"),
      portraitU("photo-1472099645785-5658abf4ff4e"),
    ],
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
    gallery: [u("photo-1524178232363-1fb2b075b655"), u("photo-1516321318423-f06f85e504b3")],
  },
  agency: {
    hero: [u("photo-1497366811353-6870744d04b2"), u("photo-1486406146926-c627a92ad1ab")],
    section: [u("photo-1600880292203-757bb62b4baf"), u("photo-1542744173-05336fcc7ad4")],
    product: [u("photo-1561070791-2526d30994b5")],
    service: [u("photo-1553877522-43269d4ea984")],
    background: [u("photo-1497366216548-37526070297c")],
    gallery: [u("photo-1559136555-9303baea8ebd"), u("photo-1553877522-43269d4ea984")],
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
  furniture: {
    hero: [u("photo-1555041469-a586c61ea9bc"), u("photo-1616486338812-3dadae4b4ace")],
    section: [u("photo-1618221195710-dd6b41faaea6"), u("photo-1615529328331-f8917597711f")],
    product: [u("photo-1586023492125-27b2c045efd7"), u("photo-1615529328331-f8917597711f")],
    service: [u("photo-1616486338812-3dadae4b4ace"), u("photo-1618221195710-dd6b41faaea6")],
    background: [u("photo-1616486338812-3dadae4b4ace")],
    gallery: [u("photo-1618221195710-dd6b41faaea6"), u("photo-1615529328331-f8917597711f")],
  },
  technology: {
    hero: [u("photo-1498050108023-c5249f4df085"), u("photo-1518770660439-4636190af475")],
    section: [u("photo-1551434678-e076c223a692"), u("photo-1517245386807-bb43f82c33c4")],
    product: [u("photo-1587825140708-dfaf3ae4be57"), u("photo-1550751827-4bd374c3f58b")],
    service: [u("photo-1559136555-9303baea8ebd"), u("photo-1451187580459-43490279c0fa")],
    background: [u("photo-1451187580459-43490279c0fa")],
    gallery: [u("photo-1519389950473-47ba0277781c"), u("photo-1504384308090-c894fdcc538d")],
  },
  "electronics-retail": {
    hero: [heroU("photo-1511707171634-5f897ff02aa9"), heroU("photo-1592750475338-74b7b21085ab")],
    section: [u("photo-1556656793-08538906a9f8"), u("photo-1574944985070-8f3ebc6b79d2")],
    product: [u("photo-1510557880182-3d4d3cba35a5"), u("photo-1601784551446-20c9e07cdbdb")],
    service: [u("photo-1616348436168-de43ad0db179"), u("photo-1526170375885-4d8ecf77b99f")],
    background: [heroU("photo-1556656793-08538906a9f8")],
    gallery: [
      u("photo-1592750475338-74b7b21085ab"),
      u("photo-1511707171634-5f897ff02aa9"),
      u("photo-1574944985070-8f3ebc6b79d2"),
      u("photo-1601784551446-20c9e07cdbdb"),
      u("photo-1510557880182-3d4d3cba35a5"),
    ],
  },
  gaming: {
    hero: [u("photo-1612287230202-66b923aee25f"), u("photo-1542751371-adc38448a05e")],
    section: [u("photo-1615436816607-7f0b7d28ea61"), u("photo-1593305844193-dabf95893a2c")],
    product: [u("photo-1552820728-8b1bb9733b0c"), u("photo-1545231167-9a1ac658a558")],
    service: [u("photo-1538481199705-c710c4e965fc")],
    background: [u("photo-1511512578047-dfb367046420")],
    gallery: [u("photo-1627856015618-181a60b2bb4e"), u("photo-1560419015-7b427ffe9636")],
  },
  business: {
    hero: [u("photo-1497366811353-6870744d04b2"), u("photo-1486406146926-c627a92ad1ab")],
    section: [u("photo-1454165804606-c3d57bc86b40"), u("photo-1551288049-bebda4e38f71")],
    product: [u("photo-1554224155-6726b3ff858f")],
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
      portraitU("photo-1507003211169-0a1dd7228f2d"),
      portraitU("photo-1494790108377-be9c29b29330"),
    ];
  }
}

function resolveIndustry(
  industry?: string | null,
  routingIndustryId?: string | null,
): string {
  const preferred = (routingIndustryId || industry || "business")
    .toLowerCase()
    .replace(/[_\s]+/g, "-");
  if (preferred in STOCK) return preferred;
  const raw = (industry || "business").toLowerCase().replace(/[_\s]+/g, "-");
  if (raw in STOCK) return raw;
  if (raw.includes("tour") || raw.includes("travel") || raw.includes("tourism")) {
    return "tourism";
  }
  if (raw.includes("restaurant") || raw.includes("food") || raw.includes("dining")) {
    return "restaurant";
  }
  if (raw.includes("real") || raw.includes("estate") || raw.includes("property")) {
    return "real-estate";
  }
  if (raw.includes("clinic") || raw.includes("health") || raw.includes("medical")) {
    return "clinic";
  }
  if (raw.includes("saas") || raw.includes("software") || raw.includes("tech")) {
    return "saas";
  }
  if (raw.includes("ecom")) return "ecommerce";
  if (
    raw.includes("fashion") ||
    raw.includes("clothing") ||
    raw.includes("apparel") ||
    raw.includes("boutique") ||
    raw.includes("dress") ||
    /ملابس|أزياء|موضة|فستان|فساتين|بوتيك/.test(raw)
  ) {
    return "fashion";
  }
  if (/مفروشات|مفروشة|أثاث|غرف\s*نوم/.test(raw)) {
    return "furniture";
  }
  if (
    raw.includes("electronics-retail") ||
    raw.includes("smartphone") ||
    raw.includes("mobile-phone") ||
    raw.includes("phone-store") ||
    raw.includes("cell-phone") ||
    raw.includes("gadget") ||
    /موبايل|جوال|هواتف|هاتف|إلكترونيات|الكترونيات/.test(raw)
  ) {
    return "electronics-retail";
  }
  if (
    /\bmobile\b/.test(raw) &&
    (raw.includes("shop") ||
      raw.includes("store") ||
      raw.includes("retail") ||
      raw.includes("phone") ||
      raw.includes("repair") ||
      raw.includes("trade"))
  ) {
    return "electronics-retail";
  }
  if (raw.includes("shop") || raw.includes("store")) {
    if (raw.includes("furniture") || raw.includes("furnish")) return "furniture";
    if (
      raw.includes("fashion") ||
      raw.includes("clothing") ||
      raw.includes("apparel") ||
      raw.includes("boutique") ||
      /ملابس|أزياء|موضة/.test(raw)
    ) {
      return "fashion";
    }
    if (raw.includes("phone") || raw.includes("mobile") || raw.includes("gadget")) {
      return "electronics-retail";
    }
    return "ecommerce";
  }
  if (/\b(automotive|dealership|vehicle)\b/.test(raw) || /\bcar\b/.test(raw)) {
    return "automotive";
  }
  if (
    raw.includes("law") ||
    raw.includes("legal") ||
    raw.includes("attorney") ||
    raw.includes("lawyer") ||
    /محاماة|محاماه|محامي|قانوني|استشارات\s*قانونية/.test(raw)
  ) {
    return "law";
  }
  if (raw.includes("school") || raw.includes("education")) return "education";
  if (
    raw.includes("game") ||
    raw.includes("gaming") ||
    raw.includes("esport") ||
    raw.includes("ألعاب") ||
    raw.includes("العاب") ||
    raw.includes("جيمينج")
  ) {
    return "gaming";
  }
  if (raw.includes("agency") || raw.includes("studio")) return "agency";
  if (raw.includes("financ") || raw.includes("bank") || raw.includes("invest")) {
    return "finance";
  }
  if (raw.includes("furniture") || raw.includes("sofa") || raw.includes("bedroom")) {
    return "furniture";
  }
  if (
    raw.includes("technology") ||
    raw.includes("computer") ||
    (raw.includes("tech") && !raw.includes("restaurant"))
  ) {
    return "technology";
  }
  return "business";
}

/** Map free-form industry text to a curated stock pack id. */
export function resolveStockIndustryId(
  industry?: string | null,
  routingIndustryId?: string | null,
): string {
  return resolveIndustry(industry, routingIndustryId);
}

export function extractStockPhotoId(url: string): string | null {
  const match = url.match(/photo-\d+-[a-f0-9]+/i);
  return match ? match[0]! : null;
}

export function listStockPhotoIds(packId: string): string[] {
  const pack = STOCK[packId];
  if (!pack) return [];
  const ids = new Set<string>();
  for (const urls of Object.values(pack)) {
    if (!urls) continue;
    for (const url of urls) {
      const id = extractStockPhotoId(url);
      if (id) ids.add(id);
    }
  }
  return [...ids];
}

export function listStockUrlsForRole(packId: string, role: string): string[] {
  const pack =
    STOCK[packId] ??
    STOCK.business;
  const roleKey = role in pack ? role : "hero";
  return [
    ...(pack[roleKey] ?? []),
    ...(pack.hero ?? []),
    ...(STOCK.business.hero ?? []),
  ];
}

/** Dominant visual packs — photos must not leak into unrelated industries. */
const CROSS_PACK_ISOLATION = [
  "automotive",
  "restaurant",
  "clinic",
  "fashion",
  "electronics-retail",
  "law",
] as const;

const forbiddenPhotoCache = new Map<string, ReadonlySet<string>>();

function forbiddenPhotoIdsForIndustry(industryPackId: string): ReadonlySet<string> {
  const cached = forbiddenPhotoCache.get(industryPackId);
  if (cached) return cached;

  const forbidden = new Set<string>();
  for (const packId of CROSS_PACK_ISOLATION) {
    if (packId === industryPackId) continue;
    for (const id of listStockPhotoIds(packId)) forbidden.add(id);
  }
  if (industryPackId !== "automotive") {
    for (const id of AUTOMOTIVE_VEHICLE_PHOTO_IDS) forbidden.add(id);
  }

  const frozen = Object.freeze(forbidden);
  forbiddenPhotoCache.set(industryPackId, frozen);
  return frozen;
}

export function isForbiddenStockUrlForIndustry(
  url: string | null | undefined,
  routingIndustryId?: string | null,
): boolean {
  if (!url?.includes("images.unsplash.com")) {
    return false;
  }
  const photoId = extractStockPhotoId(url);
  if (!photoId) return false;

  const packId = resolveStockIndustryId(routingIndustryId, routingIndustryId);
  return forbiddenPhotoIdsForIndustry(packId).has(photoId);
}

export function validateStockUrlForIndustry(params: {
  url: string;
  routingIndustryId?: string | null;
  role?: string;
  strictPackMatch?: boolean;
}): { ok: boolean; reason?: string } {
  const packId = resolveStockIndustryId(
    params.routingIndustryId,
    params.routingIndustryId,
  );

  if (isForbiddenStockUrlForIndustry(params.url, packId)) {
    return { ok: false, reason: "cross-industry-stock-photo" };
  }

  if (params.strictPackMatch && params.role) {
    const allowed = listStockUrlsForRole(packId, params.role);
    const photoId = extractStockPhotoId(params.url);
    const inPack = allowed.some(
      (candidate) => extractStockPhotoId(candidate) === photoId,
    );
    if (!inPack) {
      return { ok: false, reason: "outside-industry-pack" };
    }
  }

  return { ok: true };
}

function orderStockCandidates(
  list: string[],
  semanticQuery: string | null | undefined,
  seed: string,
): string[] {
  const query = (semanticQuery || "").toLowerCase();
  if (query.length > 8) {
    const tokens = query
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 4)
      .slice(0, 8);
    if (tokens.length > 0) {
      const scored = list.map((url, index) => {
        const urlHay = url.toLowerCase();
        const score = tokens.reduce(
          (sum, t) => sum + (urlHay.includes(t) ? 1 : 0),
          0,
        );
        return { url, score, index };
      });
      scored.sort((a, b) => b.score - a.score || a.index - b.index);
      if (scored[0]!.score > 0) {
        return scored.map((row) => row.url);
      }
    }
  }

  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash + seed.charCodeAt(i) * (i + 1)) % 997;
  }
  const start = hash % list.length;
  return [...list.slice(start), ...list.slice(0, start)];
}

/**
 * Pick a curated premium stock URL for an asset role.
 */
export function resolvePremiumStockUrl(params: {
  industry?: string | null;
  routingIndustryId?: string | null;
  role: string;
  seed?: string;
  /** Semantic query from ImageSpecification — selects most relevant stock variant. */
  semanticQuery?: string | null;
}): string {
  const routingId = resolveStockIndustryId(params.industry, params.routingIndustryId);
  const packId = resolveStockIndustryForRole(routingId, params.role);
  const pack =
    STOCK[resolveIndustry(params.industry, packId)] ??
    STOCK[packId] ??
    STOCK.business;
  const roleKey = params.role in pack ? params.role : "hero";
  const list =
    pack[roleKey] ||
    pack.hero ||
    STOCK.business.hero || [
      u("photo-1497366811353-6870744d04b2"),
    ];

  const seed = params.seed || params.semanticQuery || params.role;
  const ordered = orderStockCandidates(list, params.semanticQuery, seed);
  const strictHero = params.role.toLowerCase() === "hero";

  for (const candidate of ordered) {
    if (isForbiddenStockUrlForIndustry(candidate, routingId)) continue;
    const validation = validateStockUrlForIndustry({
      url: candidate,
      routingIndustryId: routingId,
      role: params.role,
      strictPackMatch: strictHero,
    });
    if (validation.ok) {
      return optimizePhotoUrlForRole(
        normalizePremiumStockUrl(candidate),
        params.role,
      );
    }
  }

  const fallback = ordered[0] ?? list[0]!;
  return optimizePhotoUrlForRole(
    normalizePremiumStockUrl(fallback),
    params.role,
  );
}

export function isPremiumStockUrl(url: string | null | undefined): boolean {
  return Boolean(url?.includes("images.unsplash.com"));
}

/** Unsplash photos removed from CDN — remap legacy project URLs at read/inject time. */
const REMOVED_UNSPLASH_PHOTOS: Record<string, string> = {
  "photo-1542744173-8e7e53415bb5": "photo-1497366811353-6870744d04b2",
  "photo-1551434678-e076c223a6922": "photo-1551434678-e076c223a692",
  "photo-1552664730-d307ca884978": "photo-1486406146926-c627a92ad1ab",
  "photo-1522071820081-009f0129c71c": "photo-1559136555-9303baea8ebd",
  "photo-1556761175-b413da4baf72": "photo-1554224155-6726b3ff858f",
  "photo-1556761175-5973dc0f32e7": "photo-1542744173-05336fcc7ad4",
  "photo-1521737711867-e3b97375f902": "photo-1551288049-bebda4e38f71",
  "photo-1522202176988-66273c2fd55f": "photo-1524178232363-1fb2b075b655",
  "photo-1512941937669-90a1da58e9c9": "photo-1510557880182-3d4d3cba35a5",
  "photo-1580910051074-3eb6948865f6": "photo-1616348436168-de43ad0db179",
  "photo-1523206488230-f1aba96dfc4b": "photo-1574944985070-8f3ebc6b79d2",
  "photo-1565849902269-9b043d824327": "photo-1601784551446-20c9e07cdbdb",
  "photo-1592899677977-9c10ca58863d": "photo-1526170375885-4d8ecf77b99f",
  "photo-1483986760294-4eac4a231fad": "photo-1515372039744-b8f02a3ae446",
  "photo-1490481651871-ab68de25d574": "photo-1515886657613-9f3515b0c78f",
  "photo-1469334031218-e982a37af51f": "photo-1496747611176-843222e1e57c",
  "photo-1529139574666-2a165a46a095": "photo-1558618666-fcd25c85cd64",
  "photo-1512436997691-7851f27f0f42": "photo-1594633312681-425c7b97ccd1",
  "photo-1611974765053-428805b4e726": "photo-1559136555-9303baea8ebd",
  "photo-1615873968403-b1128c629a9e": "photo-1615529328331-f8917597711f",
  "photo-1631049307904-41a163c20979": "photo-1586023492125-27b2c045efd7",
};

function extractUnsplashPhotoId(url: string): string | null {
  const match = url.match(/images\.unsplash\.com\/(photo-[^/?]+)/i);
  return match?.[1] ?? null;
}

/**
 * Normalize premium stock URLs — fix known typos and replace removed Unsplash photos.
 * Used when parsing site-images for preview and when hydrating legacy blueprints.
 */
export function normalizePremiumStockUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;

  const photoId = extractUnsplashPhotoId(trimmed);
  if (!photoId) return trimmed;

  const replacement = REMOVED_UNSPLASH_PHOTOS[photoId];
  if (!replacement) return trimmed;

  return trimmed.replace(photoId, replacement);
}

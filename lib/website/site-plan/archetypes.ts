import type { WebsiteCapabilityId } from "@/lib/website/builder/capabilities/types";
import type { SiteArchetypeId, SitePlanSection } from "@/lib/website/site-plan/types";

export type SiteArchetypeDefinition = {
  id: SiteArchetypeId;
  label: string;
  industryHints: string[];
  defaultPages: Array<{ name: string; path: string; purpose: string }>;
  defaultSections: SitePlanSection[];
  capabilities: WebsiteCapabilityId[];
  imageHints: string[];
};

const section = (
  id: string,
  pagePath: string,
  name: string,
  goal: string,
): SitePlanSection => ({
  id,
  pagePath,
  name,
  goal,
});

export const SITE_ARCHETYPE_REGISTRY: readonly SiteArchetypeDefinition[] = [
  {
    id: "real-estate",
    label: "Real Estate",
    industryHints: ["real estate", "property", "عقارات", "broker", "realtor"],
    defaultPages: [
      { name: "Home", path: "/", purpose: "Listings hero and trust" },
      { name: "Listings", path: "/listings", purpose: "Property catalog" },
      { name: "About", path: "/about", purpose: "Agency credibility" },
      { name: "Contact", path: "/contact", purpose: "Lead capture" },
    ],
    defaultSections: [
      section("hero", "/", "Hero", "Showcase premium listings"),
      section("featured-listings", "/", "Featured Listings", "Highlight properties"),
      section("agent-trust", "/", "Why Us", "Agency credentials"),
      section("testimonials", "/", "Testimonials", "Client proof"),
      section("contact-cta", "/", "Contact CTA", "Schedule viewing"),
    ],
    capabilities: ["forms", "maps", "gallery", "testimonials", "seo", "search"],
    imageHints: ["property exterior", "interior staging", "neighborhood"],
  },
  {
    id: "saas-b2b",
    label: "SaaS B2B",
    industryHints: ["saas", "b2b", "software", "platform", "اشتراك"],
    defaultPages: [
      { name: "Home", path: "/", purpose: "Product value proposition" },
      { name: "Pricing", path: "/pricing", purpose: "Plans and conversion" },
      { name: "About", path: "/about", purpose: "Company story" },
    ],
    defaultSections: [
      section("hero", "/", "Hero", "Clear product promise"),
      section("features", "/", "Features", "Core capabilities"),
      section("social-proof", "/", "Logos", "Customer logos"),
      section("pricing", "/pricing", "Pricing", "Tier comparison"),
      section("faq", "/", "FAQ", "Objection handling"),
    ],
    capabilities: ["pricing", "forms", "authentication", "dashboard", "seo", "analytics"],
    imageHints: ["product UI mockup", "team collaboration", "abstract tech"],
  },
  {
    id: "restaurant-local",
    label: "Restaurant / Local",
    industryHints: ["restaurant", "cafe", "food", "مطعم", "dining"],
    defaultPages: [
      { name: "Home", path: "/", purpose: "Atmosphere and menu highlights" },
      { name: "Menu", path: "/menu", purpose: "Dishes and pricing" },
      { name: "Contact", path: "/contact", purpose: "Reservations and location" },
    ],
    defaultSections: [
      section("hero", "/", "Hero", "Signature dishes"),
      section("menu-highlights", "/", "Menu", "Popular items"),
      section("gallery", "/", "Gallery", "Ambiance photos"),
      section("reservation", "/contact", "Reserve", "Booking CTA"),
      section("location", "/contact", "Location", "Map and hours"),
    ],
    capabilities: ["booking", "gallery", "maps", "forms", "seo"],
    imageHints: ["food photography", "restaurant interior", "chef"],
  },
  {
    id: "electronics-retail",
    label: "Electronics / Mobile Retail",
    industryHints: [
      "smartphone",
      "smartphones",
      "mobile phone",
      "phone store",
      "electronics",
      "gadget",
      "repair service",
      "trade-in",
      "installment",
      "جوالات",
      "جوال",
      "موبايل",
      "هواتف",
      "إلكترونيات",
      "الكترونيات",
    ],
    defaultPages: [
      { name: "Home", path: "/", purpose: "Latest devices and offers" },
      { name: "Products", path: "/products", purpose: "Phone catalog" },
      { name: "Services", path: "/services", purpose: "Repair and trade-in" },
      { name: "Contact", path: "/contact", purpose: "Store and support" },
    ],
    defaultSections: [
      section("hero", "/", "Hero", "Flagship devices and promos"),
      section("featured-phones", "/", "Featured Phones", "Best sellers"),
      section("trade-in", "/services", "Trade-in", "Upgrade program"),
      section("repair", "/services", "Repair", "Service center"),
      section("installments", "/", "Financing", "Payment plans"),
      section("reviews", "/", "Reviews", "Customer proof"),
    ],
    capabilities: [
      "products",
      "payments",
      "orders",
      "reviews",
      "forms",
      "maps",
      "seo",
    ],
    imageHints: ["smartphone product shot", "tech retail interior", "repair bench"],
  },
  {
    id: "fashion-retail",
    label: "Fashion / Boutique",
    industryHints: [
      "fashion",
      "clothing",
      "boutique",
      "dress",
      "apparel",
      "wear",
      "collection",
      "أزياء",
      "ملابس",
      "فستان",
      "فساتين",
      "بوتيك",
      "موضة",
    ],
    defaultPages: [
      { name: "Home", path: "/", purpose: "New collection hero" },
      { name: "Shop", path: "/shop", purpose: "Catalog and sizes" },
      { name: "About", path: "/about", purpose: "Brand story" },
      { name: "Contact", path: "/contact", purpose: "Boutique contact" },
    ],
    defaultSections: [
      section("hero", "/", "Hero", "Seasonal collection"),
      section("lookbook", "/", "Lookbook", "Styled outfits"),
      section("collections", "/shop", "Collections", "Categories"),
      section("sizes-fit", "/shop", "Sizes", "Fit guide"),
      section("reviews", "/", "Reviews", "Customer photos"),
    ],
    capabilities: [
      "products",
      "payments",
      "orders",
      "reviews",
      "newsletter",
      "gallery",
      "seo",
    ],
    imageHints: ["fashion lookbook", "boutique interior", "garment detail"],
  },
  {
    id: "ecommerce-dropshipping",
    label: "E-commerce",
    industryHints: ["ecommerce", "dropship", "online store", "متجر إلكتروني"],
    defaultPages: [
      { name: "Home", path: "/", purpose: "Featured products" },
      { name: "Shop", path: "/shop", purpose: "Product grid" },
      { name: "Contact", path: "/contact", purpose: "Support" },
    ],
    defaultSections: [
      section("hero", "/", "Hero", "Seasonal offer"),
      section("products", "/shop", "Products", "Best sellers"),
      section("benefits", "/", "Benefits", "Shipping and guarantees"),
      section("reviews", "/", "Reviews", "Social proof"),
    ],
    capabilities: ["products", "payments", "orders", "reviews", "newsletter", "seo"],
    imageHints: ["product on white", "lifestyle product shot"],
  },
  {
    id: "mobile-app-landing",
    label: "Mobile App",
    industryHints: ["mobile app", "ios", "android", "تطبيق", "app store"],
    defaultPages: [
      { name: "Home", path: "/", purpose: "App download conversion" },
      { name: "Features", path: "/features", purpose: "Capability breakdown" },
    ],
    defaultSections: [
      section("hero", "/", "Hero", "App store CTAs"),
      section("app-screens", "/", "Screens", "UI showcase"),
      section("features", "/features", "Features", "Key benefits"),
      section("download-cta", "/", "Download", "Store badges"),
    ],
    capabilities: ["forms", "testimonials", "faq", "seo", "analytics"],
    imageHints: ["phone mockup", "app UI screenshot", "no automotive"],
  },
  {
    id: "general-business",
    label: "General Business",
    industryHints: [],
    defaultPages: [
      { name: "Home", path: "/", purpose: "Business overview" },
      { name: "Services", path: "/services", purpose: "Offerings" },
      { name: "Contact", path: "/contact", purpose: "Lead capture" },
    ],
    defaultSections: [
      section("hero", "/", "Hero", "Value proposition"),
      section("services", "/services", "Services", "What we offer"),
      section("about", "/", "About", "Trust and team"),
      section("contact", "/contact", "Contact", "Get in touch"),
    ],
    capabilities: ["forms", "seo", "testimonials", "faq"],
    imageHints: ["professional team", "office", "service context"],
  },
] as const;

export function getSiteArchetypeDefinition(
  id: SiteArchetypeId,
): SiteArchetypeDefinition {
  return (
    SITE_ARCHETYPE_REGISTRY.find((a) => a.id === id) ??
    SITE_ARCHETYPE_REGISTRY.find((a) => a.id === "general-business")!
  );
}

export function suggestCapabilitiesForArchetype(
  archetypeId: SiteArchetypeId,
): WebsiteCapabilityId[] {
  return [...getSiteArchetypeDefinition(archetypeId).capabilities];
}

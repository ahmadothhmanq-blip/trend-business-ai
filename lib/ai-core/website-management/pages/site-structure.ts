/**
 * Phase 1 — Industry site structure (pages, nav, footer, sitemap).
 */

import type { SiteStructurePlan, ManagedPageDef } from "@/lib/ai-core/website-management/types";

function pages(
  ...defs: Array<[string, string, string, string, string[]]>
): ManagedPageDef[] {
  return defs.map(([route, path, label, purpose, sections]) => ({
    route,
    path,
    label,
    purpose,
    sections,
  }));
}

const STRUCTURES: Record<string, SiteStructurePlan> = {
  restaurant: {
    industryId: "restaurant",
    businessType: "Restaurant",
    pages: pages(
      ["/", "app/page.tsx", "Home", "Landing experience", ["hero", "menu-highlights", "story"]],
      ["/menu", "app/menu/page.tsx", "Menu", "Full menu with categories", ["menu"]],
      ["/about", "app/about/page.tsx", "About", "Brand story", ["about"]],
      ["/gallery", "app/gallery/page.tsx", "Gallery", "Atmosphere gallery", ["gallery"]],
      ["/reservation", "app/reservation/page.tsx", "Reservation", "Book a table", ["booking"]],
      ["/contact", "app/contact/page.tsx", "Contact", "Location & inquire", ["contact", "map"]],
    ),
    navLinks: [
      { href: "/menu", label: "Menu" },
      { href: "/about", label: "About" },
      { href: "/gallery", label: "Gallery" },
      { href: "/reservation", label: "Reserve" },
      { href: "/contact", label: "Contact" },
    ],
    footerLinks: [
      { href: "/menu", label: "Menu" },
      { href: "/reservation", label: "Reservations" },
      { href: "/contact", label: "Contact" },
      { href: "/about", label: "About" },
    ],
    sitemapPaths: ["/", "/menu", "/about", "/gallery", "/reservation", "/contact"],
  },
  automotive: {
    industryId: "automotive",
    businessType: "Automotive dealership",
    pages: pages(
      ["/", "app/page.tsx", "Home", "Showroom landing", ["hero", "showcase"]],
      ["/inventory", "app/inventory/page.tsx", "Inventory", "Vehicle listings", ["inventory"]],
      ["/models", "app/models/page.tsx", "Models", "Model collection", ["models"]],
      ["/services", "app/services/page.tsx", "Services", "Service & finance", ["services"]],
      ["/locations", "app/locations/page.tsx", "Locations", "Branches map", ["locations"]],
      ["/contact", "app/contact/page.tsx", "Contact", "Booking & inquire", ["contact", "booking"]],
    ),
    navLinks: [
      { href: "/inventory", label: "Inventory" },
      { href: "/models", label: "Models" },
      { href: "/services", label: "Services" },
      { href: "/locations", label: "Locations" },
      { href: "/contact", label: "Contact" },
    ],
    footerLinks: [
      { href: "/inventory", label: "Inventory" },
      { href: "/services", label: "Services" },
      { href: "/locations", label: "Locations" },
      { href: "/contact", label: "Contact" },
    ],
    sitemapPaths: [
      "/",
      "/inventory",
      "/models",
      "/services",
      "/locations",
      "/contact",
    ],
  },
  "real-estate": {
    industryId: "real-estate",
    businessType: "Real estate",
    pages: pages(
      ["/", "app/page.tsx", "Home", "Property showcase", ["hero", "listings"]],
      ["/listings", "app/listings/page.tsx", "Listings", "All properties", ["listings"]],
      ["/about", "app/about/page.tsx", "About", "Agency story", ["about"]],
      ["/services", "app/services/page.tsx", "Services", "Buyer & seller services", ["services"]],
      ["/contact", "app/contact/page.tsx", "Contact", "Schedule a viewing", ["contact"]],
    ),
    navLinks: [
      { href: "/listings", label: "Listings" },
      { href: "/services", label: "Services" },
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
    ],
    footerLinks: [
      { href: "/listings", label: "Properties" },
      { href: "/services", label: "Services" },
      { href: "/contact", label: "Contact" },
    ],
    sitemapPaths: ["/", "/listings", "/about", "/services", "/contact"],
  },
  ecommerce: {
    industryId: "ecommerce",
    businessType: "Online store",
    pages: pages(
      ["/", "app/page.tsx", "Home", "Store landing", ["hero", "collections"]],
      ["/shop", "app/shop/page.tsx", "Shop", "Product catalog", ["products"]],
      ["/about", "app/about/page.tsx", "About", "Brand story", ["about"]],
      ["/contact", "app/contact/page.tsx", "Contact", "Support", ["contact"]],
    ),
    navLinks: [
      { href: "/shop", label: "Shop" },
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
    ],
    footerLinks: [
      { href: "/shop", label: "Shop" },
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
    ],
    sitemapPaths: ["/", "/shop", "/about", "/contact"],
  },
  saas: {
    industryId: "saas",
    businessType: "Software company",
    pages: pages(
      ["/", "app/page.tsx", "Home", "Product landing", ["hero", "features"]],
      ["/about", "app/about/page.tsx", "About", "Company", ["about"]],
      ["/services", "app/services/page.tsx", "Services", "Solutions", ["services"]],
      ["/projects", "app/projects/page.tsx", "Projects", "Case studies", ["projects"]],
      ["/pricing", "app/pricing/page.tsx", "Pricing", "Plans", ["pricing"]],
      ["/contact", "app/contact/page.tsx", "Contact", "Talk to sales", ["contact"]],
    ),
    navLinks: [
      { href: "/services", label: "Services" },
      { href: "/projects", label: "Projects" },
      { href: "/pricing", label: "Pricing" },
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
    ],
    footerLinks: [
      { href: "/services", label: "Services" },
      { href: "/pricing", label: "Pricing" },
      { href: "/contact", label: "Contact" },
    ],
    sitemapPaths: [
      "/",
      "/about",
      "/services",
      "/projects",
      "/pricing",
      "/contact",
    ],
  },
  business: {
    industryId: "business",
    businessType: "Company",
    pages: pages(
      ["/", "app/page.tsx", "Home", "Corporate landing", ["hero", "services"]],
      ["/about", "app/about/page.tsx", "About", "Company story", ["about"]],
      ["/services", "app/services/page.tsx", "Services", "What we offer", ["services"]],
      ["/projects", "app/projects/page.tsx", "Projects", "Selected work", ["projects"]],
      ["/contact", "app/contact/page.tsx", "Contact", "Get in touch", ["contact"]],
    ),
    navLinks: [
      { href: "/about", label: "About" },
      { href: "/services", label: "Services" },
      { href: "/projects", label: "Projects" },
      { href: "/contact", label: "Contact" },
    ],
    footerLinks: [
      { href: "/about", label: "About" },
      { href: "/services", label: "Services" },
      { href: "/projects", label: "Projects" },
      { href: "/contact", label: "Contact" },
    ],
    sitemapPaths: ["/", "/about", "/services", "/projects", "/contact"],
  },
  agency: {
    industryId: "agency",
    businessType: "Creative agency",
    pages: pages(
      ["/", "app/page.tsx", "Home", "Studio landing", ["hero", "work"]],
      ["/about", "app/about/page.tsx", "About", "Studio", ["about"]],
      ["/services", "app/services/page.tsx", "Services", "Capabilities", ["services"]],
      ["/projects", "app/projects/page.tsx", "Projects", "Selected work", ["projects"]],
      ["/contact", "app/contact/page.tsx", "Contact", "Start a project", ["contact"]],
    ),
    navLinks: [
      { href: "/projects", label: "Work" },
      { href: "/services", label: "Services" },
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
    ],
    footerLinks: [
      { href: "/projects", label: "Work" },
      { href: "/services", label: "Services" },
      { href: "/contact", label: "Contact" },
    ],
    sitemapPaths: ["/", "/about", "/services", "/projects", "/contact"],
  },
  tourism: {
    industryId: "tourism",
    businessType: "Travel / Hotel",
    pages: pages(
      ["/", "app/page.tsx", "Home", "Destination landing", ["hero", "experiences"]],
      ["/about", "app/about/page.tsx", "About", "Our story", ["about"]],
      ["/services", "app/services/page.tsx", "Experiences", "Tours & stays", ["services"]],
      ["/gallery", "app/gallery/page.tsx", "Gallery", "Moments", ["gallery"]],
      ["/contact", "app/contact/page.tsx", "Contact", "Plan your trip", ["contact", "booking"]],
    ),
    navLinks: [
      { href: "/services", label: "Experiences" },
      { href: "/gallery", label: "Gallery" },
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
    ],
    footerLinks: [
      { href: "/services", label: "Experiences" },
      { href: "/gallery", label: "Gallery" },
      { href: "/contact", label: "Book" },
    ],
    sitemapPaths: ["/", "/about", "/services", "/gallery", "/contact"],
  },
};

const ALIASES: Record<string, string> = {
  restaurant: "restaurant",
  dining: "restaurant",
  automotive: "automotive",
  auto: "automotive",
  car: "automotive",
  "real-estate": "real-estate",
  realestate: "real-estate",
  property: "real-estate",
  ecommerce: "ecommerce",
  ecom: "ecommerce",
  shop: "ecommerce",
  store: "ecommerce",
  saas: "saas",
  software: "saas",
  technology: "saas",
  agency: "agency",
  creative: "agency",
  tourism: "tourism",
  hotel: "tourism",
  travel: "tourism",
  business: "business",
  corporate: "business",
  consulting: "business",
  finance: "business",
  clinic: "business",
  education: "business",
};

export function resolveSiteStructure(
  industryId?: string | null,
  promptHint?: string | null,
): SiteStructurePlan {
  const hay = `${industryId || ""} ${promptHint || ""}`.toLowerCase();
  for (const [alias, key] of Object.entries(ALIASES)) {
    if (hay.includes(alias.replace("-", " ")) || hay.includes(alias)) {
      return STRUCTURES[key] || STRUCTURES.business!;
    }
  }
  const key = ALIASES[(industryId || "business").toLowerCase()] || "business";
  return STRUCTURES[key] || STRUCTURES.business!;
}

export function listSiteStructureIndustries(): string[] {
  return Object.keys(STRUCTURES);
}

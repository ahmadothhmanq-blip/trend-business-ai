/**
 * City / local-market catalog for programmatic SEO.
 * Only published entries should enter sitemaps — drafts stay out of the index.
 */
export type CityDef = {
  slug: string;
  name: string;
  countrySlug: string;
  title: string;
  description: string;
  intent: string;
  status: "draft" | "published";
};

const CITIES: CityDef[] = [
  {
    slug: "san-francisco",
    name: "San Francisco",
    countrySlug: "united-states",
    title: "AI Business Platform for San Francisco Startups",
    description:
      "Plan websites, brands and go-to-market workflows with an AI workspace designed for San Francisco founders and product teams.",
    intent: "san francisco ai business tools",
    status: "draft",
  },
  {
    slug: "london",
    name: "London",
    countrySlug: "united-kingdom",
    title: "AI Business Platform for London Teams",
    description:
      "Build market analyses, brand systems and launch pages with AI workflows tailored to London startups and agencies.",
    intent: "london ai business planning",
    status: "draft",
  },
  {
    slug: "dubai",
    name: "Dubai",
    countrySlug: "united-arab-emirates",
    title: "AI Business Platform for Dubai Companies",
    description:
      "Accelerate branding, websites and growth planning for Dubai businesses with a unified AI operating workspace.",
    intent: "dubai ai business platform",
    status: "draft",
  },
];

export function getCities() {
  return CITIES;
}

export function getPublishedCities() {
  return CITIES.filter((city) => city.status === "published");
}

export function getCityBySlug(slug: string) {
  return CITIES.find((city) => city.slug === slug);
}

export function cityPath(slug: string) {
  return `/cities/${slug}`;
}

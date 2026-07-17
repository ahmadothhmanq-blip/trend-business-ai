/**
 * Country / market catalog for programmatic SEO (hreflang-ready foundation).
 * Only `published` entries enter sitemaps and public routes.
 */

export type CountryDef = {
  slug: string;
  code: string;
  name: string;
  title: string;
  description: string;
  localeHint: string;
  status: "draft" | "published";
};

const COUNTRIES: CountryDef[] = [
  {
    slug: "united-states",
    code: "US",
    name: "United States",
    title: "AI Business Platform for United States Teams",
    description:
      "Plan products, websites, marketing and strategy with an AI workspace tuned for US founders and operators.",
    localeHint: "en-US",
    status: "published",
  },
  {
    slug: "united-kingdom",
    code: "GB",
    name: "United Kingdom",
    title: "AI Business Platform for United Kingdom Teams",
    description:
      "Build market analyses, brand systems and launch pages with AI workflows suited to UK businesses.",
    localeHint: "en-GB",
    status: "published",
  },
  {
    slug: "united-arab-emirates",
    code: "AE",
    name: "United Arab Emirates",
    title: "AI Business Platform for UAE Teams",
    description:
      "Accelerate planning, branding and digital product workflows for startups and enterprises in the UAE.",
    localeHint: "en-AE",
    status: "published",
  },
  {
    slug: "saudi-arabia",
    code: "SA",
    name: "Saudi Arabia",
    title: "AI Business Platform for Saudi Arabia Teams",
    description:
      "Generate business plans, websites and marketing systems for teams building in Saudi Arabia.",
    localeHint: "en-SA",
    status: "draft",
  },
  {
    slug: "canada",
    code: "CA",
    name: "Canada",
    title: "AI Business Platform for Canadian Teams",
    description:
      "Use Trend Business AI to research markets, design brands and generate downloadable website source projects for Canadian companies.",
    localeHint: "en-CA",
    status: "draft",
  },
];

export function getCountries(status?: CountryDef["status"]) {
  return status ? COUNTRIES.filter((item) => item.status === status) : COUNTRIES;
}

export function getPublishedCountries() {
  return getCountries("published");
}

export function getCountryBySlug(slug: string) {
  return COUNTRIES.find((item) => item.slug === slug);
}

export function countryPath(slug: string) {
  return `/countries/${slug}`;
}

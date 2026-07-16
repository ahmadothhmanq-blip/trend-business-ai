import type { Metadata } from "next";
import { ProgrammaticClusterIndex } from "@/components/seo/programmatic-cluster-index";
import { SeoService } from "@/lib/seo/engine";
import { getPublishedCountries, countryPath } from "@/lib/seo/countries";

export const metadata: Metadata = SeoService.createMetadata({
  title: "AI Business Platform by Market",
  description:
    "Market pages for teams in the US, UK, UAE, Saudi Arabia and more — plan products, brands and growth with Trend Business AI.",
  path: "/countries",
  type: "collection",
});

export default function CountriesIndexPage() {
  const items = getPublishedCountries().map((country) => ({
    href: countryPath(country.slug),
    title: country.title,
    description: country.description,
  }));

  return (
    <ProgrammaticClusterIndex
      path="/countries"
      eyebrow="Markets"
      title="AI workspaces for every market you serve"
      description="Published market landings that help local teams discover Trend Business AI with clear regional context and intent."
      items={items}
    />
  );
}

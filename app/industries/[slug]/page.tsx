import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/marketing/site/shell";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { SeoBreadcrumbs } from "@/components/seo/breadcrumbs";
import { RelatedLinksSection } from "@/components/seo/related-links";
import { breadcrumbsForUi, buildBreadcrumbs } from "@/lib/seo/breadcrumbs";
import { breadcrumbJsonLd, webPageJsonLd } from "@/lib/seo/json-ld";
import { SeoService } from "@/lib/seo/engine";
import {
  getIndustryBySlug,
  getPublishedIndustries,
  industryPath,
} from "@/lib/seo/industries";
import { getRelatedTools } from "@/lib/seo/internal-links";
import type { MarketingProductSlug } from "@/lib/constants/marketing-content";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getPublishedIndustries().map((industry) => ({ slug: industry.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const industry = getIndustryBySlug(slug);
  if (!industry || industry.status !== "published") return {};
  return SeoService.createMetadata({
    title: industry.title,
    description: industry.description,
    path: industryPath(industry.slug),
  });
}

export default async function IndustryPage({ params }: PageProps) {
  const { slug } = await params;
  const industry = getIndustryBySlug(slug);
  if (!industry || industry.status !== "published") notFound();

  const path = industryPath(industry.slug);
  const related = industry.relatedProductSlugs
    .flatMap((productSlug) => getRelatedTools(productSlug as MarketingProductSlug, 2))
    .filter((link, index, arr) => arr.findIndex((item) => item.href === link.href) === index)
    .slice(0, 6);

  return (
    <SiteShell>
      <div className="mx-auto max-w-3xl px-6 py-16">
        <SeoBreadcrumbs items={breadcrumbsForUi(path)} />
        <JsonLdScript
          data={[
            breadcrumbJsonLd(buildBreadcrumbs(path)),
            webPageJsonLd({
              name: industry.title,
              description: industry.description,
              path,
            }),
          ]}
        />
        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#D4AF37]">
          Industry
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">{industry.title}</h1>
        <p className="mt-4 text-lg leading-relaxed text-[#A8A8A8]">{industry.description}</p>
        <p className="mt-8 text-[15px] leading-relaxed text-[#C7C7C7]">
          Trend Business AI helps {industry.name.toLowerCase()} teams connect planning, creation and
          go-to-market execution in one workspace — without stitching together disconnected AI chats.
        </p>
        <div className="mt-14">
          <RelatedLinksSection title="Recommended tools" links={related} />
        </div>
      </div>
    </SiteShell>
  );
}

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
import { getServerTranslator } from "@/lib/i18n/server";
import { getLocalizedIndustry } from "@/lib/seo/localized-content";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getPublishedIndustries().map((industry) => ({ slug: industry.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const industry = getIndustryBySlug(slug);
  if (!industry || industry.status !== "published") return {};
  const { locale } = await getServerTranslator();
  const localized = getLocalizedIndustry(locale, industry);
  return SeoService.createMetadata({
    title: localized.title,
    description: localized.description,
    path: industryPath(industry.slug),
    locale,
  });
}

export default async function IndustryPage({ params }: PageProps) {
  const { slug } = await params;
  const { t, locale } = await getServerTranslator();
  const industry = getIndustryBySlug(slug);
  if (!industry || industry.status !== "published") notFound();
  const localized = getLocalizedIndustry(locale, industry);

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
              name: localized.title,
              description: localized.description,
              path,
            }),
          ]}
        />
        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#D4AF37]">
          {t("marketing.publicPages.industryPage.eyebrow")}
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">{localized.title}</h1>
        <p className="mt-4 text-lg leading-relaxed text-[#A8A8A8]">{localized.description}</p>
        <p className="mt-8 text-[15px] leading-relaxed text-[#C7C7C7]">
          {t("marketing.publicPages.industryPage.body", {
            industry: localized.name.toLowerCase(),
          })}
        </p>
        <div className="mt-14">
          <RelatedLinksSection
            title={t("marketing.publicPages.industryPage.recommendedTools")}
            links={related}
          />
        </div>
      </div>
    </SiteShell>
  );
}

import { notFound } from "next/navigation";
import { SiteShell } from "@/components/marketing/site/shell";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { SeoBreadcrumbs } from "@/components/seo/breadcrumbs";
import { RelatedLinksSection } from "@/components/seo/related-links";
import { breadcrumbsForUi, buildBreadcrumbs } from "@/lib/seo/breadcrumbs";
import { breadcrumbJsonLd, webPageJsonLd } from "@/lib/seo/json-ld";
import {
  getProgrammaticPageBySlug,
  type ProgrammaticCluster,
} from "@/lib/seo/programmatic";
import { getRelatedTools } from "@/lib/seo/internal-links";
import type { MarketingProductSlug } from "@/lib/constants/marketing-content";
import { getServerTranslator } from "@/lib/i18n/server";
import { getLocalizedProgrammaticPage } from "@/lib/seo/localized-content";

export async function ProgrammaticLandingPage({
  cluster,
  slug,
}: {
  cluster: ProgrammaticCluster;
  slug: string;
}) {
  const { t, locale } = await getServerTranslator();
  const page = getProgrammaticPageBySlug(cluster, slug);
  if (!page || page.status !== "published") notFound();

  const localized = getLocalizedProgrammaticPage(locale, page);
  const related = (page.relatedProductSlugs ?? [])
    .flatMap((productSlug) => getRelatedTools(productSlug as MarketingProductSlug, 2))
    .filter((link, index, arr) => arr.findIndex((item) => item.href === link.href) === index)
    .slice(0, 6);

  const crumbs = buildBreadcrumbs(page.path);

  return (
    <SiteShell>
      <div className="mx-auto max-w-3xl px-6 py-16">
        <SeoBreadcrumbs items={breadcrumbsForUi(page.path)} />
        <JsonLdScript
          data={[
            breadcrumbJsonLd(crumbs),
            webPageJsonLd({
              name: localized.title,
              description: localized.description,
              path: page.path,
            }),
          ]}
        />
        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#D4AF37]">
          {cluster.replace("-", " ")}
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">{localized.title}</h1>
        <p className="mt-4 text-lg leading-relaxed text-[#A8A8A8]">{localized.description}</p>
        <div className="mt-10 space-y-5 text-[15px] leading-relaxed text-[#C7C7C7]">
          {(localized.body ?? [localized.description]).map((paragraph) => (
            <p key={paragraph.slice(0, 48)}>{paragraph}</p>
          ))}
        </div>
        <div className="mt-14">
          <RelatedLinksSection
            title={t("marketing.publicPages.seo.relatedTools")}
            links={related}
          />
        </div>
      </div>
    </SiteShell>
  );
}

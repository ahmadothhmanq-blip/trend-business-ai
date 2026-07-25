import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/marketing/site/shell";
import { SiteBody, SiteH2, SitePageHero } from "@/components/marketing/site/ui";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { RelatedLinksSection } from "@/components/seo/related-links";
import { createPageMetadata } from "@/lib/seo/metadata";
import { collectionPageJsonLd } from "@/lib/seo/json-ld";
import { KNOWLEDGE_HUBS } from "@/lib/seo/knowledge";
import {
  getRelatedBlogArticles,
  getRelatedBusinessResources,
  getRelatedServices,
} from "@/lib/seo/internal-links";
import { getServerTranslator } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslator();
  return createPageMetadata({
    title: t("marketing.publicPages.resources.metaTitle"),
    description: t("marketing.publicPages.resources.metaDescription"),
    path: "/resources",
    type: "collection",
  });
}

export default async function ResourcesPage() {
  const { t } = await getServerTranslator();

  return (
    <>
      <JsonLdScript
        id="resources-jsonld"
        data={collectionPageJsonLd({
          name: t("marketing.publicPages.resources.jsonLdName"),
          description: t("marketing.publicPages.resources.jsonLdDescription"),
          path: "/resources",
          items: KNOWLEDGE_HUBS.map((hub) => ({
            name: hub.title,
            path: hub.path,
            description: hub.description,
          })),
        })}
      />
      <SiteShell>
        <SitePageHero
          eyebrow={t("marketing.publicPages.resources.eyebrow")}
          title={t("marketing.publicPages.resources.title")}
          description={t("marketing.publicPages.resources.description")}
          primary={{ label: t("marketing.publicPages.resources.primaryCta"), href: "/learn" }}
          secondary={{ label: t("marketing.publicPages.resources.secondaryCta"), href: "/docs" }}
        />

        <section className="landing-container pb-20">
          <div className="grid gap-5 sm:grid-cols-3">
            {KNOWLEDGE_HUBS.map((hub) => (
              <Link
                key={hub.id}
                href={hub.path}
                className="rounded-2xl border border-[rgba(212,175,55,0.16)] bg-[#111111] p-6 transition-colors hover:border-[rgba(212,175,55,0.4)]"
              >
                <SiteH2 className="text-[22px]">{hub.title}</SiteH2>
                <SiteBody className="mt-3">{hub.description}</SiteBody>
              </Link>
            ))}
          </div>

          <div className="mt-16 space-y-12">
            <RelatedLinksSection title={t("marketing.common.relatedServices")} links={getRelatedServices("business")} />
            <RelatedLinksSection title={t("marketing.common.relatedArticles")} links={getRelatedBlogArticles()} />
            <RelatedLinksSection title={t("marketing.common.businessResources")} links={getRelatedBusinessResources()} />
          </div>
        </section>
      </SiteShell>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/marketing/site/shell";
import {
  SiteBody,
  SiteEyebrow,
  SiteH2,
  SitePageHero,
} from "@/components/marketing/site/ui";
import { SiteButton } from "@/components/marketing/site/button";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { RelatedLinksSection } from "@/components/seo/related-links";
import { createPageMetadata } from "@/lib/seo/metadata";
import { collectionPageJsonLd, webPageJsonLd } from "@/lib/seo/json-ld";
import { KNOWLEDGE_HUBS, getPublishedKnowledgeByKind } from "@/lib/seo/knowledge";
import { getRelatedBusinessResources, getRelatedTools } from "@/lib/seo/internal-links";
import { getServerTranslator } from "@/lib/i18n/server";

const SECTION_IDS = [
  "academy",
  "tutorial",
  "guide",
  "documentation",
  "glossary",
  "case-study",
] as const;

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslator();
  return createPageMetadata({
    title: t("marketing.publicPages.learn.metaTitle"),
    description: t("marketing.publicPages.learn.metaDescription"),
    path: "/learn",
    type: "collection",
  });
}

export default async function LearnPage() {
  const { t } = await getServerTranslator();
  const published = getPublishedKnowledgeByKind();
  const hubs = KNOWLEDGE_HUBS.filter((hub) => hub.path !== "/learn");

  return (
    <>
      <JsonLdScript
        id="learn-jsonld"
        data={[
          webPageJsonLd({
            name: t("marketing.publicPages.learn.jsonLdName"),
            description: t("marketing.publicPages.learn.jsonLdDescription"),
            path: "/learn",
            type: "CollectionPage",
          }),
          collectionPageJsonLd({
            name: t("marketing.publicPages.learn.jsonLdName"),
            description: t("marketing.publicPages.learn.jsonLdCollectionDescription"),
            path: "/learn",
            items: [
              ...hubs.map((hub) => ({
                name: hub.title,
                path: hub.path,
                description: hub.description,
              })),
              ...published.documentation.map((entry) => ({
                name: entry.title,
                path: entry.path,
                description: entry.description,
              })),
            ],
          }),
        ]}
      />
      <SiteShell>
        <SitePageHero
          eyebrow={t("marketing.publicPages.learn.eyebrow")}
          title={t("marketing.publicPages.learn.title")}
          description={t("marketing.publicPages.learn.description")}
          primary={{ label: t("marketing.publicPages.learn.primaryCta"), href: "/docs" }}
          secondary={{ label: t("marketing.publicPages.learn.secondaryCta"), href: "/features" }}
        />

        <section className="landing-container pb-16 lg:pb-24">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SECTION_IDS.map((sectionId) => {
              const count =
                sectionId === "academy"
                  ? published.academy.length
                  : sectionId === "tutorial"
                    ? published.tutorials.length
                    : sectionId === "guide"
                      ? published.guides.length
                      : sectionId === "documentation"
                        ? published.documentation.length
                        : sectionId === "glossary"
                          ? published.glossary.length
                          : published.caseStudies.length;

              return (
                <div
                  key={sectionId}
                  className="rounded-2xl border border-[rgba(212,175,55,0.16)] bg-[#111111] p-6"
                >
                  <SiteEyebrow>{t(`marketing.publicPages.learn.sections.${sectionId}.title`)}</SiteEyebrow>
                  <SiteH2 className="mt-3 text-[22px]">{t(`marketing.publicPages.learn.sections.${sectionId}.title`)}</SiteH2>
                  <SiteBody className="mt-3">{t(`marketing.publicPages.learn.sections.${sectionId}.description`)}</SiteBody>
                  <p className="mt-4 text-[12px] uppercase tracking-[0.14em] text-[#8A8A8A]">
                    {count > 0
                      ? t("marketing.publicPages.learn.publishedCount", { count })
                      : t("marketing.publicPages.learn.foundationReady")}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-14 grid gap-4 sm:grid-cols-3">
            {hubs.map((hub) => (
              <Link
                key={hub.id}
                href={hub.path}
                className="rounded-2xl border border-[rgba(212,175,55,0.16)] bg-[#0d0d0d] px-5 py-4 transition-colors hover:border-[rgba(212,175,55,0.4)]"
              >
                <p className="text-sm font-semibold text-white">{hub.title}</p>
                <p className="mt-1 text-[13px] text-[#A8A8A8]">{hub.description}</p>
              </Link>
            ))}
          </div>

          <div className="mt-16">
            <RelatedLinksSection
              title={t("marketing.common.relatedTools")}
              links={getRelatedTools("website-builder", 3)}
            />
          </div>
          <div className="mt-12">
            <RelatedLinksSection title={t("marketing.common.businessResources")} links={getRelatedBusinessResources()} />
          </div>

          <div className="mt-14 flex justify-center">
            <SiteButton href="/signup" size="lg">
              {t("marketing.publicPages.learn.startBuildingFree")}
            </SiteButton>
          </div>
        </section>
      </SiteShell>
    </>
  );
}

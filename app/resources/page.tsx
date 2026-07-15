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

export const metadata: Metadata = createPageMetadata({
  title: "Business Resources",
  description:
    "Curated resources for founders and operators using Trend Business AI — docs, learning, FAQs and growth tools.",
  path: "/resources",
  type: "collection",
});

export default function ResourcesPage() {
  return (
    <>
      <JsonLdScript
        id="resources-jsonld"
        data={collectionPageJsonLd({
          name: "Business Resources",
          description: "Docs, learning hubs and growth resources for Trend Business AI.",
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
          eyebrow="Resources"
          title="Business resources for AI-powered growth."
          description="A curated hub for documentation, learning paths and platform resources — built for search clarity, not content spam."
          primary={{ label: "Knowledge Center", href: "/learn" }}
          secondary={{ label: "Documentation", href: "/docs" }}
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
            <RelatedLinksSection title="Related services" links={getRelatedServices("business")} />
            <RelatedLinksSection title="Related articles" links={getRelatedBlogArticles()} />
            <RelatedLinksSection title="More resources" links={getRelatedBusinessResources()} />
          </div>
        </section>
      </SiteShell>
    </>
  );
}

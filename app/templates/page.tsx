import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/marketing/site/shell";
import { SiteBody, SiteH2, SitePageHero } from "@/components/marketing/site/ui";
import { ProductIllustration } from "@/components/marketing/solution-illustration";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { RelatedLinksSection } from "@/components/seo/related-links";
import { createPageMetadata } from "@/lib/seo/metadata";
import { collectionPageJsonLd } from "@/lib/seo/json-ld";
import { getTemplateHubItems } from "@/lib/seo/content/templates";
import {
  getRelatedBlogArticles,
  getRelatedServices,
  getRelatedTools,
} from "@/lib/seo/internal-links";

export const metadata: Metadata = createPageMetadata({
  title: "AI Templates — Websites, Brand & Content",
  description:
    "Browse Trend Business AI template patterns for landing pages, brand kits and business workflows.",
  path: "/templates",
  type: "collection",
});

export default function TemplatesPage() {
  const templates = getTemplateHubItems();

  return (
    <>
      <JsonLdScript
        id="templates-jsonld"
        data={collectionPageJsonLd({
          name: "AI Templates",
          description: "Template patterns for websites, brand and content workflows.",
          path: "/templates",
          items: templates.map((template) => ({
            name: template.title,
            path: template.path,
            description: template.description,
          })),
        })}
      />
      <SiteShell>
        <SitePageHero
          eyebrow="Templates"
          title="Premium starting points for AI workflows."
          description="Curated template patterns connected to Trend Business AI products — not thin duplicate pages."
          primary={{ label: "Start Free", href: "/signup" }}
          secondary={{ label: "View Products", href: "/products/create" }}
        />

        <section className="landing-container pb-20">
          <div className="grid gap-5 sm:grid-cols-2">
            {templates.map((template) => (
              <article
                key={template.id}
                className="overflow-hidden rounded-2xl border border-[rgba(212,175,55,0.16)] bg-[#111111] p-4"
              >
                {template.image ? (
                  <ProductIllustration src={template.image} alt={template.title} />
                ) : null}
                <SiteH2 className="mt-4 text-[22px]">{template.title}</SiteH2>
                <SiteBody className="mt-2">{template.description}</SiteBody>
                <div className="mt-4 flex flex-wrap gap-3">
                  {template.relatedProductSlugs?.map((slug) => (
                    <Link
                      key={slug}
                      href={`/products/${slug}`}
                      className="text-sm font-semibold text-[#D4AF37] hover:underline"
                    >
                      Open {slug.replace(/-/g, " ")}
                    </Link>
                  ))}
                </div>
              </article>
            ))}
          </div>

          <div className="mt-16 space-y-12">
            <RelatedLinksSection title="Related tools" links={getRelatedTools("landing-page-builder")} />
            <RelatedLinksSection title="Related services" links={getRelatedServices("create")} />
            <RelatedLinksSection title="Related articles" links={getRelatedBlogArticles()} />
          </div>
        </section>
      </SiteShell>
    </>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SiteShell } from "@/components/marketing/site/shell";
import { SiteBody, SiteEyebrow, SiteH1 } from "@/components/marketing/site/ui";
import { SiteButton } from "@/components/marketing/site/button";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { SeoBreadcrumbs } from "@/components/seo/breadcrumbs";
import { RelatedLinksSection } from "@/components/seo/related-links";
import { ProductIllustration } from "@/components/marketing/solution-illustration";
import { generateBlogPostSeoMetadata } from "@/lib/seo/generate-metadata";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { getBlogPostBySlug, getPublishedBlogPosts } from "@/lib/seo/content/blog";
import { SeoService } from "@/lib/seo/engine";
import { getServerTranslator } from "@/lib/i18n/server";
import { getLocalizedBlogPost } from "@/lib/seo/localized-content";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getPublishedBlogPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { t } = await getServerTranslator();
  const metadata = await generateBlogPostSeoMetadata(slug);
  if (!metadata) {
    return SeoService.createMetadata({
      title: t("marketing.publicPages.blogArticle.notFoundTitle"),
      path: `/blog/${slug}`,
      noIndex: true,
    });
  }
  return metadata;
}

export default async function BlogArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const { t, locale } = await getServerTranslator();
  const post = getBlogPostBySlug(slug);
  if (!post) notFound();
  const localized = getLocalizedBlogPost(locale, post);

  const homeLabel = t("marketing.publicPages.blogArticle.breadcrumbHome");
  const blogLabel = t("marketing.publicPages.blogArticle.breadcrumbBlog");

  return (
    <>
      <JsonLdScript
        id={`article-jsonld-${post.slug}`}
        data={[
          breadcrumbJsonLd([
            { name: homeLabel, path: "/" },
            { name: blogLabel, path: "/blog" },
            { name: localized.title, path: post.path },
          ]),
          articleJsonLd({
            headline: localized.title,
            description: localized.description,
            path: post.path,
            datePublished: post.publishedAt,
            dateModified: post.updatedAt,
            image: post.image,
          }),
        ]}
      />
      <SiteShell>
        <article className="landing-container pt-[108px] pb-20 lg:pt-[124px]">
          <SeoBreadcrumbs
            items={[
              { name: homeLabel, href: "/" },
              { name: blogLabel, href: "/blog" },
              { name: localized.title },
            ]}
          />
          <SiteEyebrow>{t("marketing.publicPages.blogArticle.eyebrow")}</SiteEyebrow>
          <SiteH1 className="mt-5 max-w-3xl">{localized.title}</SiteH1>
          <SiteBody className="mt-4 max-w-2xl">{localized.description}</SiteBody>
          <p className="mt-3 text-[12px] uppercase tracking-[0.14em] text-[#8A8A8A]">
            {t("marketing.publicPages.blogArticle.updated", {
              date: post.updatedAt ?? post.publishedAt,
            })}
          </p>
          {post.image ? (
            <div className="mt-10 max-w-3xl">
              <ProductIllustration src={post.image} alt={localized.title} priority />
            </div>
          ) : null}
          <div className="mx-auto mt-10 max-w-3xl space-y-5">
            {localized.body.map((paragraph) => (
              <SiteBody key={paragraph.slice(0, 32)} className="text-[15px] leading-[1.8]">
                {paragraph}
              </SiteBody>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            <SiteButton href="/signup" size="lg">
              {t("marketing.publicPages.blogArticle.startFree")}
            </SiteButton>
            <Link href="/blog" className="self-center text-sm font-semibold text-[#D4AF37]">
              {t("marketing.publicPages.blogArticle.backToBlog")}
            </Link>
          </div>
          <div className="mt-16">
            <RelatedLinksSection
              title={t("marketing.publicPages.blogArticle.continueExploring")}
              links={[
                ...SeoService.links.tools("website-builder", 2),
                ...SeoService.links.resources(2),
              ]}
            />
          </div>
        </article>
      </SiteShell>
    </>
  );
}

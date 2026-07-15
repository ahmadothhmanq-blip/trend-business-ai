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
import {
  generateBlogPostSeoMetadata,
} from "@/lib/seo/generate-metadata";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { getBlogPostBySlug, getPublishedBlogPosts } from "@/lib/seo/content/blog";
import { SeoService } from "@/lib/seo/engine";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getPublishedBlogPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const metadata = await generateBlogPostSeoMetadata(slug);
  if (!metadata) {
    return SeoService.createMetadata({
      title: "Article not found",
      path: `/blog/${slug}`,
      noIndex: true,
    });
  }
  return metadata;
}

export default async function BlogArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) notFound();

  return (
    <>
      <JsonLdScript
        id={`article-jsonld-${post.slug}`}
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: post.title, path: post.path },
          ]),
          articleJsonLd({
            headline: post.title,
            description: post.description,
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
              { name: "Home", href: "/" },
              { name: "Blog", href: "/blog" },
              { name: post.title },
            ]}
          />
          <SiteEyebrow>Blog</SiteEyebrow>
          <SiteH1 className="mt-5 max-w-3xl">{post.title}</SiteH1>
          <SiteBody className="mt-4 max-w-2xl">{post.description}</SiteBody>
          <p className="mt-3 text-[12px] uppercase tracking-[0.14em] text-[#8A8A8A]">
            Updated {post.updatedAt ?? post.publishedAt}
          </p>
          {post.image ? (
            <div className="mt-10 max-w-3xl">
              <ProductIllustration src={post.image} alt={post.title} priority />
            </div>
          ) : null}
          <div className="mx-auto mt-10 max-w-3xl space-y-5">
            {post.body.map((paragraph) => (
              <SiteBody key={paragraph.slice(0, 32)} className="text-[15px] leading-[1.8]">
                {paragraph}
              </SiteBody>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            <SiteButton href="/signup" size="lg">
              Start free
            </SiteButton>
            <Link href="/blog" className="text-sm font-semibold text-[#D4AF37] self-center">
              ← Back to blog
            </Link>
          </div>
          <div className="mt-16">
            <RelatedLinksSection
              title="Continue exploring"
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

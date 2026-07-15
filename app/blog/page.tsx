import type { Metadata } from "next";
import Link from "next/link";
import { PublicSaasPage } from "@/components/marketing/public-saas-page";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { RelatedLinksSection } from "@/components/seo/related-links";
import { PUBLIC_SAAS_PAGES } from "@/lib/constants/saas-pages";
import { SeoService } from "@/lib/seo/engine";
import { getPublishedBlogPosts } from "@/lib/seo/content/blog";
import { collectionPageJsonLd, webPageJsonLd } from "@/lib/seo/json-ld";

export const metadata: Metadata = SeoService.createMetadata({
  title: "Blog",
  description: PUBLIC_SAAS_PAGES.blog.description,
  path: "/blog",
  type: "collection",
});

export default function BlogPage() {
  const posts = getPublishedBlogPosts();

  return (
    <>
      <JsonLdScript
        id="blog-jsonld"
        data={[
          webPageJsonLd({
            name: "Blog",
            description: PUBLIC_SAAS_PAGES.blog.description,
            path: "/blog",
            type: "CollectionPage",
          }),
          collectionPageJsonLd({
            name: "Trend Business AI Blog",
            description: PUBLIC_SAAS_PAGES.blog.description,
            path: "/blog",
            items: posts.map((post) => ({
              name: post.title,
              path: post.path,
              description: post.description,
            })),
          }),
        ]}
      />
      <PublicSaasPage page={PUBLIC_SAAS_PAGES.blog}>
        <div className="landing-container border-t border-[rgba(212,175,55,0.12)] py-16 space-y-10">
          {posts.length > 0 ? (
            <div className="grid gap-4">
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={post.path}
                  className="rounded-2xl border border-[rgba(212,175,55,0.16)] bg-[#111111] px-5 py-4 transition-colors hover:border-[rgba(212,175,55,0.4)]"
                >
                  <p className="text-lg font-semibold text-white">{post.title}</p>
                  <p className="mt-2 text-[14px] text-[#A8A8A8]">{post.description}</p>
                </Link>
              ))}
            </div>
          ) : null}
          <RelatedLinksSection
            title="Explore while you read"
            links={[
              ...SeoService.links.tools("website-builder", 2),
              ...SeoService.links.resources(2),
            ]}
          />
        </div>
      </PublicSaasPage>
    </>
  );
}

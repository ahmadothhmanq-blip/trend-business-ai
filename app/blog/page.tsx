import type { Metadata } from "next";
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
            items: posts.length
              ? posts.map((post) => ({
                  name: post.title,
                  path: post.path,
                  description: post.description,
                }))
              : [
                  {
                    name: "Product updates & growth playbooks",
                    path: "/blog",
                    description: PUBLIC_SAAS_PAGES.blog.description,
                  },
                ],
          }),
        ]}
      />
      <PublicSaasPage page={PUBLIC_SAAS_PAGES.blog}>
        <div className="landing-container border-t border-[rgba(212,175,55,0.12)] py-16">
          <RelatedLinksSection
            title="Explore while editorial posts ship"
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

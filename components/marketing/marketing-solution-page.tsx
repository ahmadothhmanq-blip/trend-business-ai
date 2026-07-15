"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { SiteShell } from "@/components/marketing/site/shell";
import { SiteButton } from "@/components/marketing/site/button";
import {
  SiteBody,
  SiteCtaBand,
  SiteEyebrow,
  SiteH1,
  SiteSectionHead,
} from "@/components/marketing/site/ui";
import {
  ProductIllustration,
  SolutionIllustration,
} from "@/components/marketing/solution-illustration";
import {
  AI_PRODUCT_CATEGORIES,
  type AiProductCategoryId,
} from "@/lib/constants/marketing-content";
import { SeoBreadcrumbs } from "@/components/seo/breadcrumbs";
import { RelatedLinksGroups } from "@/components/seo/related-links";
import {
  getRelatedBlogArticles,
  getRelatedBusinessResources,
  getRelatedServices,
  getRelatedTemplates,
} from "@/lib/seo/internal-links";

/** Category page — products for this suite only, each card links to its landing. */
export function MarketingSolutionPage({ id }: { id: AiProductCategoryId }) {
  const reduce = useReducedMotion();
  const category = AI_PRODUCT_CATEGORIES.find((item) => item.id === id)!;
  const others = AI_PRODUCT_CATEGORIES.filter((item) => item.id !== id);

  return (
    <SiteShell>
      <section className="landing-container pt-[108px] pb-14 lg:pb-16 lg:pt-[124px]">
        <SeoBreadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Products", href: "/features" },
            { name: category.title },
          ]}
        />
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <SiteEyebrow>{category.eyebrow}</SiteEyebrow>
              <span className="rounded-full border border-[rgba(212,175,55,0.28)] bg-[rgba(212,175,55,0.08)] px-3 py-1 text-[11px] font-semibold text-[#D4AF37]">
                {category.productCount} products
              </span>
            </div>
            <SiteH1 className="mt-5">{category.title}</SiteH1>
            <SiteBody className="mt-5 max-w-xl text-[17px] text-[#C7C7C7]">
              {category.headline}
            </SiteBody>
            <SiteBody className="mt-4 max-w-xl">{category.body}</SiteBody>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <SiteButton href="/signup" size="lg">
                Start Free <ArrowRight className="size-4" />
              </SiteButton>
              <SiteButton href={`#${id}-products`} variant="dark" size="lg">
                Browse products
              </SiteButton>
            </div>
          </div>
          <SolutionIllustration
            id={id}
            priority
            className="min-h-[280px] shadow-[0_40px_120px_rgba(0,0,0,0.45)] sm:min-h-[340px]"
          />
        </div>
      </section>

      <section
        id={`${id}-products`}
        className="scroll-mt-28 border-t border-[rgba(212,175,55,0.12)]"
        aria-labelledby={`${id}-products-heading`}
      >
        <div className="landing-container py-16 lg:py-20">
          <SiteSectionHead
            id={`${id}-products-heading`}
            label={`Inside ${category.title}`}
            title={`${category.title} products`}
            description={`Only the ${category.title} suite — each card opens a dedicated product landing page.`}
            align="left"
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {category.products.map((product, index) => (
              <motion.div
                key={product.href}
                initial={reduce ? undefined : { opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: index * 0.06 }}
              >
                <Link
                  href={product.href}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[rgba(212,175,55,0.18)] bg-[#111111] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.3)] transition-all duration-500 hover:border-[rgba(212,175,55,0.48)] hover:shadow-[0_28px_90px_rgba(212,175,55,0.12)]"
                >
                  <ProductIllustration src={product.image} alt={product.imageAlt} />
                  <div className="flex flex-1 flex-col px-1 pb-1 pt-5">
                    <h3 className="text-xl font-bold tracking-[-0.02em] text-white">
                      {product.title}
                    </h3>
                    <p className="mt-3 text-[14px] leading-[1.75] text-[#B5B5B5]">
                      {product.description}
                    </p>
                    <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold text-[#D4AF37]">
                      Open product page
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[rgba(212,175,55,0.12)]">
        <div className="landing-container py-16 lg:py-20">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <SiteSectionHead
              label="More AI Products"
              title="Explore other categories"
              align="left"
            />
            <Link
              href="/#solutions"
              className="text-sm font-semibold text-[#D4AF37] hover:text-[#F4D56A]"
            >
              View all AI Solutions
            </Link>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {others.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="group overflow-hidden rounded-2xl border border-[rgba(212,175,55,0.14)] bg-[#111111] transition-colors hover:border-[rgba(212,175,55,0.4)]"
              >
                <SolutionIllustration id={item.id} className="rounded-none border-0" />
                <div className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-lg font-semibold text-white">{item.title}</p>
                    <span className="text-[11px] font-semibold text-[#D4AF37]">
                      {item.productCount} products
                    </span>
                  </div>
                  <p className="mt-2 text-[13px] leading-relaxed text-[#B5B5B5]">
                    {item.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[rgba(212,175,55,0.12)]">
        <div className="landing-container py-16 lg:py-20">
          <RelatedLinksGroups
            groups={[
              { title: "Related services", links: getRelatedServices(id) },
              { title: "Related templates", links: getRelatedTemplates() },
              { title: "Related articles", links: getRelatedBlogArticles() },
              { title: "Business resources", links: getRelatedBusinessResources() },
            ]}
          />
        </div>
      </section>

      <SiteCtaBand
        title={`Start building with ${category.title}`}
        description={category.description}
        secondaryHref={`#${id}-products`}
        secondaryLabel={`Browse ${category.title}`}
      />
    </SiteShell>
  );
}

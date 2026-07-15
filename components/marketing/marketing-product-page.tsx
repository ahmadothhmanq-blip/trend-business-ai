"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { SiteShell } from "@/components/marketing/site/shell";
import { SiteButton } from "@/components/marketing/site/button";
import {
  SiteBody,
  SiteCtaBand,
  SiteEyebrow,
  SiteH1,
  SiteH2,
  SiteLabel,
  SitePageHero,
  SiteSectionHead,
} from "@/components/marketing/site/ui";
import { ProductIllustration } from "@/components/marketing/solution-illustration";
import {
  AI_PRODUCT_CATEGORIES,
  getMarketingProduct,
  type MarketingProductSlug,
} from "@/lib/constants/marketing-content";
import { SeoBreadcrumbs } from "@/components/seo/breadcrumbs";
import { RelatedLinksGroups } from "@/components/seo/related-links";
import { getProductInternalLinks } from "@/lib/seo/internal-links";

/** Individual product landing — dedicated page per product slug. */
export function MarketingProductPage({ slug }: { slug: MarketingProductSlug }) {
  const reduce = useReducedMotion();
  const product = getMarketingProduct(slug)!;
  const category = AI_PRODUCT_CATEGORIES.find((c) => c.id === product.categoryId)!;
  const siblings = category.products.filter((p) => p.href !== `/products/${slug}`);
  const related = getProductInternalLinks(slug);

  return (
    <SiteShell>
      <section className="landing-container pt-[108px] pb-14 lg:pb-16 lg:pt-[124px]">
        <SeoBreadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: category.title, href: category.href },
            { name: product.title },
          ]}
        />
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
          <div>
            <SiteEyebrow>{product.eyebrow}</SiteEyebrow>
            <SiteH1 className="mt-5">{product.title}</SiteH1>
            <SiteBody className="mt-5 max-w-xl">{product.description}</SiteBody>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <SiteButton href="/signup" size="lg">
                Start Free <ArrowRight className="size-4" />
              </SiteButton>
              <SiteButton href={category.href} variant="dark" size="lg">
                View {category.title}
              </SiteButton>
            </div>
            <ul className="mt-8 space-y-3">
              {product.highlights.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-[14px] leading-[1.65] text-[#C7C7C7]"
                >
                  <Check className="mt-0.5 size-4 shrink-0 text-[#D4AF37]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <ProductIllustration
            src={product.image}
            alt={product.imageAlt}
            priority
            className="min-h-[260px] shadow-[0_40px_120px_rgba(0,0,0,0.45)] sm:min-h-[320px]"
          />
        </div>
      </section>

      <section className="border-t border-[rgba(212,175,55,0.12)]">
        <div className="landing-container py-16 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
            <div>
              <SiteLabel>Capabilities</SiteLabel>
              <SiteH2 className="mt-4">What this product does</SiteH2>
              <ul className="mt-8 space-y-4">
                {product.capabilities.map((item, index) => (
                  <motion.li
                    key={item}
                    initial={reduce ? undefined : { opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: index * 0.05 }}
                    className="rounded-2xl border border-[rgba(212,175,55,0.16)] bg-[#111111] px-5 py-4 text-[14px] leading-[1.7] text-[#C7C7C7]"
                  >
                    {item}
                  </motion.li>
                ))}
              </ul>
            </div>
            <div>
              <SiteLabel>Outcomes</SiteLabel>
              <SiteH2 className="mt-4">What you walk away with</SiteH2>
              <ul className="mt-8 space-y-4">
                {product.outcomes.map((item, index) => (
                  <motion.li
                    key={item}
                    initial={reduce ? undefined : { opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: index * 0.05 }}
                    className="flex gap-3 rounded-2xl border border-[rgba(212,175,55,0.16)] bg-[#111111] px-5 py-4 text-[14px] leading-[1.7] text-[#C7C7C7]"
                  >
                    <Check className="mt-0.5 size-4 shrink-0 text-[#D4AF37]" />
                    <span>{item}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[rgba(212,175,55,0.12)]">
        <div className="landing-container py-16 lg:py-20">
          <SiteSectionHead
            label="How it works"
            title="Brief → generate → save & export"
            description="The same private workflow across every Trend Business AI product."
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-3">
            {[
              {
                step: "01",
                title: "Open the product",
                body: `Start from ${category.title} or jump straight into ${product.title} after signup.`,
              },
              {
                step: "02",
                title: "Describe your brief",
                body: "Share goals, audience and constraints. Clearer briefs produce stronger output.",
              },
              {
                step: "03",
                title: "Save and export",
                body: "Keep results in your authenticated dashboard and export when you are ready to execute.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="rounded-2xl border border-[rgba(212,175,55,0.16)] bg-[#111111] p-6"
              >
                <span className="inline-flex size-9 items-center justify-center rounded-full border border-[rgba(212,175,55,0.3)] bg-[rgba(212,175,55,0.1)] text-[12px] font-bold text-[#D4AF37]">
                  {item.step}
                </span>
                <h3 className="mt-4 text-lg font-bold text-white">{item.title}</h3>
                <p className="mt-2 text-[14px] leading-[1.7] text-[#B5B5B5]">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[rgba(212,175,55,0.12)]">
        <div className="landing-container py-16 lg:py-20">
          <SiteSectionHead
            label={`More in ${category.title}`}
            title={`Other ${category.title} products`}
            description="Stay in this category or explore the full suite."
            align="left"
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {siblings.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group overflow-hidden rounded-2xl border border-[rgba(212,175,55,0.16)] bg-[#111111] p-4 transition-all hover:border-[rgba(212,175,55,0.42)]"
              >
                <ProductIllustration src={item.image} alt={item.imageAlt} />
                <h3 className="mt-4 text-lg font-bold text-white">{item.title}</h3>
                <p className="mt-2 text-[14px] leading-[1.7] text-[#B5B5B5]">
                  {item.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#D4AF37]">
                  Open page
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
            <Link
              href={category.href}
              className="flex flex-col justify-center rounded-2xl border border-[rgba(212,175,55,0.16)] bg-[#111111] p-6 transition-all hover:border-[rgba(212,175,55,0.42)]"
            >
              <p className="text-[11px] font-semibold tracking-[0.18em] text-[#D4AF37] uppercase">
                Category
              </p>
              <h3 className="mt-2 text-lg font-bold text-white">
                All {category.title} products
              </h3>
              <p className="mt-2 text-[14px] leading-[1.7] text-[#B5B5B5]">
                {category.description}
              </p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#D4AF37]">
                Back to {category.title}
                <ArrowRight className="size-3.5" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-[rgba(212,175,55,0.12)]">
        <div className="landing-container py-16 lg:py-20">
          <RelatedLinksGroups
            groups={[
              { title: "Related tools", links: related.tools },
              { title: "Related services", links: related.services },
              { title: "Related templates", links: related.templates },
              { title: "Related articles", links: related.articles },
              { title: "Business resources", links: related.resources },
            ]}
          />
        </div>
      </section>

      <SiteCtaBand
        title={`Start ${product.title} free`}
        description="Create your account and open your private Trend Business AI dashboard."
        secondaryHref={category.href}
        secondaryLabel={`Browse ${category.title}`}
      />
    </SiteShell>
  );
}

export function MarketingProductPageFallback({ slug }: { slug: string }) {
  return (
    <SiteShell>
      <SitePageHero
        eyebrow="AI Product"
        title="Product coming soon"
        description={`The “${slug}” product page is being finalized. Explore our AI product categories while we finish this landing.`}
        primary={{ label: "Browse Solutions", href: "/#solutions" }}
        secondary={{ label: "Start Free", href: "/signup" }}
      />
      <div className="landing-container pb-20">
        <Link href="/#solutions" className="text-sm font-semibold text-[#D4AF37]">
          ← Back to AI Solutions
        </Link>
      </div>
    </SiteShell>
  );
}

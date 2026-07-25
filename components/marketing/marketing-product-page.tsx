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
import { OnePromptProductSection } from "@/components/marketing/one-prompt-product-section";
import {
  MARKETING_SLUG_TO_ONE_PROMPT,
  getOnePromptProduct,
} from "@/lib/constants/one-prompt-products";
import { useScopedT } from "@/lib/i18n/use-scoped-t";
import { translateField } from "@/lib/i18n/translate-field";
import { useTranslation } from "@/lib/i18n/client";

/** Individual product landing — dedicated page per product slug. */
export function MarketingProductPage({ slug }: { slug: MarketingProductSlug }) {
  const { t } = useTranslation();
  const tCommon = useScopedT("marketing.common");
  const tCat = useScopedT("marketing.categories");
  const productKey = `marketing.products.${slug}`;
  const reduce = useReducedMotion();
  const product = getMarketingProduct(slug)!;
  const category = AI_PRODUCT_CATEGORIES.find((c) => c.id === product.categoryId)!;
  const siblings = category.products.filter((p) => p.href !== `/products/${slug}`);
  const related = getProductInternalLinks(slug);
  const onePromptId = MARKETING_SLUG_TO_ONE_PROMPT[slug];
  const onePrompt = onePromptId ? getOnePromptProduct(onePromptId) : null;
  const primaryHref = onePrompt?.dashboardHref ?? product.dashboardHref;
  const categoryTitle = tCat(`${category.id}.title`);
  const productTitle = translateField(t, product.title, `${productKey}.title`);

  return (
    <SiteShell>
      <section className="landing-container pt-[108px] pb-14 lg:pb-16 lg:pt-[124px]">
        <SeoBreadcrumbs
          items={[
            { name: tCommon("home"), href: "/" },
            { name: categoryTitle, href: category.href },
            { name: productTitle },
          ]}
        />
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
          <div>
            <SiteEyebrow>
              {translateField(t, product.eyebrow, `${productKey}.eyebrow`)}
            </SiteEyebrow>
            <SiteH1 className="mt-5">{productTitle}</SiteH1>
            <SiteBody className="mt-5 max-w-xl">
              {translateField(t, product.description, `${productKey}.description`)}
            </SiteBody>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <SiteButton href={primaryHref} size="lg">
                {tCommon("openProduct", { title: productTitle })}{" "}
                <ArrowRight className="size-4" />
              </SiteButton>
              <SiteButton href="/signup" variant="dark" size="lg">
                {tCommon("startFree")}
              </SiteButton>
            </div>
            <ul className="mt-8 space-y-3">
              {product.highlights.map((item, index) => (
                <li
                  key={item}
                  className="flex gap-3 text-[14px] leading-[1.65] text-[#C7C7C7]"
                >
                  <Check className="mt-0.5 size-4 shrink-0 text-[#D4AF37]" />
                  <span>
                    {translateField(t, item, `${productKey}.highlights.${index}`)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <ProductIllustration
            src={product.image}
            alt={translateField(t, product.imageAlt, `${productKey}.imageAlt`)}
            priority
            className="min-h-[260px] shadow-[0_40px_120px_rgba(0,0,0,0.45)] sm:min-h-[320px]"
          />
        </div>
      </section>

      <section className="border-t border-[rgba(212,175,55,0.12)]">
        <div className="landing-container py-16 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
            <div>
              <SiteLabel>{tCommon("capabilities")}</SiteLabel>
              <SiteH2 className="mt-4">{tCommon("whatProductDoes")}</SiteH2>
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
                    {translateField(t, item, `${productKey}.capabilities.${index}`)}
                  </motion.li>
                ))}
              </ul>
            </div>
            <div>
              <SiteLabel>{tCommon("outcomes")}</SiteLabel>
              <SiteH2 className="mt-4">{tCommon("whatYouWalkAwayWith")}</SiteH2>
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
                    <span>
                      {translateField(t, item, `${productKey}.outcomes.${index}`)}
                    </span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {onePrompt ? (
        <OnePromptProductSection product={onePrompt} />
      ) : (
        <section className="border-t border-[rgba(212,175,55,0.12)]">
          <div className="landing-container py-16 lg:py-20">
            <SiteSectionHead
              label={tCommon("howItWorks")}
              title={tCommon("briefGenerateSave")}
              description={tCommon("samePrivateWorkflow")}
            />
            <div className="mt-12 grid gap-5 sm:grid-cols-3">
              {(["01", "02", "03"] as const).map((step, index) => (
                <div
                  key={step}
                  className="rounded-2xl border border-[rgba(212,175,55,0.16)] bg-[#111111] p-6"
                >
                  <span className="inline-flex size-9 items-center justify-center rounded-full border border-[rgba(212,175,55,0.3)] bg-[rgba(212,175,55,0.1)] text-[12px] font-bold text-[#D4AF37]">
                    {step}
                  </span>
                  <h3 className="mt-4 text-lg font-bold text-white">
                    {tCommon(
                      index === 0
                        ? "stepOpenProduct"
                        : index === 1
                          ? "stepDescribeBrief"
                          : "stepSaveExport",
                    )}
                  </h3>
                  <p className="mt-2 text-[14px] leading-[1.7] text-[#B5B5B5]">
                    {index === 0
                      ? tCommon("stepOpenProductBody", {
                          category: categoryTitle,
                          product: productTitle,
                        })
                      : tCommon(
                          index === 1 ? "stepDescribeBriefBody" : "stepSaveExportBody",
                        )}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="border-t border-[rgba(212,175,55,0.12)]">
        <div className="landing-container py-16 lg:py-20">
          <SiteSectionHead
            label={tCommon("moreInCategory", { category: categoryTitle })}
            title={tCommon("otherCategoryProducts", { category: categoryTitle })}
            description={tCommon("stayInCategory")}
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
                  {tCommon("openPage")}
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
            <Link
              href={category.href}
              className="flex flex-col justify-center rounded-2xl border border-[rgba(212,175,55,0.16)] bg-[#111111] p-6 transition-all hover:border-[rgba(212,175,55,0.42)]"
            >
              <p className="text-[11px] font-semibold tracking-[0.18em] text-[#D4AF37] uppercase">
                {tCommon("category")}
              </p>
              <h3 className="mt-2 text-lg font-bold text-white">
                {tCommon("allCategoryProducts", { category: categoryTitle })}
              </h3>
              <p className="mt-2 text-[14px] leading-[1.7] text-[#B5B5B5]">
                {tCat(`${category.id}.description`)}
              </p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#D4AF37]">
                {tCommon("backToCategory", { category: categoryTitle })}
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
              { title: tCommon("relatedTools"), links: related.tools },
              { title: tCommon("relatedServices"), links: related.services },
              { title: tCommon("relatedTemplates"), links: related.templates },
              { title: tCommon("relatedArticles"), links: related.articles },
              { title: tCommon("businessResources"), links: related.resources },
            ]}
          />
        </div>
      </section>

      <SiteCtaBand
        title={tCommon("startProductFree", { title: productTitle })}
        description={tCommon("onePromptCtaDescription")}
        primaryHref={primaryHref}
        primaryLabel={tCommon("openProduct", { title: productTitle })}
        secondaryHref={category.href}
        secondaryLabel={tCommon("browseCategory", { category: categoryTitle })}
      />
    </SiteShell>
  );
}

export function MarketingProductPageFallback({ slug }: { slug: string }) {
  const tCommon = useScopedT("marketing.common");

  return (
    <SiteShell>
      <SitePageHero
        eyebrow={tCommon("aiProduct")}
        title={tCommon("productComingSoon")}
        description={tCommon("productComingSoonDescription", { slug })}
        primary={{ label: tCommon("browseSolutions"), href: "/#solutions" }}
        secondary={{ label: tCommon("startFree"), href: "/signup" }}
      />
      <div className="landing-container pb-20">
        <Link href="/#solutions" className="text-sm font-semibold text-[#D4AF37]">
          {tCommon("backToSolutions")}
        </Link>
      </div>
    </SiteShell>
  );
}

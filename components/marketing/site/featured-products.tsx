"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { REF_FEATURED_PRODUCTS } from "@/lib/constants/marketing-content";
import { ProductIllustration } from "@/components/marketing/solution-illustration";
import { SiteSectionHead } from "@/components/marketing/site/ui";
import { useScopedT } from "@/lib/i18n/use-scoped-t";

/** Featured AI Products — large illustrated product cards. */
export function SiteFeaturedProducts() {
  const t = useScopedT("marketing.featuredProducts");
  const tCommon = useScopedT("marketing.common");
  const reduce = useReducedMotion();

  return (
    <section
      id="products"
      className="relative z-10 scroll-mt-28 border-t border-[rgba(212,175,55,0.12)]"
      aria-labelledby="featured-products-title"
    >
      <div className="landing-container py-20 lg:py-28">
        <SiteSectionHead
          id="featured-products-title"
          label={t("label")}
          title={t("title")}
          description={t("description")}
        />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {REF_FEATURED_PRODUCTS.map((product, index) => (
            <motion.article
              key={product.href}
              initial={reduce ? undefined : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: index * 0.05 }}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-[rgba(212,175,55,0.18)] bg-[#111111] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.35)] transition-all duration-500 hover:border-[rgba(212,175,55,0.45)] hover:shadow-[0_28px_90px_rgba(212,175,55,0.12)] sm:p-5"
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent" />
              <ProductIllustration
                src={product.image}
                alt={t(`items.${index}.imageAlt`)}
              />
              <div className="mt-5 flex flex-1 flex-col px-0.5">
                <span className="text-[11px] font-semibold tracking-[0.16em] text-[#D4AF37] uppercase">
                  {t(`items.${index}.category`)}
                </span>
                <h3 className="mt-2 text-lg font-bold tracking-[-0.02em] text-white sm:text-xl">
                  {t(`items.${index}.title`)}
                </h3>
                <p className="mt-2 text-[14px] leading-[1.7] text-[#B5B5B5]">
                  {t(`items.${index}.description`)}
                </p>
                <Link
                  href={product.href}
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#D4AF37] transition-colors hover:text-[#F1C44D]"
                >
                  {tCommon("viewProduct")}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

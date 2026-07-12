"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { AI_PRODUCT_CATEGORIES } from "@/lib/constants/marketing-content";
import { SolutionIllustration } from "@/components/marketing/solution-illustration";
import { SiteSectionHead } from "@/components/marketing/site/ui";

export function SiteProducts() {
  const reduce = useReducedMotion();

  return (
    <section
      id="products"
      className="relative z-10 scroll-mt-28 border-t border-[rgba(212,175,55,0.12)]"
      aria-labelledby="products-title"
    >
      <div id="solutions" className="absolute -top-28" aria-hidden="true" />
      <div className="landing-container py-20 lg:py-28">
        <SiteSectionHead
          id="products-title"
          label="AI Products"
          title="Four product categories. One premium AI company."
          description="Explore Create, Design, Content and Business — focused AI product suites built for founders who want speed without sacrificing polish."
        />
        <div className="mt-14 grid gap-6 lg:grid-cols-2 lg:gap-7">
          {AI_PRODUCT_CATEGORIES.map((category, index) => (
            <motion.article
              key={category.id}
              initial={reduce ? undefined : { opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: index * 0.08 }}
              className="group relative flex min-h-[460px] flex-col overflow-hidden rounded-2xl border border-[rgba(212,175,55,0.2)] bg-[#111111] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.4),0_0_40px_rgba(212,175,55,0.04)] transition-all duration-500 hover:border-[rgba(212,175,55,0.5)] hover:shadow-[0_36px_120px_rgba(212,175,55,0.16)] sm:p-6"
            >
              <div
                className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${category.accent} opacity-70 group-hover:opacity-100`}
              />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/60 to-transparent" />
              <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.14),transparent_70%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative flex h-full flex-col">
                <SolutionIllustration id={category.id} />
                <div className="mt-7 flex flex-1 flex-col px-1">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-[clamp(1.5rem,2.5vw,1.875rem)] font-bold tracking-[-0.03em] text-white">
                      {category.title}
                    </h3>
                    <span className="shrink-0 rounded-full border border-[rgba(212,175,55,0.28)] bg-[rgba(212,175,55,0.08)] px-3 py-1 text-[11px] font-semibold text-[#D4AF37]">
                      {category.productCount} products
                    </span>
                  </div>
                  <p className="mt-3 max-w-md text-[15px] leading-[1.75] text-[#B5B5B5]">
                    {category.description}
                  </p>
                  <Link
                    href={category.href}
                    className="mt-auto inline-flex w-fit items-center gap-2 rounded-full border border-[rgba(212,175,55,0.28)] bg-[rgba(212,175,55,0.08)] px-5 py-2.5 text-sm font-semibold text-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.08)] transition-all hover:border-[rgba(212,175,55,0.5)] hover:bg-[rgba(212,175,55,0.14)] hover:shadow-[0_0_28px_rgba(212,175,55,0.18)]"
                  >
                    Explore
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import { Check, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { SiteButton } from "@/components/marketing/site/button";
import { SiteSectionHead } from "@/components/marketing/site/ui";
import { useScopedT } from "@/lib/i18n/use-scoped-t";
import { cn } from "@/lib/utils";

const PLANS = [
  { id: "freeBeta", href: "/signup", featured: true },
  { id: "pro", href: "/signup", featured: false },
] as const;

export function SitePricing({ standalone = false }: { standalone?: boolean }) {
  const t = useScopedT("marketing.pricing");
  const reduce = useReducedMotion();

  return (
    <section
      id="pricing"
      className={cn(
        "relative z-10 scroll-mt-28",
        !standalone && "border-t border-[rgba(212,175,55,0.12)]",
      )}
      aria-labelledby="pricing-title"
    >
      <div className={cn("landing-container", standalone ? "pb-16 lg:pb-20" : "py-20 lg:py-28")}>
        {!standalone && (
          <SiteSectionHead
            id="pricing-title"
            label={t("label")}
            title={t("title")}
            description={t("description")}
          />
        )}
        <div className={cn("mx-auto grid max-w-4xl gap-5 md:grid-cols-2", !standalone && "mt-12")}>
          {PLANS.map((plan, index) => (
            <motion.article
              key={plan.id}
              initial={reduce ? undefined : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              className={cn(
                "relative overflow-hidden rounded-2xl border bg-[#111111] p-7",
                "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-[#D4AF37]/50 before:to-transparent",
                plan.featured
                  ? "border-[rgba(212,175,55,0.42)] shadow-[0_20px_80px_rgba(212,175,55,0.16),0_0_40px_rgba(212,175,55,0.08)]"
                  : "border-[rgba(212,175,55,0.18)] shadow-[0_20px_60px_rgba(0,0,0,0.3)]",
              )}
            >
              {plan.featured && (
                <>
                  <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.18),transparent_70%)]" />
                  <div className="absolute right-5 top-5 inline-flex items-center gap-1.5 rounded-full border border-[rgba(212,175,55,0.28)] bg-[rgba(212,175,55,0.12)] px-3 py-1 text-[11px] font-semibold text-[#D4AF37] shadow-[0_0_16px_rgba(212,175,55,0.15)]">
                    <Sparkles className="size-3" />
                    {t("recommended")}
                  </div>
                </>
              )}
              <h3 className="text-xl font-bold text-white">{t(`plans.${plan.id}.name`)}</h3>
              <p className="mt-3 text-[clamp(2rem,5vw,3rem)] font-bold tracking-[-0.04em] text-[#D4AF37] drop-shadow-[0_0_20px_rgba(212,175,55,0.25)]">
                {t(`plans.${plan.id}.price`)}
              </p>
              <p className="mt-3 min-h-[48px] text-[14px] leading-[1.7] text-[#B5B5B5]">
                {t(`plans.${plan.id}.description`)}
              </p>
              <ul className="mt-7 space-y-3">
                {Array.from({ length: 5 }, (_, featureIndex) => (
                  <li
                    key={featureIndex}
                    className="flex gap-3 text-[14px] text-[#C7C7C7]"
                  >
                    <Check className="mt-0.5 size-4 shrink-0 text-[#D4AF37]" />
                    <span>{t(`plans.${plan.id}.features.${featureIndex}`)}</span>
                  </li>
                ))}
              </ul>
              <SiteButton
                href={plan.href}
                variant={plan.featured ? "gold" : "dark"}
                className="mt-8 w-full"
              >
                {t(`plans.${plan.id}.cta`)}
              </SiteButton>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

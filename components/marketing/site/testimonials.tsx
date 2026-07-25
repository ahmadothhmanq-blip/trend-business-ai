"use client";

import { motion, useReducedMotion } from "framer-motion";
import { SiteSectionHead } from "@/components/marketing/site/ui";
import { useScopedT } from "@/lib/i18n/use-scoped-t";

const TESTIMONIAL_COUNT = 3;

/** Testimonials — premium quote cards. */
export function SiteTestimonials() {
  const t = useScopedT("marketing.testimonials");
  const reduce = useReducedMotion();

  return (
    <section
      id="testimonials"
      className="relative z-10 scroll-mt-28 border-t border-[rgba(212,175,55,0.12)]"
      aria-labelledby="testimonials-title"
    >
      <div className="landing-container py-20 lg:py-28">
        <SiteSectionHead
          id="testimonials-title"
          label={t("label")}
          title={t("title")}
          description={t("description")}
        />
        <div className="mt-14 grid gap-5 lg:grid-cols-3 lg:gap-6">
          {Array.from({ length: TESTIMONIAL_COUNT }, (_, index) => (
            <motion.blockquote
              key={index}
              initial={reduce ? undefined : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              className="relative overflow-hidden rounded-2xl border border-[rgba(212,175,55,0.18)] bg-[#111111] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.3)] sm:p-7"
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent" />
              <div className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.12),transparent_70%)]" />
              <p className="text-[28px] leading-none text-[#D4AF37]" aria-hidden="true">
                “
              </p>
              <p className="mt-3 text-[15px] leading-[1.8] text-[#C7C7C7]">
                {t(`items.${index}.quote`)}
              </p>
              <footer className="mt-7 border-t border-[rgba(212,175,55,0.12)] pt-5">
                <p className="text-[15px] font-semibold text-white">{t(`items.${index}.name`)}</p>
                <p className="mt-1 text-[13px] text-[#8A8A8A]">{t(`items.${index}.role`)}</p>
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

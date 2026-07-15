"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { REF_WHY } from "@/lib/constants/marketing-content";
import { SiteSectionHead } from "@/components/marketing/site/ui";

/** Why Trend Business AI — large illustrated value cards. */
export function SiteWhy() {
  const reduce = useReducedMotion();

  return (
    <section
      id="why"
      className="relative z-10 scroll-mt-28 border-t border-[rgba(212,175,55,0.12)]"
      aria-labelledby="why-title"
    >
      <div className="landing-container py-20 lg:py-28">
        <SiteSectionHead
          id="why-title"
          label="Why Trend Business AI"
          title="Built for founders who expect premium."
          description="A private AI company experience — one brand system, one workspace, and output that feels ready for real business."
        />
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {REF_WHY.map((item, index) => (
            <motion.article
              key={item.title}
              initial={reduce ? undefined : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="group relative overflow-hidden rounded-2xl border border-[rgba(212,175,55,0.2)] bg-[#111111] shadow-[0_28px_90px_rgba(0,0,0,0.35)] transition-all duration-500 hover:border-[rgba(212,175,55,0.45)] hover:shadow-[0_32px_100px_rgba(212,175,55,0.12)]"
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/55 to-transparent" />
              <div className="relative overflow-hidden border-b border-[rgba(212,175,55,0.12)] bg-[#050505]">
                <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_40%_0%,rgba(212,175,55,0.18),transparent_55%)]" />
                <div className="relative aspect-[16/10] w-full">
                  <Image
                    src={item.image}
                    alt={item.imageAlt}
                    fill
                    sizes="(min-width: 1024px) 33vw, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                </div>
              </div>
              <div className="p-6 sm:p-7">
                <h3 className="text-xl font-bold tracking-[-0.02em] text-white">
                  {item.title}
                </h3>
                <p className="mt-3 text-[15px] leading-[1.75] text-[#B5B5B5]">
                  {item.description}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

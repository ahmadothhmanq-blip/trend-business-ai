"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { REF_TEMPLATES } from "@/lib/constants/marketing-content";
import { SiteSectionHead } from "@/components/marketing/site/ui";

/** Templates — large illustrated starter kits. */
export function SiteTemplates() {
  const reduce = useReducedMotion();

  return (
    <section
      id="templates"
      className="relative z-10 scroll-mt-28 border-t border-[rgba(212,175,55,0.12)]"
      aria-labelledby="templates-title"
    >
      <div className="landing-container py-20 lg:py-28">
        <SiteSectionHead
          id="templates-title"
          label="Templates"
          title="Start faster with premium templates."
          description="Launch-ready structures for websites, brands, content and campaigns — refined in the same black-and-gold language as the rest of the platform."
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {REF_TEMPLATES.map((template, index) => (
            <motion.article
              key={template.title}
              initial={reduce ? undefined : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: index * 0.07 }}
              className="group relative overflow-hidden rounded-2xl border border-[rgba(212,175,55,0.2)] bg-[#111111] shadow-[0_28px_90px_rgba(0,0,0,0.35)] transition-all duration-500 hover:border-[rgba(212,175,55,0.48)] hover:shadow-[0_32px_110px_rgba(212,175,55,0.12)]"
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/55 to-transparent" />
              <div className="relative overflow-hidden bg-[#050505]">
                <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_25%_0%,rgba(212,175,55,0.16),transparent_50%),linear-gradient(180deg,transparent_60%,rgba(0,0,0,0.45))]" />
                <div className="relative aspect-[16/9] w-full">
                  <Image
                    src={template.image}
                    alt={template.imageAlt}
                    fill
                    sizes="(min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    unoptimized
                  />
                </div>
              </div>
              <div className="p-6 sm:p-7">
                <span className="rounded-full border border-[rgba(212,175,55,0.28)] bg-[rgba(212,175,55,0.08)] px-3 py-1 text-[11px] font-semibold text-[#D4AF37]">
                  {template.tag}
                </span>
                <h3 className="mt-4 text-xl font-bold tracking-[-0.02em] text-white sm:text-2xl">
                  {template.title}
                </h3>
                <p className="mt-3 text-[15px] leading-[1.75] text-[#B5B5B5]">
                  {template.description}
                </p>
                <Link
                  href={template.href}
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#D4AF37] transition-colors hover:text-[#F1C44D]"
                >
                  Use template
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

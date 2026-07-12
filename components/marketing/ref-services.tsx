"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { REF_SERVICES } from "@/lib/constants/marketing-content";

const SERVICE_VISUALS = [
  {
    src: "/images/services/website-app-builder.svg",
    alt: "Luxury black and gold laptop, mobile and dashboard UI illustration",
  },
  {
    src: "/images/services/logo-designer.svg",
    alt: "Premium black and gold luxury logo mockups illustration",
  },
  {
    src: "/images/services/image-generator.svg",
    alt: "AI creating black and gold digital artwork illustration",
  },
  {
    src: "/images/services/video-generator.svg",
    alt: "Professional black and gold video editing timeline illustration",
  },
  {
    src: "/images/services/social-content-writer.svg",
    alt: "Instagram, Facebook and TikTok content dashboard illustration",
  },
  {
    src: "/images/services/feasibility-study.svg",
    alt: "Financial charts, reports and analytics illustration",
  },
  {
    src: "/images/services/project-management.svg",
    alt: "Kanban board and project analytics illustration",
  },
  {
    src: "/images/services/ads-generator.svg",
    alt: "Meta Ads and Google Ads dashboard illustration",
  },
  {
    src: "/images/services/social-analyzer.svg",
    alt: "Instagram and Facebook analytics dashboard illustration",
  },
];

export function RefServices() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="services"
      className="relative z-10 scroll-mt-28 border-t border-[rgb(212_175_55/0.12)]"
      aria-labelledby="services-title"
    >
      <div className="landing-container py-16 lg:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-[#D4AF37] uppercase">
            Services
          </p>
          <h2
            id="services-title"
            className="mt-3 text-[clamp(1.875rem,4vw,3rem)] font-bold tracking-[-0.03em] text-white"
          >
            Premium AI services for modern business growth.
          </h2>
          <p className="mt-4 text-[15px] leading-[1.7] text-[#B5B5B5]">
            Build your digital presence, brand identity, campaigns, content,
            feasibility studies and project workflows in one luxury AI suite.
          </p>
        </div>

        <div className="mt-10 grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {REF_SERVICES.map((service, index) => {
            const visual = SERVICE_VISUALS[index] ?? SERVICE_VISUALS[0];

            return (
              <motion.article
                key={service.title}
                initial={reduceMotion ? undefined : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={reduceMotion ? undefined : { y: -8 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.45, delay: index * 0.05 }}
                className="group relative flex min-h-[520px] overflow-hidden rounded-[24px] border border-[rgb(212_175_55/0.16)] bg-[linear-gradient(145deg,rgb(17_17_17/0.86),rgb(8_8_8/0.78))] p-4 shadow-[0_26px_80px_rgb(0_0_0/0.34)] backdrop-blur-xl transition-all duration-300 hover:border-[rgb(212_175_55/0.54)] hover:shadow-[0_30px_90px_rgb(212_175_55/0.13)]"
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="pointer-events-none absolute -top-20 right-0 h-44 w-44 rounded-full bg-[#D4AF37]/10 blur-3xl transition-opacity duration-300 group-hover:opacity-80" />
                <div className="relative flex h-full w-full flex-col">
                  <div className="relative h-[230px] overflow-hidden rounded-[18px] border border-[rgb(212_175_55/0.18)] bg-[#050505] shadow-[inset_0_1px_0_rgb(255_255_255/0.06),0_18px_48px_rgb(212_175_55/0.08)]">
                    <Image
                      src={visual.src}
                      alt={visual.alt}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      loading="lazy"
                      unoptimized
                    />
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_0%,rgb(212_175_55/0.18),transparent_42%),linear-gradient(180deg,transparent_58%,rgb(0_0_0/0.18))]" />
                  </div>

                  <div className="flex flex-1 flex-col px-1 pb-1 pt-6">
                    <p className="text-[11px] font-semibold tracking-[0.14em] text-[#D4AF37]/80 uppercase">
                      {service.eyebrow}
                    </p>
                    <h3 className="mt-2 text-xl font-bold tracking-[-0.02em] text-white">
                      {service.title}
                    </h3>
                    <p className="mt-4 text-[14px] leading-[1.75] text-[#B5B5B5]">
                      {service.description}
                    </p>
                    <a
                      href="/dashboard"
                      className="mt-auto inline-flex items-center gap-2 pt-7 text-sm font-semibold text-[#D4AF37] transition-colors duration-300 hover:text-[#F4D56A]"
                    >
                      Start Now
                      <ArrowRight
                        className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    </a>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

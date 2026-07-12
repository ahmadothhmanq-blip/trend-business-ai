"use client";

import {
  Clapperboard,
  Layout,
  LineChart,
  Megaphone,
  Palette,
  Shield,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { REF_FEATURES } from "@/lib/constants/marketing-content";
import { SiteCard, SiteSectionHead } from "@/components/marketing/site/ui";

const ICONS = {
  Layout,
  Palette,
  Clapperboard,
  Megaphone,
  LineChart,
  Shield,
} as const;

/** Feature grid — same premium black/gold language as the reference. */
export function SiteFeatures() {
  const reduce = useReducedMotion();

  return (
    <section
      id="features"
      className="relative z-10 scroll-mt-28 border-t border-[rgba(212,175,55,0.12)]"
      aria-labelledby="features-title"
    >
      <div className="landing-container py-20 lg:py-28">
        <SiteSectionHead
          id="features-title"
          label="Platform Features"
          title="Everything your business needs. One AI platform."
          description="From websites and brand systems to marketing, intelligence and a private workspace — built with the same luxury black-and-gold craft."
        />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {REF_FEATURES.map((feature, index) => {
            const Icon = ICONS[feature.icon as keyof typeof ICONS];
            return (
              <motion.div
                key={feature.title}
                initial={reduce ? undefined : { opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: index * 0.05 }}
              >
                <SiteCard className="h-full p-6">
                  <div className="mb-5 inline-flex size-11 items-center justify-center rounded-xl border border-[rgba(212,175,55,0.28)] bg-[rgba(212,175,55,0.1)] text-[#D4AF37] shadow-[0_0_24px_rgba(212,175,55,0.12)]">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="text-lg font-bold tracking-[-0.02em] text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-[14px] leading-[1.75] text-[#B5B5B5]">
                    {feature.description}
                  </p>
                </SiteCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

"use client";

import { ArrowRight, Globe, Play, Shield, Sparkles, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { REF_HERO } from "@/lib/constants/marketing-content";
import { TRUST_BADGES } from "@/lib/constants/navigation";
import { SiteButton } from "@/components/marketing/site/button";
import { SiteDashboard } from "@/components/marketing/site/dashboard";

const ICONS = { Zap, Shield, Sparkles, Globe } as const;

/**
 * Reference hero — copy left / dashboard right (desktop).
 * Mobile: badge → headline → sub → CTAs → trust 2×2 → dashboard (then stats below).
 */
export function SiteHero() {
  return (
    <section
      id="hero"
      className="relative z-10 pt-[76px] sm:pt-[88px]"
      aria-labelledby="hero-title"
    >
      <div className="landing-container pb-12 pt-7 lg:pb-[72px] lg:pt-12">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-8 xl:gap-12">
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <motion.p
              className="inline-flex items-center gap-2 rounded-full border border-[rgba(212,175,55,0.55)] bg-[rgba(17,17,17,0.85)] px-[14px] py-[6px] text-[12px] font-medium text-[#D4AF37]"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
            >
              <span
                className="size-[6px] rounded-full bg-[#FFD700] shadow-[0_0_8px_#FFD700]"
                aria-hidden="true"
              />
              {REF_HERO.badge.replace(/\.$/, "")}
            </motion.p>

            <motion.h1
              id="hero-title"
              className="mt-5 max-w-[620px] text-[clamp(2.5rem,5.8vw,3.875rem)] font-bold leading-[1.05] tracking-[-0.04em] sm:mt-6"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.05 }}
            >
              <span className="block text-white">One AI Platform.</span>
              <span className="mt-1 block text-[#D4AF37]">
                Every Business Solution.
              </span>
            </motion.h1>

            <motion.p
              className="mt-5 max-w-[480px] text-[15px] leading-[1.7] text-[#A8A8A8] sm:mt-6 sm:text-[16px]"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
            >
              {REF_HERO.sub}
            </motion.p>

            <motion.div
              className="mt-8 flex w-full max-w-[400px] flex-col gap-3 sm:mt-9 sm:max-w-none sm:flex-row sm:justify-center lg:justify-start"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.16 }}
            >
              <SiteButton href="/signup" size="lg" className="w-full sm:w-auto">
                Start Free <ArrowRight className="size-4" />
              </SiteButton>
              <SiteButton
                href="#demo-desktop"
                variant="dark"
                size="lg"
                className="hidden w-full sm:w-auto lg:inline-flex"
              >
                <Play className="size-3.5 fill-[#D4AF37] text-[#D4AF37]" />
                Watch Demo
              </SiteButton>
              <SiteButton
                href="#demo-mobile"
                variant="dark"
                size="lg"
                className="w-full sm:w-auto lg:hidden"
              >
                <Play className="size-3.5 fill-[#D4AF37] text-[#D4AF37]" />
                Watch Demo
              </SiteButton>
            </motion.div>

            <motion.div
              className="mt-8 grid w-full max-w-[300px] grid-cols-2 gap-x-5 gap-y-3.5 sm:mt-9 sm:flex sm:max-w-none sm:flex-wrap sm:justify-center sm:gap-x-6 lg:justify-start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.45, delay: 0.22 }}
            >
              {TRUST_BADGES.map((b) => {
                const Icon = ICONS[b.icon as keyof typeof ICONS];
                return (
                  <span
                    key={b.label}
                    className="inline-flex items-center gap-2 text-[13px] font-medium text-white"
                  >
                    <Icon className="size-4 text-[#D4AF37]" strokeWidth={1.75} />
                    {b.label}
                  </span>
                );
              })}
            </motion.div>
          </div>

          {/* Desktop dashboard */}
          <div id="demo-desktop" className="relative hidden w-full scroll-mt-28 lg:block">
            <SiteDashboard />
          </div>
        </div>

        {/* Mobile dashboard — reference stack: copy → CTAs → trust → dashboard */}
        <div id="demo-mobile" className="relative mt-10 scroll-mt-24 lg:hidden">
          <SiteDashboard mobile />
        </div>
      </div>
    </section>
  );
}

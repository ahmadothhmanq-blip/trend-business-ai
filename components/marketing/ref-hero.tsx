"use client";

import { ArrowRight, Globe, Play, Shield, Sparkles, Zap } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { REF_HERO } from "@/lib/constants/marketing-content";
import { TRUST_BADGES } from "@/lib/constants/navigation";
import { useMousePosition } from "@/components/marketing/motion/mouse-provider";
import { RefButton } from "@/components/marketing/ui/ref-button";
import { RefDashboard } from "@/components/marketing/ref-dashboard";

const BADGE_ICONS = { Zap, Shield, Sparkles, Globe } as const;

export function RefHero() {
  const mouse = useMousePosition();
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="hero"
      className="relative z-10 scroll-mt-[88px] pt-[calc(68px+32px)]"
      aria-labelledby="ref-hero-title"
    >
      <div className="landing-container grid items-center gap-8 pb-8 lg:grid-cols-[1fr_1.12fr] lg:gap-10 lg:pb-10 lg:pt-4">
        <div className="text-center lg:text-left">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 rounded-full border border-[rgb(212_175_55/0.22)] bg-[#111111]/90 px-4 py-1.5 text-[11px] font-semibold tracking-[0.04em] text-[#D4AF37]">
              <Sparkles className="size-3" aria-hidden="true" />
              {REF_HERO.badge}
            </span>
          </motion.div>

          <motion.h1
            id="ref-hero-title"
            className="mt-5 text-[clamp(2.125rem,5.2vw,3.625rem)] font-bold leading-[1.06] tracking-[-0.03em]"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.06 }}
          >
            <span className="block text-white">{REF_HERO.headlineLine1}</span>
            <span className="block text-gradient-gold">{REF_HERO.headlineLine2}</span>
          </motion.h1>

          <motion.p
            className="mx-auto mt-5 max-w-[480px] text-[15px] leading-[1.65] text-[#B5B5B5] lg:mx-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12 }}
          >
            {REF_HERO.sub}
          </motion.p>

          <motion.div
            className="mt-7 flex flex-col items-center gap-3 sm:flex-row lg:justify-start"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18 }}
          >
            <RefButton href="/signup" size="lg" magnetic>
              Start Free <ArrowRight className="size-4" aria-hidden="true" />
            </RefButton>
            <RefButton href="#demo" variant="dark" size="lg">
              <Play className="size-4 fill-current" aria-hidden="true" /> Watch Demo
            </RefButton>
          </motion.div>

          <motion.div
            className="mt-7 grid grid-cols-2 gap-x-6 gap-y-3 sm:flex sm:flex-wrap sm:justify-center lg:justify-start lg:gap-x-7"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.24 }}
          >
            {TRUST_BADGES.map((b) => {
              const Icon = BADGE_ICONS[b.icon as keyof typeof BADGE_ICONS];
              return (
                <span key={b.label} className="inline-flex items-center justify-center gap-2 text-[13px] text-white/90 sm:justify-start">
                  <Icon className="size-3.5 shrink-0 text-[#D4AF37]" aria-hidden="true" />
                  {b.label}
                </span>
              );
            })}
          </motion.div>
        </div>

        <motion.div
          id="demo"
          className="relative"
          style={reduceMotion ? undefined : { x: mouse.nx * 5, y: mouse.ny * 3 }}
          transition={{ type: "spring", stiffness: 50, damping: 26 }}
        >
          <RefDashboard />
          <RefDashboard mobileOnlyAnalytics />
        </motion.div>
      </div>
    </section>
  );
}

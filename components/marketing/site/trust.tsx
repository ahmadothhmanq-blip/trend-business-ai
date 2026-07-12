"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { REF_TRUST } from "@/lib/constants/marketing-content";
import { SiteBody, SiteH2, SiteLabel } from "@/components/marketing/site/ui";

export function SiteTrust() {
  const reduce = useReducedMotion();

  return (
    <section
      id="trust"
      className="relative z-10 scroll-mt-28 border-t border-[rgba(212,175,55,0.12)]"
      aria-labelledby="trust-title"
    >
      <div className="landing-container py-20 lg:py-28">
        <div className="relative overflow-hidden rounded-2xl border border-[rgba(212,175,55,0.22)] bg-[radial-gradient(ellipse_70%_70%_at_15%_0%,rgba(212,175,55,0.14),transparent_55%),#111111] p-6 shadow-[0_28px_100px_rgba(0,0,0,0.35),0_0_60px_rgba(212,175,55,0.06)] sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#F4D56A]/55 to-transparent" />
          <div className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.12),transparent_70%)]" />
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1fr] lg:items-center">
            <div>
              <div className="mb-5 flex size-12 items-center justify-center rounded-2xl border border-[rgba(212,175,55,0.28)] bg-[rgba(212,175,55,0.1)] text-[#D4AF37] shadow-[0_0_28px_rgba(212,175,55,0.18)]">
                <ShieldCheck className="size-6" />
              </div>
              <SiteLabel>Trust & privacy</SiteLabel>
              <SiteH2 id="trust-title" className="mt-4">
                Private by design. Built for real business work.
              </SiteH2>
              <SiteBody className="mt-4 max-w-xl">
                Trend Business AI keeps your workspace authenticated, scoped to
                your account, and ready for export whenever you need to move
                faster.
              </SiteBody>
            </div>
            <div className="grid gap-3">
              {REF_TRUST.map((item, i) => (
                <motion.div
                  key={item}
                  initial={reduce ? undefined : { opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  className="rounded-xl border border-[rgba(212,175,55,0.16)] bg-black/45 px-4 py-4 text-[14px] leading-[1.7] text-white/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                >
                  {item}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

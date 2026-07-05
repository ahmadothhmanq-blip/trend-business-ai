"use client";

import { ShieldCheck } from "lucide-react";
import { REF_TRUST } from "@/lib/constants/marketing-content";
import { RefButton } from "@/components/marketing/ui/ref-button";

export function RefTrust() {
  return (
    <section
      id="trust"
      className="relative z-10 scroll-mt-28 border-t border-[rgb(212_175_55/0.12)]"
      aria-labelledby="trust-title"
    >
      <div className="landing-container py-16 lg:py-20">
        <div className="overflow-hidden rounded-[28px] border border-[rgb(212_175_55/0.18)] bg-[radial-gradient(ellipse_70%_70%_at_15%_0%,rgb(212_175_55/0.12),transparent_55%),#101010] p-6 shadow-[0_28px_100px_rgb(0_0_0/0.28)] sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1fr] lg:items-center">
            <div>
              <div className="mb-5 flex size-12 items-center justify-center rounded-[16px] border border-[rgb(212_175_55/0.24)] bg-[rgb(212_175_55/0.1)] text-[#D4AF37]">
                <ShieldCheck className="size-6" aria-hidden="true" />
              </div>
              <p className="text-[11px] font-semibold tracking-[0.18em] text-[#D4AF37] uppercase">
                Trust
              </p>
              <h2
                id="trust-title"
                className="mt-3 text-[clamp(1.875rem,4vw,3rem)] font-bold tracking-[-0.03em] text-white"
              >
                Built for a focused, private planning workflow.
              </h2>
              <p className="mt-4 max-w-xl text-[15px] leading-[1.7] text-[#B5B5B5]">
                Trend Business AI keeps the MVP scope clear: generate practical
                business assets, save them to your account, and use them to make
                sharper decisions.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <RefButton href="/signup">Create Account</RefButton>
                <RefButton href="/privacy" variant="dark">Read Privacy Policy</RefButton>
              </div>
            </div>

            <div className="grid gap-3">
              {REF_TRUST.map((item) => (
                <div
                  key={item}
                  className="rounded-[16px] border border-white/[0.08] bg-white/[0.035] px-4 py-4 text-[13px] leading-[1.7] text-white/76"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

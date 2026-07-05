"use client";

import { Check, Sparkles } from "lucide-react";
import { REF_PRICING } from "@/lib/constants/marketing-content";
import { RefButton } from "@/components/marketing/ui/ref-button";
import { cn } from "@/lib/utils";

export function RefPricing() {
  return (
    <section
      id="pricing"
      className="relative z-10 scroll-mt-28 border-t border-[rgb(212_175_55/0.12)]"
      aria-labelledby="pricing-title"
    >
      <div className="landing-container py-16 lg:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-[#D4AF37] uppercase">
            Pricing
          </p>
          <h2
            id="pricing-title"
            className="mt-3 text-[clamp(1.875rem,4vw,3rem)] font-bold tracking-[-0.03em] text-white"
          >
            Start free while the MVP is in beta.
          </h2>
          <p className="mt-4 text-[15px] leading-[1.7] text-[#B5B5B5]">
            The beta is focused on proving the core business planning workflow.
            Paid plans will arrive after usage limits, team features, and billing
            are ready.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-4xl gap-4 md:grid-cols-2">
          {REF_PRICING.map((plan) => (
            <article
              key={plan.name}
              className={cn(
                "relative overflow-hidden rounded-[22px] border bg-[#111111]/78 p-6 backdrop-blur-xl",
                plan.featured
                  ? "border-[rgb(212_175_55/0.36)] shadow-[0_20px_80px_rgb(212_175_55/0.11)]"
                  : "border-white/[0.09]",
              )}
            >
              {plan.featured && (
                <div className="absolute right-5 top-5 inline-flex items-center gap-1.5 rounded-full border border-[rgb(212_175_55/0.2)] bg-[rgb(212_175_55/0.1)] px-3 py-1 text-[11px] font-semibold text-[#D4AF37]">
                  <Sparkles className="size-3" aria-hidden="true" />
                  MVP
                </div>
              )}
              <h3 className="text-xl font-bold text-white">{plan.name}</h3>
              <p className="mt-3 text-[clamp(2rem,5vw,3rem)] font-bold tracking-[-0.04em] text-gradient-gold">
                {plan.price}
              </p>
              <p className="mt-3 min-h-[44px] text-[13px] leading-[1.7] text-[#B5B5B5]">
                {plan.description}
              </p>
              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-3 text-[13px] text-white/78">
                    <Check className="mt-0.5 size-4 shrink-0 text-[#D4AF37]" aria-hidden="true" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <RefButton
                href={plan.href}
                variant={plan.featured ? "gold" : "dark"}
                className="mt-7 w-full"
              >
                {plan.cta}
              </RefButton>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

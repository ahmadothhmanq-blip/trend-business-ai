"use client";

import { SlotImage, slotImageList } from "@/lib/website/template-v2/slots";
type RestaurantPremiumHeroProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  primaryCta?: string;
  secondaryCta?: string;
  imageUrl?: string | null;
};

export function RestaurantPremiumHero({
  eyebrow = "Ember Table · fine dining",
  title = "Where ember meets season",
  subtitle = "A candlelit journey through fire, forage, and the quiet poetry of the harvest — composed nightly for twelve tables.",
  primaryCta = "Reserve Your Table",
  secondaryCta = "View Tasting Menu",
  imageUrl,
}: RestaurantPremiumHeroProps) {
    return (
    <section
      id="top"
      data-v2-component="restaurant-premium-hero"
      aria-labelledby="rp-hero-title"
      className="relative min-h-[100svh] overflow-hidden bg-[var(--color-background)]"
    >
      <div className="absolute inset-0 rp-grain" aria-hidden>
        <SlotImage slot="hero" index={0} preferred={imageUrl} alt="Candlelit fine dining room with seasonal tasting course and wine service" className="h-full w-full object-cover object-[center_35%] motion-safe:animate-[rp-ken-burns_14s_ease-out_both]"  priority />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-background)] via-[var(--color-background)]/78 to-[var(--color-background)]/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-background)]/92 via-[var(--color-background)]/40 to-transparent" />
      </div>

      <div className="relative z-10 flex min-h-[100svh] flex-col justify-end px-5 pb-16 pt-32 sm:px-8 sm:pb-24 lg:px-10 lg:pb-32">
        <div className="max-w-3xl">
          <div className="mb-6 flex flex-wrap items-center gap-3 motion-safe:animate-[rp-reveal-section_1s_cubic-bezier(0.22,1,0.36,1)_0.05s_both]">
            <p className="rp-eyebrow">{eyebrow}</p>
            <span className="rp-font-body rounded-full border border-[var(--border-copper,rgba(212,165,116,0.32))] px-3 py-1 text-[0.625rem] uppercase tracking-[0.2em] text-[var(--color-copper)]">
              Michelin selected · 2026
            </span>
          </div>
          <h1
            id="rp-hero-title"
            className="rp-headline motion-safe:animate-[rp-reveal-hero_1.1s_cubic-bezier(0.22,1,0.36,1)_0.2s_both]"
          >
            {title}
          </h1>
          <div className="rp-copper-rule my-8 motion-safe:animate-[rp-draw-line_0.8s_cubic-bezier(0.22,1,0.36,1)_0.5s_both]" />
          <p className="rp-body text-muted-foreground max-w-xl motion-safe:animate-[rp-reveal-section_1s_cubic-bezier(0.22,1,0.36,1)_0.45s_both]">
            {subtitle}
          </p>
          <div className="mt-10 flex flex-wrap gap-4 motion-safe:animate-[rp-reveal-section_1s_cubic-bezier(0.22,1,0.36,1)_0.6s_both]">
            <a href="#reservation" className="rp-btn-primary rp-focus-ring">
              {primaryCta}
            </a>
            <a href="#menu" className="rp-btn-ghost rp-focus-ring">
              {secondaryCta}
            </a>
          </div>
          <p className="rp-font-body mt-8 text-xs uppercase tracking-[0.22em] text-[var(--color-muted)] motion-safe:animate-[rp-reveal-section_1s_ease_0.75s_both]">
            Twelve tables · Chef&apos;s counter · Wine pairing available
          </p>
        </div>

        <div
          className="mt-16 flex items-center gap-4 motion-safe:animate-[rp-reveal-section_1s_ease_1s_both]"
          aria-hidden
        >
          <span className="block h-12 w-px origin-top bg-[var(--color-copper)]/50 motion-safe:animate-[rp-scroll-pulse_2.4s_ease-in-out_infinite]" />
          <span className="rp-font-body text-[0.625rem] uppercase tracking-[0.34em] text-[var(--color-muted)]">
            Scroll
          </span>
        </div>
      </div>
    </section>
  );
}

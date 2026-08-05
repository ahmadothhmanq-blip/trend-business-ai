"use client";

import { SlotImage } from "@/lib/website/template-v2/slots";

type HotelResortPremiumHeroProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  primaryCta?: string;
  secondaryCta?: string;
  imageUrl?: string | null;
};

export function HotelResortPremiumHero({
  eyebrow = "Azure Haven · coastal sanctuary",
  title = "Where horizon meets hospitality",
  subtitle = "An oceanfront sanctuary of private villas, spa rituals, and unhurried luxury — composed for travelers who seek stillness without sacrifice.",
  primaryCta = "Book your stay",
  secondaryCta = "Explore suites",
  imageUrl,
}: HotelResortPremiumHeroProps) {
  return (
    <section
      id="top"
      data-v2-component="hotel-resort-premium-hero"
      aria-labelledby="hr-hero-title"
      className="relative min-h-[100svh] overflow-hidden bg-[var(--color-background)]"
    >
      <div className="absolute inset-0 hr-grain" aria-hidden>
        <SlotImage
          slot="hero"
          index={0}
          preferred={imageUrl}
          alt="Luxury coastal resort with infinity pool and ocean views at sunset"
          className="h-full w-full object-cover object-[center_35%] motion-safe:animate-[hr-ken-burns_14s_ease-out_both]"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-background)] via-[var(--color-background)]/78 to-[var(--color-background)]/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-background)]/92 via-[var(--color-background)]/40 to-transparent" />
      </div>

      <div className="relative z-10 flex min-h-[100svh] flex-col justify-end px-5 pb-16 pt-32 sm:px-8 sm:pb-24 lg:px-10 lg:pb-32">
        <div className="max-w-3xl">
          <div className="mb-6 flex flex-wrap items-center gap-3 motion-safe:animate-[hr-reveal-section_1s_cubic-bezier(0.22,1,0.36,1)_0.05s_both]">
            <p className="hr-eyebrow">{eyebrow}</p>
            <span className="hr-font-body rounded-full border border-[var(--border-azure,rgba(74,159,212,0.32))] px-3 py-1 text-[0.625rem] uppercase tracking-[0.2em] text-[var(--color-azure)]">
              Forbes Five-Star · 2026
            </span>
          </div>
          <h1
            id="hr-hero-title"
            className="hr-headline motion-safe:animate-[hr-reveal-hero_1.1s_cubic-bezier(0.22,1,0.36,1)_0.2s_both]"
          >
            {title}
          </h1>
          <div className="hr-azure-rule my-8 motion-safe:animate-[hr-draw-line_0.8s_cubic-bezier(0.22,1,0.36,1)_0.5s_both]" />
          <p className="hr-body text-muted-foreground max-w-xl motion-safe:animate-[hr-reveal-section_1s_cubic-bezier(0.22,1,0.36,1)_0.45s_both]">
            {subtitle}
          </p>
          <div className="mt-10 flex flex-wrap gap-4 motion-safe:animate-[hr-reveal-section_1s_cubic-bezier(0.22,1,0.36,1)_0.6s_both]">
            <a href="#reservation" className="hr-btn-primary hr-focus-ring">
              {primaryCta}
            </a>
            <a href="#suites" className="hr-btn-ghost hr-focus-ring">
              {secondaryCta}
            </a>
          </div>
          <p className="hr-font-body mt-8 text-xs uppercase tracking-[0.22em] text-[var(--color-muted)] motion-safe:animate-[hr-reveal-section_1s_ease_0.75s_both]">
            Private villas · Ocean spa · Michelin dining
          </p>
        </div>

        <div
          className="mt-16 flex items-center gap-4 motion-safe:animate-[hr-reveal-section_1s_ease_1s_both]"
          aria-hidden
        >
          <span className="block h-12 w-px origin-top bg-[var(--color-azure)]/50 motion-safe:animate-[hr-scroll-pulse_2.4s_ease-in-out_infinite]" />
          <span className="hr-font-body text-[0.625rem] uppercase tracking-[0.34em] text-[var(--color-muted)]">
            Scroll
          </span>
        </div>
      </div>
    </section>
  );
}

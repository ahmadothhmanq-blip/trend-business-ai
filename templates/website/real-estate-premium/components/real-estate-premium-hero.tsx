"use client";

import { SlotImage } from "@/lib/website/template-v2/slots";

const DEFAULT_STATS = [
  { label: "Bedrooms", value: "5–7" },
  { label: "Interior", value: "8,400 sf" },
  { label: "Terrace", value: "2,100 sf" },
];

type RealEstatePremiumHeroProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  primaryCta?: string;
  secondaryCta?: string;
  imageUrl?: string | null;
};

export function RealEstatePremiumHero({
  eyebrow = "Private collection",
  title = "Residences of enduring distinction",
  subtitle = "Architecturally significant homes for discerning collectors — where limestone light, bronze detail, and horizon views compose a life of rare proportion.",
  primaryCta = "Schedule a private showing",
  secondaryCta = "Explore collection",
  imageUrl,
}: RealEstatePremiumHeroProps) {
  return (
    <section
      id="top"
      data-v2-component="real-estate-premium-hero"
      aria-labelledby="rep-hero-title"
      className="relative min-h-[95svh] overflow-hidden bg-[var(--color-background)]"
    >
      <div className="grid min-h-[95svh] lg:grid-cols-[1fr_1.15fr]">
        <div className="relative z-10 flex flex-col justify-end px-5 pb-14 pt-32 sm:px-8 lg:px-12 lg:pb-20 lg:pt-40">
          <p className="rep-eyebrow mb-7 motion-safe:animate-[rep-stone-rise_0.9s_ease_0.1s_both]">
            {eyebrow}
          </p>
          <h1
            id="rep-hero-title"
            className="rep-headline-lg motion-safe:animate-[rep-parallax-lift_1s_ease_0.2s_both]"
          >
            {title}
          </h1>
          <div className="rep-brass-rule-lg my-8 motion-safe:animate-[rep-brass-draw_0.8s_ease_0.45s_both]" />
          <p className="rep-body max-w-md motion-safe:animate-[rep-stone-rise_0.9s_ease_0.5s_both]">
            {subtitle}
          </p>
          <div className="mt-11 flex flex-wrap gap-4 motion-safe:animate-[rep-stone-rise_0.9s_ease_0.6s_both]">
            <a href="#inquire" className="rep-btn-primary">
              {primaryCta}
            </a>
            <a href="#collection" className="rep-btn-ghost">
              {secondaryCta}
            </a>
          </div>

          <dl className="mt-16 grid grid-cols-3 gap-6 border-t border-[var(--border-subtle)] pt-8 motion-safe:animate-[rep-stone-rise_1s_ease_0.75s_both]">
            {DEFAULT_STATS.map((stat) => (
              <div key={stat.label}>
                <dt className="rep-font-body text-[0.625rem] font-medium uppercase tracking-[0.26em] text-[var(--color-muted)]">
                  {stat.label}
                </dt>
                <dd className="rep-font-display mt-1.5 text-2xl text-[var(--color-foreground)]">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative min-h-[50svh] lg:min-h-0 rep-grain" aria-hidden>
          <SlotImage
            slot="hero"
            index={0}
            preferred={imageUrl}
            alt="Luxury residence with architectural distinction and horizon views"
            className="absolute inset-0 h-full w-full object-cover motion-safe:animate-[rep-ken-burns_16s_ease-out_both]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[var(--color-background)]/10 to-[var(--color-background)]/70 lg:bg-gradient-to-r lg:from-[var(--color-background)]/60 lg:via-transparent lg:to-transparent" />
          <div className="absolute bottom-8 right-8 hidden border border-[var(--border-brass)] bg-[var(--color-primary)]/90 px-6 py-4 backdrop-blur-sm lg:block">
            <p className="rep-eyebrow text-[var(--color-linen)]/60">Featured</p>
            <p className="rep-font-display mt-1 text-xl text-[var(--color-linen)]">
              The Whitmore Penthouse
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

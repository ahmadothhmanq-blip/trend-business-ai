"use client";

import { resolveSiteImage, resolveSlotImage } from "@/lib/site-images";

const DEFAULT_STATS = [
  { label: "Bedrooms", value: "5–7" },
  { label: "Sq ft", value: "8,400" },
  { label: "Terrace", value: "2,100" },
];

type RealEstatePrestigeHeroProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  primaryCta?: string;
  secondaryCta?: string;
  imageUrl?: string | null;
};

export function RealEstatePrestigeHero({
  eyebrow = "Private collection",
  title = "Residences of quiet distinction",
  subtitle = "Architecturally significant homes curated for discerning collectors — where limestone light, brass detail, and horizon views compose a life of rare proportion.",
  primaryCta = "Schedule a private showing",
  secondaryCta = "View collection",
  imageUrl,
}: RealEstatePrestigeHeroProps) {
  const src = resolveSlotImage("hero", 0, imageUrl);

  return (
    <section
      id="top"
      data-v2-component="real-estate-prestige-hero"
      aria-labelledby="rep-hero-title"
      className="relative min-h-[92svh] overflow-hidden bg-[var(--color-background)]"
    >
      <div className="absolute inset-0">
        {src ? (
          <img
            src={src}
            alt=""
            className="h-full w-full object-cover motion-safe:animate-[rep-ken-burns_14s_ease-out_both]"
          />
        ) : (
          <div
            className="h-full w-full"
            style={{
              background:
                "linear-gradient(165deg, var(--color-stone) 0%, var(--color-background) 45%, var(--color-secondary) 100%)",
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-background)] via-[var(--color-background)]/50 to-[var(--color-background)]/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-background)]/80 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 flex min-h-[92svh] flex-col justify-end px-5 pb-16 pt-36 sm:px-8 lg:px-10 lg:pb-24">
        <div className="max-w-2xl">
          <p className="rep-eyebrow mb-6 motion-safe:animate-[rep-stone-rise_0.9s_ease_0.1s_both]">
            {eyebrow}
          </p>
          <h1
            id="rep-hero-title"
            className="rep-headline motion-safe:animate-[rep-parallax-lift_1s_ease_0.2s_both]"
          >
            {title}
          </h1>
          <div className="rep-brass-rule my-8 motion-safe:animate-[rep-brass-draw_0.8s_ease_0.45s_both]" />
          <p className="rep-body max-w-lg motion-safe:animate-[rep-stone-rise_0.9s_ease_0.5s_both]">
            {subtitle}
          </p>
          <div className="mt-10 flex flex-wrap gap-4 motion-safe:animate-[rep-stone-rise_0.9s_ease_0.6s_both]">
            <a href="#inquire" className="rep-btn-primary">
              {primaryCta}
            </a>
            <a href="#collection" className="rep-btn-ghost">
              {secondaryCta}
            </a>
          </div>
        </div>

        <dl className="mt-16 flex flex-wrap gap-8 border-t border-[var(--border-subtle)] pt-8 motion-safe:animate-[rep-stone-rise_1s_ease_0.75s_both]">
          {DEFAULT_STATS.map((stat) => (
            <div key={stat.label}>
              <dt className="rep-font-body text-[0.625rem] uppercase tracking-[0.24em] text-[var(--color-muted)]">
                {stat.label}
              </dt>
              <dd className="rep-font-display mt-1 text-2xl text-[var(--color-foreground)]">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

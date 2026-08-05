"use client";

import { resolveSiteImage, resolveSlotImage } from "@/lib/site-images";

type RestaurantSignatureHeroProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  primaryCta?: string;
  secondaryCta?: string;
  imageUrl?: string | null;
};

export function RestaurantSignatureHero({
  eyebrow = "Forest-table fine dining",
  title = "Where ember meets season",
  subtitle = "A candlelit journey through fire, forage, and the quiet poetry of the harvest — composed nightly for twelve tables.",
  primaryCta = "Reserve Your Table",
  secondaryCta = "View Tasting Menu",
  imageUrl,
}: RestaurantSignatureHeroProps) {
  const src = resolveSlotImage("hero", 0, imageUrl);

  return (
    <section
      id="top"
      data-v2-component="restaurant-signature-hero"
      aria-labelledby="rs-hero-title"
      className="relative min-h-[100svh] overflow-hidden bg-[var(--color-background)]"
    >
      <div className="absolute inset-0 rs-grain" aria-hidden>
        {src ? (
          <img
            src={src}
            alt=""
            className="h-full w-full object-cover object-[center_35%] motion-safe:animate-[rs-ken-burns_12s_ease-out_both]"
          />
        ) : (
          <div
            className="h-full w-full"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 70% 40%, var(--color-primary) 0%, var(--color-background) 70%)",
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-background)] via-[var(--color-background)]/75 to-[var(--color-background)]/25" />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-background)]/90 via-[var(--color-background)]/35 to-transparent" />
      </div>

      <div className="relative z-10 flex min-h-[100svh] flex-col justify-end px-5 pb-16 pt-32 sm:px-8 sm:pb-24 lg:px-10 lg:pb-32">
        <div className="max-w-3xl">
          <p className="rs-eyebrow mb-6 motion-safe:animate-[rs-reveal-section_1s_cubic-bezier(0.22,1,0.36,1)_0.1s_both]">
            {eyebrow}
          </p>
          <h1
            id="rs-hero-title"
            className="rs-headline motion-safe:animate-[rs-reveal-hero_1.1s_cubic-bezier(0.22,1,0.36,1)_0.2s_both]"
          >
            {title}
          </h1>
          <div className="rs-copper-rule my-8 motion-safe:animate-[rs-draw-line_0.8s_cubic-bezier(0.22,1,0.36,1)_0.5s_both]" />
          <p className="rs-body max-w-xl motion-safe:animate-[rs-reveal-section_1s_cubic-bezier(0.22,1,0.36,1)_0.45s_both]">
            {subtitle}
          </p>
          <div className="mt-10 flex flex-wrap gap-4 motion-safe:animate-[rs-reveal-section_1s_cubic-bezier(0.22,1,0.36,1)_0.6s_both]">
            <a href="#reserve" className="rs-btn-primary">
              {primaryCta}
            </a>
            <a href="#menu" className="rs-btn-ghost">
              {secondaryCta}
            </a>
          </div>
        </div>

        <div
          className="mt-16 flex items-center gap-4 motion-safe:animate-[rs-reveal-section_1s_ease_1s_both]"
          aria-hidden
        >
          <span className="block h-12 w-px origin-top bg-[var(--color-copper)]/50 motion-safe:animate-[rs-scroll-pulse_2.4s_ease-in-out_infinite]" />
          <span className="rs-font-body text-[0.625rem] uppercase tracking-[0.34em] text-[var(--color-muted)]">
            Scroll
          </span>
        </div>
      </div>
    </section>
  );
}

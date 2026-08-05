"use client";

import { SlotImage } from "@/lib/website/template-v2/slots";

type CreativeAgencyPremiumHeroProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  scrollLabel?: string;
  discipline?: string;
  imageUrl?: string | null;
};

export function CreativeAgencyPremiumHero({
  eyebrow = "Studio Volt",
  title = "We make brands impossible to ignore",
  subtitle = "A portfolio-first creative collective — identity, spatial, motion, and digital craft for studios who refuse the ordinary.",
  scrollLabel = "Explore the work",
  discipline = "Brand · Space · Motion · Digital",
  imageUrl,
}: CreativeAgencyPremiumHeroProps) {
  const lines = title.split(" ");

  return (
    <section
      id="top"
      data-v2-component="creative-agency-premium-hero"
      aria-labelledby="sv-hero-title"
      className="relative min-h-[94vh] overflow-hidden border-b border-[var(--border-default)]"
    >
      <SlotImage
        slot="hero"
        index={0}
        preferred={imageUrl}
        alt="Creative agency studio — collaborative design environment"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.14]"
        priority
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(160deg,var(--color-background)_35%,transparent_70%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -end-32 top-0 h-[36rem] w-[36rem] bg-[var(--color-volt)]/6 blur-[140px]"
        aria-hidden
      />

      <div className="relative grid min-h-[94vh] lg:grid-cols-[1fr_1.15fr]">
        <div className="flex flex-col justify-between px-5 py-14 sm:px-8 lg:border-e lg:border-[var(--border-default)] lg:py-20">
          <div className="flex items-start justify-between gap-4">
            <p className="sv-eyebrow motion-safe:sv-animate-slam">{eyebrow}</p>
            <span className="sv-font-mono sv-index-num text-[5rem] font-bold leading-none text-[var(--color-surface)] lg:text-[7rem]" aria-hidden>
              01
            </span>
          </div>

          <div className="my-auto py-10">
            <p className="sv-font-mono text-xs uppercase tracking-[0.28em] text-[var(--color-zinc)] opacity-70">
              {discipline}
            </p>
            <p className="sv-body mt-6 max-w-sm text-lg leading-relaxed motion-safe:sv-animate-rise">
              {subtitle}
            </p>
          </div>

          <a
            href="#work"
            className="sv-font-mono sv-focus-ring group flex items-center gap-4 text-xs uppercase tracking-[0.22em] text-[var(--color-muted)] opacity-70"
          >
            <span
              className="inline-block h-10 w-px bg-[var(--color-volt)] motion-safe:animate-[sv-scroll-pulse_2.2s_ease-in-out_infinite]"
              aria-hidden
            />
            {scrollLabel}
          </a>
        </div>

        <div className="flex flex-col justify-center px-5 pb-14 sm:px-8 lg:py-20">
          <h1
            id="sv-hero-title"
            className="sv-display motion-safe:sv-animate-slam"
          >
            {lines.map((word, i) => (
              <span
                key={`${word}-${i}`}
                className={[
                  "block",
                  i === 1 || i === 3 ? "text-[var(--color-volt)]" : "",
                  i === lines.length - 1 ? "indent-[2rem] sm:indent-[4rem]" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                style={{ animationDelay: `${i * 55}ms` }}
              >
                {word}
              </span>
            ))}
          </h1>
          <div className="sv-volt-line mt-10 max-w-xs motion-safe:sv-animate-rise" aria-hidden />
        </div>
      </div>
    </section>
  );
}

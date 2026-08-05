"use client";

type EcommercePremiumUtilityBandProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  primaryCta?: string;
  secondaryCta?: string;
};

export function EcommercePremiumUtilityBand({
  eyebrow = "Join the atelier",
  title = "Discover your next heirloom",
  subtitle = "Subscribe for early access to limited editions, maker stories, and exclusive previews.",
  primaryCta = "Shop new arrivals",
  secondaryCta = "Join the list",
}: EcommercePremiumUtilityBandProps) {
  return (
    <section
      id="cta-band"
      data-v2-component="ecommerce-premium-utility-band"
      aria-labelledby="ec-utility-title"
      className="relative overflow-hidden bg-[var(--color-primary)] py-16 sm:py-20"
    >
      <div className="ec-grain pointer-events-none absolute inset-0" aria-hidden />
      <div
        className="pointer-events-none absolute -start-1/4 top-0 h-full w-1/2 bg-[radial-gradient(ellipse_70%_90%_at_0%_50%,rgba(201,169,98,0.12),transparent)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -end-1/4 bottom-0 h-2/3 w-1/2 bg-[radial-gradient(ellipse_60%_80%_at_100%_100%,rgba(201,169,98,0.08),transparent)]"
        aria-hidden
      />

      <div className="relative mx-auto flex max-w-[82rem] flex-col items-start justify-between gap-10 px-5 sm:flex-row sm:items-center sm:px-8">
        <div className="max-w-xl">
          <p className="ec-eyebrow text-[var(--color-champagne)]/80">{eyebrow}</p>
          <h2
            id="ec-utility-title"
            className="ec-font-display mt-4 text-[clamp(1.75rem,3vw,2.5rem)] leading-tight text-[var(--color-linen,#FAF8F5)] text-wrap-balance"
          >
            {title}
          </h2>
          <p className="ec-font-body mt-4 text-sm leading-relaxed text-[var(--color-linen,#FAF8F5)]/72 sm:text-base">
            {subtitle}
          </p>
          <div className="ec-trust-strip mt-7">
            {["Free shipping $150+", "30-day returns", "Gift wrapping"].map((badge) => (
              <span
                key={badge}
                className="ec-trust-badge border border-[var(--color-champagne)]/20 text-[var(--color-linen,#FAF8F5)]/75"
              >
                <span className="ec-signal text-[0.5rem]" aria-hidden>
                  ✓
                </span>
                {badge}
              </span>
            ))}
          </div>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <a
            href="#shop"
            className="inline-flex min-h-[3rem] items-center justify-center bg-[var(--color-champagne)] px-7 py-3 text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)] transition hover:bg-[var(--color-linen)] ec-focus-ring"
          >
            {primaryCta}
          </a>
          <a
            href="#contact"
            className="inline-flex min-h-[3rem] items-center justify-center border border-[var(--color-champagne)]/35 px-7 py-3 text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-linen,#FAF8F5)] transition hover:border-[var(--color-champagne)] hover:bg-[var(--color-champagne)]/8 ec-focus-ring"
          >
            {secondaryCta}
          </a>
        </div>
      </div>
    </section>
  );
}

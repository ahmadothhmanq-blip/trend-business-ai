"use client";

type FinancePremiumUtilityBandProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  primaryCta?: string;
  secondaryCta?: string;
};

export function FinancePremiumUtilityBand({
  eyebrow = "Partner with Meridian",
  title = "Your capital deserves a steward, not a salesperson",
  subtitle = "Join generations of families and institutions who entrust Meridian Capital with their most significant wealth decisions.",
  primaryCta = "Schedule consultation",
  secondaryCta = "Download capabilities brief",
}: FinancePremiumUtilityBandProps) {
  return (
    <section
      id="cta-band"
      data-v2-component="finance-premium-utility-band"
      aria-labelledby="fn-utility-title"
      className="fn-section-ink relative overflow-hidden py-16 sm:py-20"
    >
      <div className="fn-grid-bg pointer-events-none absolute inset-0 opacity-[0.12]" aria-hidden />
      <div
        className="pointer-events-none absolute -start-1/4 top-0 h-full w-1/2 bg-[radial-gradient(ellipse_70%_90%_at_0%_50%,rgba(201,162,39,0.12),transparent)]"
        aria-hidden
      />
      <div className="fn-gold-rule absolute inset-x-0 top-0 opacity-40" aria-hidden />

      <div className="relative mx-auto flex max-w-[82rem] flex-col items-start justify-between gap-10 px-5 sm:flex-row sm:items-center sm:px-8">
        <div className="max-w-xl">
          <p className="fn-font-mono text-xs font-medium uppercase tracking-[0.2em] text-[var(--color-signal)]">
            {eyebrow}
          </p>
          <h2
            id="fn-utility-title"
            className="fn-headline-sm mt-3 text-[var(--color-background)]"
          >
            {title}
          </h2>
          <p className="fn-font-body mt-4 text-sm leading-relaxed text-[color-mix(in_srgb,var(--color-background)_75%,transparent)] sm:text-base">
            {subtitle}
          </p>
          <div className="fn-trust-strip mt-6 flex flex-wrap gap-3">
            {["Multi-generational", "Fiduciary standard", "Global reach"].map((badge) => (
              <span
                key={badge}
                className="inline-flex items-center gap-1.5 rounded-full border border-[color-mix(in_srgb,var(--color-signal)_35%,transparent)] bg-[color-mix(in_srgb,var(--color-background)_6%,transparent)] px-3 py-1 text-[0.6875rem] font-medium text-[color-mix(in_srgb,var(--color-background)_85%,transparent)]"
              >
                <span className="fn-signal text-[0.5rem]" aria-hidden>
                  ✓
                </span>
                {badge}
              </span>
            ))}
          </div>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <a
            href="#contact"
            className="fn-btn-primary inline-flex min-h-[3rem] items-center justify-center px-6 py-3 fn-focus-ring"
          >
            {primaryCta}
          </a>
          <a
            href="#about"
            className="inline-flex min-h-[3rem] items-center justify-center rounded-[var(--radius-sm)] border border-[color-mix(in_srgb,var(--color-background)_35%,transparent)] bg-transparent px-6 py-3 text-sm font-semibold uppercase tracking-wide text-[var(--color-background)] transition hover:border-[var(--color-signal)] hover:text-[var(--color-signal)] fn-focus-ring"
          >
            {secondaryCta}
          </a>
        </div>
      </div>
    </section>
  );
}

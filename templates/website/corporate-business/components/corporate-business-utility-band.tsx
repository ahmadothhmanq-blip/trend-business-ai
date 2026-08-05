"use client";

type CorporateBusinessUtilityBandProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  primaryCta?: string;
  secondaryCta?: string;
};

export function CorporateBusinessUtilityBand({
  eyebrow = "Partner with us",
  title = "Ready to move from strategy to results?",
  subtitle = "Join 500+ organizations that rely on Meridian for board-ready counsel and transformation delivery.",
  primaryCta = "Schedule consultation",
  secondaryCta = "Download capabilities brief",
}: CorporateBusinessUtilityBandProps) {
  return (
    <section
      id="cta-band"
      data-v2-component="corporate-business-utility-band"
      aria-labelledby="cb-utility-title"
      className="relative overflow-hidden bg-[var(--color-ink)] py-20 sm:py-24"
    >
      <div className="cb-grid-bg pointer-events-none absolute inset-0 opacity-[0.06]" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_50%,rgba(196,165,116,0.12),transparent_55%)]"
        aria-hidden
      />

      <div className="cb-container relative flex flex-col items-start justify-between gap-12 lg:flex-row lg:items-center">
        <div className="max-w-xl">
          <p className="cb-eyebrow text-[var(--color-signal)]/80">{eyebrow}</p>
          <h2
            id="cb-utility-title"
            className="cb-font-display mt-5 text-[clamp(2rem,4vw,3rem)] font-medium leading-[1.08] text-white text-wrap-balance"
          >
            {title}
          </h2>
          <p className="cb-font-body mt-5 text-base leading-relaxed text-white/55">{subtitle}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            {["Fortune 500", "40+ countries", "Senior partners"].map((badge) => (
              <span
                key={badge}
                className="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-[0.6875rem] font-medium text-white/70"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
        <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row">
          <a
            href="#contact"
            className="inline-flex min-h-[3.125rem] items-center justify-center rounded-full bg-white px-7 text-[0.9375rem] font-medium text-[var(--color-ink)] shadow-[0_8px_32px_rgba(0,0,0,0.2)] transition hover:-translate-y-0.5 cb-focus-ring"
          >
            {primaryCta}
          </a>
          <a
            href="#about"
            className="inline-flex min-h-[3.125rem] items-center justify-center rounded-full border border-white/25 px-7 text-[0.9375rem] font-medium text-white transition hover:border-white/45 hover:bg-white/5 cb-focus-ring"
          >
            {secondaryCta}
          </a>
        </div>
      </div>
    </section>
  );
}

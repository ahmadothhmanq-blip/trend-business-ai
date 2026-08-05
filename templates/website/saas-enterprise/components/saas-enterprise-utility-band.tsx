"use client";

type SaasEnterpriseUtilityBandProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  primaryCta?: string;
  secondaryCta?: string;
};

export function SaasEnterpriseUtilityBand({
  eyebrow = "Get started",
  title = "See Northline in action",
  subtitle = "Join 500+ revenue teams who've transformed their GTM operations.",
  primaryCta = "Book a demo",
  secondaryCta = "Download ROI guide",
}: SaasEnterpriseUtilityBandProps) {
  return (
    <section
      id="cta-band"
      data-v2-component="saas-enterprise-utility-band"
      aria-labelledby="se-utility-title"
      className="relative overflow-hidden bg-[var(--color-primary)] py-16 sm:py-20"
    >
      <div className="se-grid-bg pointer-events-none absolute inset-0 opacity-[0.18]" aria-hidden />
      <div
        className="pointer-events-none absolute -start-1/4 top-0 h-full w-1/2 bg-[radial-gradient(ellipse_70%_90%_at_0%_50%,rgba(255,255,255,0.14),transparent)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -end-1/4 bottom-0 h-2/3 w-1/2 bg-[radial-gradient(ellipse_60%_80%_at_100%_100%,rgba(59,130,246,0.25),transparent)]"
        aria-hidden
      />

      <div className="relative mx-auto flex max-w-[82rem] flex-col items-start justify-between gap-10 px-5 sm:flex-row sm:items-center sm:px-8">
        <div className="max-w-xl">
          <p className="se-font-mono text-xs font-medium uppercase tracking-[0.2em] text-white/70">
            {eyebrow}
          </p>
          <h2
            id="se-utility-title"
            className="se-font-display mt-3 text-[clamp(1.75rem,3vw,2.5rem)] font-bold leading-tight text-white text-wrap-balance"
          >
            {title}
          </h2>
          <p className="se-font-body mt-4 text-sm leading-relaxed text-white/78 sm:text-base">
            {subtitle}
          </p>
          <div className="se-trust-strip mt-6">
            {["SOC 2", "99.9% uptime", "14-day onboarding"].map((badge) => (
              <span key={badge} className="se-trust-badge border-white/15 bg-white/8 text-white/80">
                <span className="se-signal text-[0.5rem]" aria-hidden>
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
            className="inline-flex min-h-[3rem] items-center justify-center rounded-[var(--radius-md)] bg-white px-6 py-3 text-sm font-semibold text-[var(--color-primary)] shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5 hover:bg-white/95 hover:shadow-[0_12px_32px_rgba(0,0,0,0.22)] se-focus-ring"
          >
            {primaryCta}
          </a>
          <a
            href="/platform"
            className="inline-flex min-h-[3rem] items-center justify-center rounded-[var(--radius-md)] border border-white/35 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-white/60 hover:bg-white/10 se-focus-ring"
          >
            {secondaryCta}
          </a>
        </div>
      </div>
    </section>
  );
}

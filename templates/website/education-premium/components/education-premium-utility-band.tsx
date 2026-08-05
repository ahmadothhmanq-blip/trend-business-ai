"use client";

type EducationPremiumUtilityBandProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  primaryCta?: string;
  secondaryCta?: string;
};

export function EducationPremiumUtilityBand({
  eyebrow = "Join our community",
  title = "Ready to begin your scholarly journey?",
  subtitle = "Applications are now open for the Class of 2030. Discover why 12,000 students choose Scholar's Hall.",
  primaryCta = "Apply for admission",
  secondaryCta = "Download viewbook",
}: EducationPremiumUtilityBandProps) {
  return (
    <section
      id="cta-band"
      data-v2-component="education-premium-utility-band"
      aria-labelledby="ed-utility-title"
      className="relative overflow-hidden bg-[var(--color-primary)] py-16 sm:py-20"
    >
      <div className="ed-grid-bg pointer-events-none absolute inset-0 opacity-[0.14]" aria-hidden />
      <div
        className="pointer-events-none absolute -start-1/4 top-0 h-full w-1/2 bg-[radial-gradient(ellipse_70%_90%_at_0%_50%,rgba(247,243,236,0.1),transparent)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -end-1/4 bottom-0 h-2/3 w-1/2 bg-[radial-gradient(ellipse_60%_80%_at_100%_100%,rgba(197,165,114,0.2),transparent)]"
        aria-hidden
      />

      <div className="relative mx-auto flex max-w-[82rem] flex-col items-start justify-between gap-10 px-5 sm:flex-row sm:items-center sm:px-8">
        <div className="max-w-xl">
          <p className="ed-font-mono text-xs font-medium uppercase tracking-[0.2em] text-white/70">
            {eyebrow}
          </p>
          <h2
            id="ed-utility-title"
            className="ed-font-display mt-3 text-[clamp(1.75rem,3vw,2.5rem)] font-semibold leading-tight text-white text-wrap-balance"
          >
            {title}
          </h2>
          <p className="ed-font-body mt-4 text-sm leading-relaxed text-white/78 sm:text-base">
            {subtitle}
          </p>
          <div className="ed-trust-strip mt-6">
            {["Need-blind admissions", "100% aid met", "12:1 ratio"].map((badge) => (
              <span
                key={badge}
                className="ed-trust-badge inline-flex items-center gap-1.5 border-white/15 bg-white/8 px-3 py-1 text-[0.6875rem] font-medium text-white/80"
              >
                <span className="ed-signal text-[0.5rem]" aria-hidden>
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
            className="inline-flex min-h-[3rem] items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-cream,#F7F3EC)] px-6 py-3 text-sm font-semibold text-[var(--color-primary)] shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_12px_32px_rgba(0,0,0,0.22)] ed-focus-ring"
          >
            {primaryCta}
          </a>
          <a
            href="#about"
            className="inline-flex min-h-[3rem] items-center justify-center rounded-[var(--radius-md)] border border-white/35 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-white/60 hover:bg-white/10 ed-focus-ring"
          >
            {secondaryCta}
          </a>
        </div>
      </div>
    </section>
  );
}

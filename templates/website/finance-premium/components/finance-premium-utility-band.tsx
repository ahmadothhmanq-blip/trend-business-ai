"use client";

export function FinancePremiumUtilityBand() {
  return (
    <section id="cta-band" data-v2-component="finance-premium-utility-band" aria-labelledby="fn-utility-title" className="df-reveal relative overflow-hidden border-y border-[var(--border-accent)] bg-[var(--color-primary)] py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_100%_50%,color-mix(in_srgb,var(--color-accent)_12%,transparent),transparent)]" aria-hidden />
      <div className="relative mx-auto flex max-w-[82rem] flex-col items-start justify-between gap-8 px-5 sm:flex-row sm:items-center sm:px-8">
        <div className="max-w-xl">
          <p className="fn-eyebrow text-[var(--color-accent)]">Next step</p>
          <h2 id="fn-utility-title" className="fn-headline-sm mt-3 text-white text-balance">Begin your advisory relationship</h2>
          <p className="mt-4 text-sm leading-relaxed text-white/75">
            A confidential conversation with a Ledger partner — no obligation, no product pitch.
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <a href="#contact" className="inline-flex min-h-[3rem] items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-accent)] px-6 py-3 text-sm font-semibold text-[var(--color-primary)] fn-focus-ring">
            Schedule consultation
          </a>
          <a href="#portfolio" className="inline-flex min-h-[3rem] items-center justify-center rounded-[var(--radius-md)] border border-white/30 px-6 py-3 text-sm font-semibold text-white fn-focus-ring">
            View mandates
          </a>
        </div>
      </div>
    </section>
  );
}

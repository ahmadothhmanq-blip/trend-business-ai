"use client";

type AiStartupSignalUtilityBandProps = {
  title?: string;
  subtitle?: string;
  primaryCta?: string;
};

export function AiStartupSignalUtilityBand({
  title = "Ready to route production inference?",
  subtitle = "Join platform teams shipping models with signal-grade reliability.",
  primaryCta = "Request access",
}: AiStartupSignalUtilityBandProps) {
  return (
    <section id="cta-band" data-v2-component="ai-startup-signal-utility-band" className="df-reveal relative overflow-hidden border-y border-[var(--border-accent)] bg-[var(--color-primary)] py-16 sm:py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,color-mix(in_srgb,var(--color-signal)_18%,transparent),transparent)]" aria-hidden />
      <div className="relative mx-auto flex max-w-[82rem] flex-col items-start justify-between gap-8 px-5 sm:flex-row sm:items-center sm:px-8">
        <div>
          <h2 className="as-headline-sm text-white">{title}</h2>
          <p className="mt-4 max-w-xl text-sm text-white/75">{subtitle}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {["SOC 2", "99.99% SLA", "48 regions"].map((b) => (
              <span key={b} className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/80">
                {b}
              </span>
            ))}
          </div>
        </div>
        <a href="#contact" className="as-btn-primary as-focus-ring shrink-0 !bg-white !text-[var(--color-primary)] hover:!bg-white/90">
          {primaryCta}
        </a>
      </div>
    </section>
  );
}

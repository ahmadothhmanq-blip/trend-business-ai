"use client";

const DEFAULT_INTEGRATIONS = [
  "BlackRock",
  "Goldman Sachs",
  "J.P. Morgan",
  "Morgan Stanley",
  "Bloomberg",
  "Morningstar",
  "CFA Institute",
  "State Street",
  "Northern Trust",
  "Charles Schwab",
];

type FinancePremiumIntegrationsProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  logos?: string[];
};

export function FinancePremiumIntegrations({
  eyebrow = "Global network",
  title = "Institutional partnerships",
  subtitle = "Certified relationships with leading custodians, platforms, and research providers worldwide.",
  logos = DEFAULT_INTEGRATIONS,
}: FinancePremiumIntegrationsProps) {
  const doubled = [...logos, ...logos];

  return (
    <section
      id="platform"
      data-v2-component="finance-premium-integrations"
      aria-labelledby="fn-integrations-title"
      className="border-y border-[var(--border-default)] bg-[var(--color-ink)] py-12 sm:py-14"
    >
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <header className="mb-10 text-center">
          <p className="fn-eyebrow mb-3">{eyebrow}</p>
          <h2 id="fn-integrations-title" className="fn-headline-sm text-[var(--color-background)]">
            {title}
          </h2>
          <p className="fn-font-body mx-auto mt-3 max-w-lg text-sm text-[color-mix(in_srgb,var(--color-background)_65%,transparent)]">
            {subtitle}
          </p>
        </header>
      </div>

      <div className="relative overflow-hidden" aria-label="Institutional partners">
        <div className="flex fn-marquee-track motion-safe:animate-[fn-marquee_40s_linear_infinite] hover:[animation-play-state:paused]">
          {doubled.map((logo, i) => (
            <div
              key={`${logo}-${i}`}
              className="mx-3 flex h-14 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-[color-mix(in_srgb,var(--color-signal)_25%,transparent)] bg-[color-mix(in_srgb,var(--color-background)_6%,transparent)] px-8"
            >
              <span className="fn-font-display text-sm font-medium text-[color-mix(in_srgb,var(--color-background)_75%,transparent)]">
                {logo}
              </span>
            </div>
          ))}
        </div>
      </div>

      <p className="fn-font-body mx-auto mt-8 max-w-[82rem] px-5 text-center text-xs text-[color-mix(in_srgb,var(--color-background)_50%,transparent)] sm:px-8">
        Certified institutional network · Custom advisory engagements
      </p>
    </section>
  );
}

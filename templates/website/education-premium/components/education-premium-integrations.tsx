"use client";

const DEFAULT_INTEGRATIONS = [
  "Oxford",
  "Cambridge",
  "Sorbonne",
  "Tokyo U",
  "ETH Zurich",
  "McGill",
  "Yale",
  "Stanford",
  "MIT",
  "Harvard",
];

type EducationPremiumIntegrationsProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  logos?: string[];
};

export function EducationPremiumIntegrations({
  eyebrow = "Global partnerships",
  title = "A network of world-class institutions",
  subtitle = "Exchange programs and research collaborations with leading universities across six continents.",
  logos = DEFAULT_INTEGRATIONS,
}: EducationPremiumIntegrationsProps) {
  const doubled = [...logos, ...logos];

  return (
    <section
      id="platform"
      data-v2-component="education-premium-integrations"
      aria-labelledby="ed-integrations-title"
      className="border-y border-[var(--border-default)] bg-[var(--color-background)] py-12 sm:py-14"
    >
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <header className="mb-10 text-center">
          <p className="ed-eyebrow mb-3">{eyebrow}</p>
          <h2 id="ed-integrations-title" className="ed-headline-sm">
            {title}
          </h2>
          <p className="ed-body mx-auto mt-3 max-w-lg text-sm">{subtitle}</p>
        </header>
      </div>

      <div className="relative overflow-hidden" aria-label="Partner universities">
        <div className="ed-marquee-track flex motion-safe:animate-[ed-marquee_40s_linear_infinite] hover:[animation-play-state:paused]">
          {doubled.map((logo, i) => (
            <div
              key={`${logo}-${i}`}
              className="mx-3 flex h-14 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--color-surface)] px-8 shadow-[var(--shadow-card)]"
            >
              <span className="ed-font-display text-sm font-semibold text-[var(--color-muted)]">
                {logo}
              </span>
            </div>
          ))}
        </div>
      </div>

      <p className="ed-font-body mx-auto mt-8 max-w-[82rem] px-5 text-center text-xs text-[var(--color-muted)] sm:px-8">
        80+ exchange programs · Research collaborations worldwide
      </p>
    </section>
  );
}

"use client";

const DEFAULT_STATS = [
  {
    "value": "240+",
    "label": "Global launches",
    "detail": "2020–2026"
  },
  {
    "value": "38",
    "label": "Markets served",
    "detail": "6 continents"
  },
  {
    "value": "92%",
    "label": "Repeat clients",
    "detail": "studio average"
  },
  {
    "value": "18",
    "label": "Design awards",
    "detail": "last 3 years"
  }
];

type CreativePortfolioStatsProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  stats?: Array<{ value: string; label: string; detail?: string }>;
};

export function CreativePortfolioStats({
  eyebrow = "Impact",
  title = "Numbers that matter",
  subtitle = "Measured across our global client base.",
  stats = DEFAULT_STATS,
}: CreativePortfolioStatsProps) {
  return (
    <section id="stats" data-v2-component="creative-portfolio-stats" className="df-reveal border-y border-[var(--border-default)] py-20 sm:py-28">
      <dl className="mx-auto flex max-w-[88rem] flex-wrap justify-between gap-8 px-5 sm:px-8">
        {stats.map((s) => (
          <div key={s.label}>
            <dd className="cp-font-display text-4xl font-bold">{s.value}</dd>
            <dt className="mt-1 text-sm text-[var(--color-muted)]">{s.label}</dt>
          </div>
        ))}
      </dl>
    </section>
  );
}

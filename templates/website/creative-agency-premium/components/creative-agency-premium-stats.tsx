"use client";

const STATS = [
  { value: "240+", label: "Global launches", detail: "2020–2026" },
  { value: "38", label: "Markets served", detail: "6 continents" },
  { value: "92%", label: "Client retention", detail: "studio average" },
  { value: "18", label: "Design awards", detail: "last 3 years" },
];

export function CreativeAgencyPremiumStats() {
  return (
    <section id="stats" data-v2-component="creative-agency-premium-stats" aria-labelledby="sv-stats-title" className="df-reveal border-y border-[var(--border-default)] bg-[var(--color-surface)] py-20 sm:py-28">
      <div className="mx-auto max-w-[88rem] px-5 sm:px-8">
        <header className="mb-12 max-w-2xl">
          <p className="sv-font-mono text-[0.6875rem] tracking-[0.22em] text-[var(--color-volt)]">Studio impact</p>
          <h2 id="sv-stats-title" className="sv-font-display mt-3 text-3xl font-semibold text-[var(--color-ghost)] [text-transform:none]">
            Craft measured in outcomes
          </h2>
        </header>
        <dl className="df-reveal-stagger grid gap-px bg-[var(--border-default)] sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="bg-[var(--color-surface)] px-6 py-10 text-center sm:py-12">
              <dd className="sv-font-display text-4xl font-semibold text-[var(--color-ghost)] [text-transform:none]">{s.value}</dd>
              <dt className="mt-2 text-sm font-medium text-[var(--color-ghost)]">{s.label}</dt>
              <p className="mt-1 text-xs text-[var(--color-muted)]">{s.detail}</p>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

"use client";

const STATS = [
  { value: "$48B", label: "Assets advised", detail: "Global AUM" },
  { value: "97%", label: "Client retention", detail: "10-year average" },
  { value: "28", label: "Financial centers", detail: "Active desks" },
  { value: "150+", label: "Advisory specialists", detail: "CFA, CPA credentialed" },
];

export function FinancePremiumStats() {
  return (
    <section id="stats" data-v2-component="finance-premium-stats" aria-labelledby="fn-stats-title" className="df-reveal border-y border-[var(--border-default)] bg-[var(--color-background)] py-20 sm:py-28">
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <header className="mb-12 max-w-2xl">
          <p className="fn-eyebrow">Impact</p>
          <h2 id="fn-stats-title" className="fn-headline-sm mt-2">Measured across cycles</h2>
          <p className="fn-body mt-4 text-[var(--color-muted)]">Discipline that compounds — through bull markets and drawdowns alike.</p>
        </header>
        <dl className="df-reveal-stagger grid gap-px bg-[var(--border-default)] sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="bg-[var(--color-surface)] px-6 py-10 text-center sm:text-start">
              <dd className="fn-metric text-3xl">{s.value}</dd>
              <dt className="mt-2 font-semibold">{s.label}</dt>
              {s.detail ? <p className="mt-1 text-xs text-[var(--color-muted)]">{s.detail}</p> : null}
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

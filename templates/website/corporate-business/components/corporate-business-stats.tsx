"use client";

const STATS = [
  { value: "$2.1B", label: "Cost savings delivered", detail: "Cumulative client impact" },
  { value: "340+", label: "Programs completed", detail: "Since 2008" },
  { value: "42", label: "Countries", detail: "Active delivery" },
  { value: "94%", label: "Repeat clients", detail: "3-year average" },
];

export function CorporateBusinessStats() {
  return (
    <section id="stats" data-v2-component="corporate-business-stats" aria-labelledby="cb-stats-title" className="df-reveal border-y border-[var(--border-default)] py-20 sm:py-28">
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <header className="mb-12 text-center">
          <p className="cb-eyebrow">Impact</p>
          <h2 id="cb-stats-title" className="cb-headline-sm mt-2">Outcomes at scale</h2>
        </header>
        <dl className="df-reveal-stagger grid gap-px bg-[var(--border-default)] sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="bg-[var(--color-background)] px-6 py-10 text-center">
              <dd className="cb-font-display text-3xl font-semibold text-[var(--color-accent)]">{s.value}</dd>
              <dt className="mt-2 font-semibold">{s.label}</dt>
              <p className="mt-1 text-xs text-[var(--color-muted)]">{s.detail}</p>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

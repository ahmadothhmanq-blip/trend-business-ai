"use client";

const CASES = [
  { client: "Global retailer", sector: "Consumer", outcome: "−18% opex", detail: "Operating model redesign across 14 markets with shared services hub." },
  { client: "Energy conglomerate", sector: "Industrial", outcome: "4.2x ROI", detail: "Digital twin and predictive maintenance program across upstream assets." },
  { client: "Healthcare network", sector: "Healthcare", outcome: "12 mo", detail: "EHR consolidation and clinical workflow transformation for 40 hospitals." },
];

export function CorporateBusinessPortfolio() {
  return (
    <section id="portfolio" data-v2-component="corporate-business-portfolio" aria-labelledby="cb-portfolio-title" className="df-reveal cb-section-alt bg-[var(--color-surface)] py-20 sm:py-28">
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <header className="mb-12 max-w-2xl">
          <p className="cb-eyebrow">Case studies</p>
          <h2 id="cb-portfolio-title" className="cb-headline-sm mt-2">Transformations in market</h2>
        </header>
        <ul className="divide-y divide-[var(--border-default)] border-y border-[var(--border-default)]">
          {CASES.map((item, i) => (
            <li key={item.client} className="df-reveal-stagger grid gap-4 py-10 lg:grid-cols-[auto_1fr_auto] lg:items-center">
              <span className="cb-font-display text-4xl font-light text-[var(--color-accent)]">{String(i + 1).padStart(2, "0")}</span>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wider text-[var(--color-muted)]">{item.sector}</p>
                <h3 className="cb-font-display mt-1 text-xl font-semibold">{item.client}</h3>
                <p className="mt-2 max-w-2xl text-sm text-[var(--color-muted)]">{item.detail}</p>
              </div>
              <p className="cb-font-display text-2xl font-semibold text-[var(--color-accent)] lg:text-end">{item.outcome}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

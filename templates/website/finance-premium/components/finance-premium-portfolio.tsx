"use client";

const MANDATES = [
  {
    client: "Sovereign reserve fund",
    sector: "Public institutions",
    outcome: "+180bps",
    detail: "Strategic asset allocation review across public and private markets with governance overhaul.",
  },
  {
    client: "Multi-generational estate",
    sector: "Private wealth",
    outcome: "$2.4B",
    detail: "Consolidated twelve entities into a unified family governance and investment framework.",
  },
  {
    client: "University endowment",
    sector: "Nonprofit",
    outcome: "−22% vol",
    detail: "Risk-budgeted portfolio redesign with liquidity planning for annual distribution requirements.",
  },
];

export function FinancePremiumPortfolio() {
  return (
    <section id="portfolio" data-v2-component="finance-premium-portfolio" aria-labelledby="fn-portfolio-title" className="df-reveal py-20 sm:py-28">
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <header className="mb-12 flex flex-col gap-4 border-b border-[var(--border-default)] pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="fn-eyebrow">Representative mandates</p>
            <h2 id="fn-portfolio-title" className="fn-headline-sm mt-2">Outcomes across client types</h2>
          </div>
          <p className="max-w-sm text-sm text-[var(--color-muted)]">Selected engagements — many confidential mandates not listed.</p>
        </header>
        <ul className="divide-y divide-[var(--border-default)] border-y border-[var(--border-default)]">
          {MANDATES.map((item) => (
            <li key={item.client} className="df-reveal-stagger grid gap-4 py-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wider text-[var(--color-muted)]">{item.sector}</p>
                <h3 className="mt-1 fn-font-display text-xl font-semibold">{item.client}</h3>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--color-muted)]">{item.detail}</p>
              </div>
              <p className="fn-metric text-3xl lg:text-end">{item.outcome}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

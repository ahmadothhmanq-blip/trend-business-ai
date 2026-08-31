"use client";

const PARTNERS = [
  { name: "Global custodians", detail: "Multi-currency settlement & safekeeping" },
  { name: "Benchmark indices", detail: "MSCI, Bloomberg, and custom benchmarks" },
  { name: "Portfolio accounting", detail: "Daily NAV, performance attribution" },
  { name: "Regulatory reporting", detail: "SEC, FCA, and FATCA compliance" },
  { name: "Tax & audit", detail: "Coordinated with Big Four partners" },
  { name: "Risk analytics", detail: "Stress testing & scenario modeling" },
];

export function FinancePremiumIntegrations() {
  return (
    <section id="platform" data-v2-component="finance-premium-integrations" aria-labelledby="fn-platform-title" className="df-reveal fn-section-alt bg-[var(--color-surface)] py-20 sm:py-28">
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <header className="mb-12 max-w-2xl border-s-4 border-[var(--color-accent)] ps-6">
          <p className="fn-eyebrow">Market infrastructure</p>
          <h2 id="fn-platform-title" className="fn-headline-sm mt-3">Connected to institutional-grade systems</h2>
          <p className="fn-body mt-4 text-[var(--color-muted)]">
            Reporting, custody, and analytics integrated with the platforms your board and regulators expect.
          </p>
        </header>
        <div className="df-reveal-stagger grid gap-px bg-[var(--border-default)] sm:grid-cols-2 lg:grid-cols-3">
          {PARTNERS.map((partner, i) => (
            <article key={partner.name} className="bg-[var(--color-background)] p-7">
              <span className="fn-font-mono text-xs text-[var(--color-accent)]">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="fn-font-display mt-3 text-lg font-semibold">{partner.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">{partner.detail}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

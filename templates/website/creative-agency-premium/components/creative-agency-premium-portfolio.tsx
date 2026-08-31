"use client";

const CASES = [
  {
    client: "Archetype",
    sector: "Technology",
    scope: "Brand system · Product UI · Launch",
    result: "3.2× brand recall across 12 markets",
    year: "2025",
  },
  {
    client: "Monolith",
    sector: "Financial services",
    scope: "Identity · Campaign · Digital",
    result: "48% lift in consideration post-rebrand",
    year: "2025",
  },
  {
    client: "Helix",
    sector: "Healthcare",
    scope: "Platform redesign · Content system",
    result: "Unified experience across 6 regions",
    year: "2024",
  },
  {
    client: "Northwind",
    sector: "Luxury retail",
    scope: "E-commerce · Seasonal campaigns",
    result: "2.8× engagement on relaunch",
    year: "2024",
  },
];

type CreativeAgencyPremiumPortfolioProps = {
  eyebrow?: string;
  title?: string;
  items?: typeof CASES;
};

export function CreativeAgencyPremiumPortfolio({
  eyebrow = "Work",
  title = "Case studies",
  items = CASES,
}: CreativeAgencyPremiumPortfolioProps) {
  return (
    <section id="portfolio" data-v2-component="creative-agency-premium-portfolio" className="df-reveal bg-[var(--color-surface)] py-20 sm:py-28">
      <div className="mx-auto max-w-[88rem] px-5 sm:px-8">
        <p className="sv-font-mono text-[0.6875rem] tracking-[0.22em] text-[var(--color-volt)]">{eyebrow}</p>
        <h2 className="sv-font-display mt-3 text-3xl font-semibold text-[var(--color-ghost)] [text-transform:none]">{title}</h2>

        <ul className="mt-12">
          {items.map((item, i) => (
            <li key={item.client} className="border-t border-[var(--border-default)] last:border-b">
              <article className="df-reveal-stagger group grid gap-4 py-8 transition-colors hover:bg-[var(--color-background)] sm:grid-cols-[3rem_1.2fr_1fr_1fr_4rem] sm:items-center sm:gap-6 sm:py-10">
                <span className="sv-font-mono text-sm text-[var(--color-volt)]">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="sv-font-display text-2xl font-semibold text-[var(--color-ghost)] [text-transform:none]">{item.client}</h3>
                <p className="text-sm text-[var(--color-muted)]">{item.sector}</p>
                <p className="text-sm text-[var(--color-muted)]">{item.scope}</p>
                <span className="sv-font-mono text-sm text-[var(--color-muted)] sm:text-end">{item.year}</span>
                <p className="col-span-full text-sm font-medium text-[var(--color-ghost)] sm:col-start-2">{item.result}</p>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

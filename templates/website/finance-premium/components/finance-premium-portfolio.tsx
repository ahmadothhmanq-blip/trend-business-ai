"use client";

import { SlotImage } from "@/lib/website/template-v2/slots";

const DEFAULT_OUTCOMES = [
  {
    company: "Holt Family Office",
    industry: "Private wealth",
    outcome: "3.2×",
    outcomeLabel: "portfolio growth",
    detail: "Multi-generational wealth plan spanning private equity, real assets, and philanthropic structures.",
  },
  {
    company: "Harbor Endowment",
    industry: "Institutional",
    outcome: "$840M",
    outcomeLabel: "assets stewarded",
    detail: "Endowment restructuring with fiduciary governance and risk-aligned alternative allocation.",
  },
  {
    company: "Northgate Private Bank",
    industry: "Banking",
    outcome: "28%",
    outcomeLabel: "risk reduction",
    detail: "Cross-border capital strategy and succession architecture for a multi-family banking group.",
  },
];

type FinancePremiumPortfolioProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{
    company: string;
    industry: string;
    outcome: string;
    outcomeLabel?: string;
    detail: string;
  }>;
};

export function FinancePremiumPortfolio({
  eyebrow = "Client outcomes",
  title = "Stewardship that endures",
  subtitle = "Representative engagements across private wealth, institutional advisory, and fiduciary services.",
  items = DEFAULT_OUTCOMES,
}: FinancePremiumPortfolioProps) {
  return (
    <section
      id="customers"
      data-v2-component="finance-premium-portfolio"
      aria-labelledby="fn-portfolio-title"
      className="fn-section bg-[var(--color-surface)]"
    >
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <header className="mb-12 max-w-2xl">
          <p className="fn-eyebrow mb-3">{eyebrow}</p>
          <h2 id="fn-portfolio-title" className="fn-headline-sm">
            {title}
          </h2>
          <div className="fn-accent-line mt-4" aria-hidden />
          <p className="fn-body text-muted-foreground mt-5">{subtitle}</p>
        </header>

        <div className="grid gap-5 md:grid-cols-3">
          {items.map((item, index) => (
            <article key={item.company} className="fn-card group relative overflow-hidden">
              <div
                className="absolute inset-x-0 top-0 z-10 h-[2px] bg-gradient-to-r from-[var(--color-signal)] to-transparent opacity-0 transition-opacity group-hover:opacity-100"
                aria-hidden
              />
              <div className="relative aspect-[16/10] overflow-hidden">
                <SlotImage
                  slot="features"
                  index={index}
                  alt={`${item.company} engagement`}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-ink)] via-[color-mix(in_srgb,var(--color-ink)_40%,transparent)] to-transparent opacity-80" />
                <p className="fn-font-mono absolute bottom-4 start-4 text-[0.625rem] font-medium uppercase tracking-wider text-[var(--color-signal)]">
                  {item.industry}
                </p>
              </div>
              <div className="p-6 sm:p-7">
                <h3 className="fn-font-display text-lg font-semibold text-[var(--color-foreground)]">
                  {item.company}
                </h3>
                <div className="mt-5 flex items-baseline gap-2">
                  <span className="fn-metric text-3xl">{item.outcome}</span>
                  {item.outcomeLabel ? (
                    <span className="fn-font-body text-sm text-[var(--color-muted)]">
                      {item.outcomeLabel}
                    </span>
                  ) : null}
                </div>
                <p className="fn-font-body mt-4 text-sm leading-relaxed text-[var(--color-muted)]">
                  {item.detail}
                </p>
                <p className="fn-font-mono mt-6 text-[0.625rem] text-[var(--color-signal)]">
                  Case study 0{index + 1}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import { SlotImage } from "@/lib/website/template-v2/slots";

const DEFAULT_OUTCOMES = [
  {
    company: "Apex Holdings",
    industry: "Private Equity",
    outcome: "3.2×",
    outcomeLabel: "portfolio value uplift",
    detail: "Restructured operating model across 4 portfolio companies within 18 months.",
  },
  {
    company: "Northgate Financial",
    industry: "Banking",
    outcome: "$840M",
    outcomeLabel: "risk exposure reduced",
    detail: "Board-level governance framework aligned regulatory compliance with growth strategy.",
  },
  {
    company: "Helix Manufacturing",
    industry: "Industrial",
    outcome: "28%",
    outcomeLabel: "margin improvement",
    detail: "Supply chain optimization and leadership succession planning across 3 regions.",
  },
];

type CorporateBusinessPortfolioProps = {
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

export function CorporateBusinessPortfolio({
  eyebrow = "Client outcomes",
  title = "Boards trust Meridian Advisory",
  subtitle = "Executive teams navigate transformation, governance, and global expansion with measurable strategic impact.",
  items = DEFAULT_OUTCOMES,
}: CorporateBusinessPortfolioProps) {
  return (
    <section
      id="customers"
      data-v2-component="corporate-business-portfolio"
      aria-labelledby="cb-portfolio-title"
      className="cb-section"
    >
      <div className="cb-container">
        <div className="mb-16 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <header className="max-w-xl">
            <p className="cb-eyebrow mb-6">{eyebrow}</p>
            <h2 id="cb-portfolio-title" className="cb-headline-sm">
              {title}
            </h2>
          </header>
          <p className="cb-prose lg:max-w-md lg:text-end">{subtitle}</p>
        </div>

        <div className="space-y-6">
          {items.map((item, index) => (
            <article
              key={item.company}
              className="cb-card group grid overflow-hidden lg:grid-cols-12"
            >
              <div className="relative aspect-[16/9] overflow-hidden lg:col-span-5 lg:aspect-auto lg:min-h-[16rem]">
                <SlotImage
                  slot="features"
                  index={index}
                  alt={`${item.company} engagement`}
                  className="h-full w-full object-cover saturate-[0.88] transition-transform duration-700 group-hover:scale-[1.03]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-ink)]/40 to-transparent lg:bg-gradient-to-t lg:from-[var(--color-ink)]/50" />
                <div className="absolute bottom-6 start-6">
                  <p className="cb-font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-white/60">
                    Case study 0{index + 1}
                  </p>
                  <p className="cb-font-display mt-1 text-xl font-medium text-white">{item.company}</p>
                </div>
              </div>
              <div className="flex flex-col justify-center p-8 sm:p-10 lg:col-span-7">
                <p className="cb-font-mono text-[0.625rem] uppercase tracking-[0.12em] text-[var(--color-muted)]">
                  {item.industry}
                </p>
                <div className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="cb-metric">{item.outcome}</span>
                  {item.outcomeLabel ? (
                    <span className="cb-font-body text-sm text-[var(--color-muted)]">{item.outcomeLabel}</span>
                  ) : null}
                </div>
                <p className="cb-font-body mt-6 max-w-lg text-[0.9375rem] leading-[1.75] text-[var(--color-muted)]">
                  {item.detail}
                </p>
                <a href="#contact" className="cb-btn-ghost mt-8">
                  Discuss a similar engagement <span aria-hidden>→</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

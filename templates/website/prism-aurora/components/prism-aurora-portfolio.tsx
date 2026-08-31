"use client";

const DEFAULT_ITEMS = [
  {
    company: "Vertex Systems",
    industry: "Technology",
    outcome: "42%",
    outcomeLabel: "faster cycles",
    detail: "Unified operations across six regions with measurable ROI in quarter one.",
  },
  {
    company: "Helix Group",
    industry: "Healthcare",
    outcome: "$3.1M",
    outcomeLabel: "value unlocked",
    detail: "Identified expansion opportunities weeks earlier with proactive insights.",
  },
  {
    company: "Axiom Logistics",
    industry: "Supply Chain",
    outcome: "99%",
    outcomeLabel: "accuracy",
    detail: "Replaced manual workflows with live intelligence dashboards.",
  },
];

type PrismAuroraPortfolioProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ company: string; industry: string; outcome: string; outcomeLabel?: string; detail: string }>;
};

export function PrismAuroraPortfolio({
  eyebrow = "Selected work",
  title = "Outcomes that speak for themselves",
  subtitle = "Real results from organizations that chose to lead.",
  items = DEFAULT_ITEMS,
}: PrismAuroraPortfolioProps) {
  return (
    <section id="portfolio" data-v2-component="prism-aurora-portfolio" className="pr-reveal pr-section bg-[var(--color-background)] px-4 sm:px-6">
      <div className="mx-auto max-w-[88rem]">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="pr-eyebrow">{eyebrow}</p>
            <h2 className="pr-headline-sm mt-2 max-w-[16ch]">{title}</h2>
          </div>
          <p className="pr-body max-w-sm sm:text-end">{subtitle}</p>
        </div>
        <div className="pr-mosaic pr-reveal-stagger">
          {items.map((item, i) => (
            <article
              key={item.company}
              className={`pr-tile ${i === 0 ? "pr-span-8 pr-row-2 pr-tile-field-a" : i === 1 ? "pr-span-4 pr-row-2 pr-tile-field-b" : "pr-span-12 pr-tile-field-c"}`}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h3 className="pr-font-display text-2xl font-bold tracking-[-0.02em]">{item.company}</h3>
                <span className="pr-eyebrow !normal-case !tracking-normal">{item.industry}</span>
              </div>
              <p className="pr-metric mt-6">
                {item.outcome}
                {item.outcomeLabel ? <span className="ms-2 text-base font-medium text-[var(--color-muted)]">{item.outcomeLabel}</span> : null}
              </p>
              <p className="pr-body mt-4 max-w-xl">{item.detail}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

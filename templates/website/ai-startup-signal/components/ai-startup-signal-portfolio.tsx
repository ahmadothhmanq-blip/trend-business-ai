"use client";

const DEFAULT_ITEMS = [
  {
    "company": "Vertex Systems",
    "industry": "Technology",
    "outcome": "42%",
    "outcomeLabel": "faster cycles",
    "detail": "Unified operations across six regions with measurable ROI in quarter one."
  },
  {
    "company": "Helix Group",
    "industry": "Healthcare",
    "outcome": "$3.1M",
    "outcomeLabel": "value unlocked",
    "detail": "Identified expansion opportunities weeks earlier with proactive insights."
  },
  {
    "company": "Axiom Logistics",
    "industry": "Supply Chain",
    "outcome": "99%",
    "outcomeLabel": "accuracy",
    "detail": "Replaced manual workflows with live intelligence dashboards."
  }
];

type AiStartupSignalPortfolioProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ company: string; industry: string; outcome: string; outcomeLabel?: string; detail: string }>;
};

export function AiStartupSignalPortfolio({
  eyebrow = "Selected work",
  title = "Outcomes that speak for themselves",
  subtitle = "Real results from organizations that chose to lead.",
  items = DEFAULT_ITEMS,
}: AiStartupSignalPortfolioProps) {
  return (
    <section id="portfolio" data-v2-component="ai-startup-signal-portfolio" aria-labelledby="as-portfolio-title" className="df-reveal as-section bg-[var(--color-surface)] py-20 sm:py-28">
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <header className="mb-9 max-w-2xl">
          <p className="as-eyebrow">{eyebrow}</p>
          <h2 id="as-portfolio-title" className="as-headline-sm mt-2">{title}</h2>
          <p className="as-body mt-4 text-[var(--color-muted)]">{subtitle}</p>
        </header>
        <div className="df-reveal-stagger grid gap-4 md:grid-cols-3">
          {items.map((item, i) => (
            <article key={item.company} className="as-card p-6">
              <p className="text-xs uppercase text-[var(--color-muted)]">{item.industry}</p>
              <h3 className="mt-2 text-lg font-bold">{item.company}</h3>
              <p className="as-metric mt-4">{item.outcome} <span className="text-sm font-normal text-[var(--color-muted)]">{item.outcomeLabel}</span></p>
              <p className="mt-3 text-sm text-[var(--color-muted)]">{item.detail}</p>
              <p className="mt-4 text-xs text-[var(--color-signal)]">Case 0{i + 1}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

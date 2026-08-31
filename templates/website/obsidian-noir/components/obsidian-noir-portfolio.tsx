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

type ObsidianNoirPortfolioProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ company: string; industry: string; outcome: string; outcomeLabel?: string; detail: string }>;
};

export function ObsidianNoirPortfolio({
  eyebrow = "Selected work",
  title = "Evidence, not spectacle",
  items = DEFAULT_ITEMS,
}: ObsidianNoirPortfolioProps) {
  return (
    <section id="portfolio" data-v2-component="obsidian-noir-portfolio" className="ob-reveal ob-section px-5 sm:px-8">
      <div className="mx-auto max-w-[72rem]">
        <p className="ob-eyebrow">{eyebrow}</p>
        <h2 className="ob-headline-sm mt-4">{title}</h2>
        <hr className="ob-rule mt-12" />
        <div className="ob-reveal-stagger">
          {items.map((item) => (
            <article key={item.company} className="grid gap-4 border-b border-[var(--border-default)] py-12 md:grid-cols-[1fr_8rem]">
              <div>
                <h3 className="ob-thesis-title">{item.company}</h3>
                <p className="ob-attribution mt-2">{item.industry}</p>
                <p className="ob-body mt-4 max-w-2xl">{item.detail}</p>
              </div>
              <p className="ob-metric md:text-end">
                {item.outcome}
                {item.outcomeLabel ? <span className="mt-2 block text-sm font-normal tracking-normal text-[var(--color-muted)]">{item.outcomeLabel}</span> : null}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

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

type ForgeIndustrialPortfolioProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ company: string; industry: string; outcome: string; outcomeLabel?: string; detail: string }>;
  figureLabel?: string;
};

export function ForgeIndustrialPortfolio({
  eyebrow = "Case figures",
  title = "Deployment case plates",
  subtitle = "Documented outcomes referenced as engineering figures — not marketing tiles.",
  items = DEFAULT_ITEMS,
  figureLabel = "FIG. 05 — CASE FIGURES",
}: ForgeIndustrialPortfolioProps) {
  return (
    <section
      id="portfolio"
      data-v2-component="forge-industrial-portfolio"
      aria-labelledby="fg-portfolio-title"
      className="fg-grid-paper fg-section fg-reveal"
    >
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <div className="fg-frame">
          <p className="fg-fig-label">{figureLabel}</p>
          <p className="fg-eyebrow mt-4">{eyebrow}</p>
          <h2 id="fg-portfolio-title" className="fg-headline-sm mt-2">
            {title}
          </h2>
          <p className="fg-body mt-4 max-w-2xl">{subtitle}</p>

          <div className="fg-reveal-stagger mt-8 grid gap-4 lg:grid-cols-3">
            {items.map((item, index) => (
              <article key={item.company} className="fg-case-figure">
                <header className="fg-case-figure-head">
                  <span>FIG. {String(index + 6).padStart(2, "0")}</span>
                  <span>{item.industry}</span>
                </header>
                <div className="fg-case-figure-body">
                  <h3 className="fg-font-display text-lg font-semibold uppercase tracking-wide">{item.company}</h3>
                  <p className="fg-metric mt-3">
                    {item.outcome}
                    {item.outcomeLabel ? (
                      <span className="fg-font-mono ms-2 text-xs font-normal uppercase tracking-wider text-[var(--color-muted)]">
                        {item.outcomeLabel}
                      </span>
                    ) : null}
                  </p>
                  <p className="fg-body mt-3 text-sm">{item.detail}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

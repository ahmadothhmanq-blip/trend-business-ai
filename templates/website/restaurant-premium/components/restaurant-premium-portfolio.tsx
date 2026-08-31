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
    industry: "Professional services",
    outcome: "$3.1M",
    outcomeLabel: "value unlocked",
    detail: "Identified expansion opportunities weeks earlier with proactive insight.",
  },
  {
    company: "Axiom Logistics",
    industry: "Operations",
    outcome: "99%",
    outcomeLabel: "accuracy",
    detail: "Replaced manual workflows with live intelligence across the network.",
  },
];

type RestaurantPremiumPortfolioProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ company: string; industry: string; outcome: string; outcomeLabel?: string; detail: string }>;
};

export function RestaurantPremiumPortfolio({
  eyebrow = "Selected work",
  title = "Outcomes that travel",
  subtitle = "Results from organizations operating across markets and time zones.",
  items = DEFAULT_ITEMS,
}: RestaurantPremiumPortfolioProps) {
  if (!items.length) return null;

  return (
    <section id="portfolio" data-v2-component="restaurant-premium-portfolio" aria-labelledby="rp-portfolio-title" className="rp-reveal rp-section">
      <div className="rp-shell">
        <header className="rp-section-head">
          {eyebrow ? <p className="rp-kicker">{eyebrow}</p> : null}
          <h2 id="rp-portfolio-title" className="rp-h2">{title}</h2>
          <div className="rp-accent-rule" aria-hidden />
          {subtitle ? <p className="rp-body rp-section-sub">{subtitle}</p> : null}
        </header>
        <ul className="rp-reveal-stagger rp-case-list">
          {items.map((item) => (
            <li key={item.company}>
              <div className="rp-case-main">
                <p className="rp-case-industry">{item.industry}</p>
                <h3>{item.company}</h3>
                <p>{item.detail}</p>
              </div>
              <div className="rp-case-metric">
                <strong>{item.outcome}</strong>
                {item.outcomeLabel ? <span>{item.outcomeLabel}</span> : null}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

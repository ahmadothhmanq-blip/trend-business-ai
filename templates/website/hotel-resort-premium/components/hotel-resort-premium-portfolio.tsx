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
    industry: "Services",
    outcome: "$3.1M",
    outcomeLabel: "value unlocked",
    detail: "Identified expansion opportunities weeks earlier with proactive insights.",
  },
  {
    company: "Axiom Logistics",
    industry: "Operations",
    outcome: "99%",
    outcomeLabel: "accuracy",
    detail: "Replaced manual workflows with live intelligence dashboards.",
  },
];

type HotelResortPremiumPortfolioProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ company: string; industry: string; outcome: string; outcomeLabel?: string; detail: string }>;
};

export function HotelResortPremiumPortfolio({
  eyebrow = "Selected work",
  title = "Outcomes that speak for themselves",
  subtitle = "Real results from organizations that chose to lead.",
  items = DEFAULT_ITEMS,
}: HotelResortPremiumPortfolioProps) {
  if (!items.length) return null;

  return (
    <section
      id="portfolio"
      data-v2-component="hotel-resort-premium-portfolio"
      aria-labelledby="hr-portfolio-title"
      className="hr-reveal hr-section"
    >
      <div className="hr-container">
        <header className="hr-section-header hr-section-header--rule mb-12 max-w-2xl">
          {eyebrow ? <p className="hr-eyebrow">{eyebrow}</p> : null}
          <h2 id="hr-portfolio-title" className="hr-headline-sm mt-4">
            {title}
          </h2>
          <div className="hr-azure-rule" />
          {subtitle ? <p className="hr-body mt-4">{subtitle}</p> : null}
        </header>
        <ul className="hr-reveal-stagger grid gap-5 lg:grid-cols-3">
          {items.map((item, index) => (
            <li key={item.company} className="hr-case-card flex flex-col">
              <p className="hr-label">{item.industry}</p>
              <h3 className="hr-title-lg mt-3">{item.company}</h3>
              <p className="hr-body-sm mt-3 flex-1">{item.detail}</p>
              <div className="mt-6 border-t border-[var(--border-subtle)] pt-5">
                <p className="hr-metric">
                  {item.outcome}{" "}
                  {item.outcomeLabel ? <span className="hr-caption font-normal">{item.outcomeLabel}</span> : null}
                </p>
                <p className="hr-index mt-2">Case {String(index + 1).padStart(2, "0")}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

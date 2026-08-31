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

type MedicalPremiumPortfolioProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ company: string; industry: string; outcome: string; outcomeLabel?: string; detail: string }>;
};

export function MedicalPremiumPortfolio({
  eyebrow = "Selected work",
  title = "Outcomes that speak for themselves",
  subtitle = "Real results from organizations that chose to lead.",
  items = DEFAULT_ITEMS,
}: MedicalPremiumPortfolioProps) {
  return (
    <section
      id="portfolio"
      data-v2-component="medical-premium-portfolio"
      aria-labelledby="mp-portfolio-title"
      className="mp-reveal mp-section bg-[var(--color-surface)] py-20 sm:py-28"
    >
      <div className="mp-container">
        <header className="mp-section-header mp-section-header--rule mb-12 max-w-2xl">
          {eyebrow ? <p className="mp-eyebrow">{eyebrow}</p> : null}
          <h2 id="mp-portfolio-title" className="mp-headline-sm mt-4">
            {title}
          </h2>
          {subtitle ? <p className="mp-body mt-4">{subtitle}</p> : null}
        </header>
        <ul className="mp-reveal-stagger divide-y divide-[var(--border-default)] border-y border-[var(--border-default)]">
          {items.map((item, index) => (
            <li
              key={item.company}
              className="df-reveal-stagger mp-list-row grid gap-6 py-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"
            >
              <div className="min-w-0">
                <p className="mp-label">{item.industry}</p>
                <h3 className="mp-title-lg mt-2">{item.company}</h3>
                <p className="mp-body-sm mt-3 max-w-2xl">{item.detail}</p>
              </div>
              <div className="text-start lg:text-end">
                <p className="mp-metric">
                  {item.outcome}{" "}
                  {item.outcomeLabel ? <span className="mp-caption font-normal">{item.outcomeLabel}</span> : null}
                </p>
                <p className="mp-index mt-2">Case {String(index + 1).padStart(2, "0")}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

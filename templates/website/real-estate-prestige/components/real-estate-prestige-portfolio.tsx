"use client";

const DEFAULT_PORTFOLIO = [
  { company: "Project Alpha", industry: "Case study", outcome: "2×", outcomeLabel: "growth", detail: "A representative outcome from a recent engagement." },
  { company: "Project Beta", industry: "Case study", outcome: "40%", outcomeLabel: "efficiency", detail: "Streamlined delivery with measurable impact." },
  { company: "Project Gamma", industry: "Case study", outcome: "12 mo", outcomeLabel: "retainer", detail: "Ongoing partnership with quarterly milestones." },
];

type PortfolioItem = {
  company: string;
  industry: string;
  outcome: string;
  outcomeLabel?: string;
  detail: string;
};

type RealEstatePrestigePortfolioProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: PortfolioItem[];
};

export function RealEstatePrestigePortfolio({
  eyebrow = "Work",
  title = "Selected outcomes",
  subtitle = "Representative results from recent engagements.",
  items = DEFAULT_PORTFOLIO,
}: RealEstatePrestigePortfolioProps) {
  if (!items.length) return null;

  return (
    <section
      id="portfolio"
      data-v2-component="real-estate-prestige-portfolio"
      aria-labelledby="rep-portfolio-title"
      className="rep-reveal rep-section py-20 sm:py-28"
    >
      <div className="rep-container">
        <header className="rep-section-header rep-section-header--rule">
          {eyebrow ? <p className="rep-eyebrow">{eyebrow}</p> : null}
          <h2 id="rep-portfolio-title" className="rep-headline-sm">
            {title}
          </h2>
          {subtitle ? <p className="rep-body">{subtitle}</p> : null}
        </header>
        <ul className="rep-reveal-stagger rep-editorial-list divide-y divide-[var(--border-default)]">
          {items.map((item, index) => (
            <li key={`${item.company}-${index}`} className="df-reveal-stagger rep-list-row grid gap-4 py-10 lg:grid-cols-[auto_1fr_auto] lg:items-center">
              <span className="rep-index">{String(index + 1).padStart(2, "0")}</span>
              <div className="min-w-0">
                <p className="rep-label">{item.industry}</p>
                <h3 className="rep-title-lg mt-1">{item.company}</h3>
                <p className="rep-body-sm mt-2 max-w-2xl">{item.detail}</p>
              </div>
              <p className="rep-price lg:text-end">
                {item.outcome}
                {item.outcomeLabel ? <span className="rep-caption mt-1 block font-normal">{item.outcomeLabel}</span> : null}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

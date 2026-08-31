"use client";

const DEFAULT_ITEMS = [
  {
    company: "Library commons reopens",
    industry: "Campus life",
    outcome: "Note",
    outcomeLabel: "archive",
    detail: "The reading rooms return with extended hours and a new manuscript gallery for undergraduate research.",
  },
  {
    company: "Field laboratory expands",
    industry: "Sciences",
    outcome: "Note",
    outcomeLabel: "research",
    detail: "A coastal station now hosts semester residencies for ecology and climate cohorts.",
  },
  {
    company: "Studio row exhibition",
    industry: "Arts",
    outcome: "Note",
    outcomeLabel: "culture",
    detail: "Student and faculty work shared across three galleries through the autumn term.",
  },
];

type EducationPremiumPortfolioProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{
    company: string;
    industry: string;
    outcome: string;
    outcomeLabel?: string;
    detail: string;
    imageUrl?: string | null;
  }>;
};

export function EducationPremiumPortfolio({
  eyebrow = "Dispatch",
  title = "Campus notes",
  subtitle = "Briefs from the grounds, the labs, and the studios.",
  items = DEFAULT_ITEMS,
}: EducationPremiumPortfolioProps) {
  return (
    <section
      id="portfolio"
      data-v2-component="education-premium-portfolio"
      aria-labelledby="ed-portfolio-title"
      className="ed-campus-notes ed-paper ed-reveal"
    >
      <div className="ed-campus-notes-inner">
        <header className="ed-section-head">
          <p className="ed-eyebrow">{eyebrow}</p>
          <h2 id="ed-portfolio-title" className="ed-headline-sm ed-font-display">
            {title}
          </h2>
          <p className="ed-body">{subtitle}</p>
        </header>

        <ul className="ed-notes-list ed-reveal-stagger">
          {items.map((item) => (
            <li key={item.company} className="ed-note-row">
              <div className="ed-note-meta">
                <p className="ed-note-dept">{item.industry}</p>
                {item.outcomeLabel ? <p className="ed-note-tag">{item.outcomeLabel}</p> : null}
              </div>
              <div className="ed-note-body">
                <h3 className="ed-note-title ed-font-display">{item.company}</h3>
                <p className="ed-note-detail">{item.detail}</p>
              </div>
              {item.imageUrl ? <img src={item.imageUrl} alt="" className="ed-note-image" /> : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

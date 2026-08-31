"use client";

/** Optional partners strip — rendered as a quiet colophon row, not a logo card grid. */
const DEFAULT_LOGOS = [
  { abbr: "LIB", name: "University library", category: "Archive" },
  { abbr: "LAB", name: "Research consortium", category: "Science" },
  { abbr: "ART", name: "Studio network", category: "Arts" },
  { abbr: "GLB", name: "Exchange partners", category: "Global" },
];

type EducationPremiumIntegrationsProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  logos?: Array<{ abbr: string; name: string; category: string }>;
};

export function EducationPremiumIntegrations({
  eyebrow = "Colophon",
  title = "Affiliated presses & partners",
  subtitle = "Institutions that appear in the margin of this issue.",
  logos = DEFAULT_LOGOS,
}: EducationPremiumIntegrationsProps) {
  return (
    <section
      id="platform"
      data-v2-component="education-premium-integrations"
      aria-labelledby="ed-integrations-title"
      className="ed-colophon ed-paper ed-reveal"
    >
      <div className="ed-colophon-inner">
        <header className="ed-section-head">
          <p className="ed-eyebrow">{eyebrow}</p>
          <h2 id="ed-integrations-title" className="ed-headline-sm ed-font-display">
            {title}
          </h2>
          <p className="ed-body">{subtitle}</p>
        </header>
        <ul className="ed-colophon-list ed-reveal-stagger">
          {logos.map((logo) => (
            <li key={logo.abbr}>
              <span className="ed-font-mono">{logo.abbr}</span>
              <span>{logo.name}</span>
              <span className="ed-colophon-cat">{logo.category}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

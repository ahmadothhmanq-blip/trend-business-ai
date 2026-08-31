"use client";

const DEFAULT_FEATURES = [
  {
    title: "Undergraduate programs",
    description:
      "Liberal arts foundation with interdisciplinary depth and research opportunities that stretch beyond the lecture.",
    icon: "01",
    span: "hero",
  },
  {
    title: "Graduate studies",
    description: "Professional degrees designed for leaders in business, law, science, and public service.",
    icon: "02",
    span: "tall",
  },
  {
    title: "Research institutes",
    description: "Centers of excellence driving inquiry across the sciences and the humanities.",
    icon: "03",
    span: "compact",
  },
  {
    title: "Global campus",
    description: "Exchange programs and partnerships across forty international universities.",
    icon: "04",
    span: "wide",
  },
];

type EducationPremiumFeaturesProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ title: string; description: string; icon?: string; span?: string }>;
};

export function EducationPremiumFeatures({
  eyebrow = "In this issue",
  title = "Departments",
  subtitle = "Dispatches from the schools and institutes that define the term.",
  items = DEFAULT_FEATURES,
}: EducationPremiumFeaturesProps) {
  return (
    <section
      id="features"
      data-v2-component="education-premium-features"
      aria-labelledby="ed-features-title"
      className="ed-departments ed-paper ed-reveal"
    >
      <div className="ed-departments-inner">
        <header className="ed-section-head">
          <p className="ed-eyebrow">{eyebrow}</p>
          <h2 id="ed-features-title" className="ed-headline-sm ed-font-display">
            {title}
          </h2>
          <p className="ed-body">{subtitle}</p>
        </header>

        <div className="ed-columns ed-reveal-stagger">
          {items.map((item, i) => (
            <article key={item.title} className="ed-column-article">
              <p className="ed-column-index ed-font-mono">{item.icon ?? String(i + 1).padStart(2, "0")}</p>
              <h3 className="ed-column-title ed-font-display">{item.title}</h3>
              <p className="ed-column-body">{item.description}</p>
              <a href="#pricing" className="ed-column-link">
                Continue reading
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

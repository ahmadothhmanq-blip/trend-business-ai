"use client";

const DEFAULT_ITEMS = [
  {
    company: "Dawn restore",
    industry: "Movement",
    outcome: "90 min",
    outcomeLabel: "ritual",
    detail: "A slow morning sequence of breath, mobility, and light clinical care.",
  },
  {
    company: "Thermal quiet",
    industry: "Recovery",
    outcome: "60 min",
    outcomeLabel: "ritual",
    detail: "Heat, cool, and stillness arranged as a circular breathing path.",
  },
  {
    company: "Nourish atelier",
    industry: "Nutrition",
    outcome: "Seasonal",
    outcomeLabel: "menu",
    detail: "Chef-led nourishment matched to metabolic assessment and pace.",
  },
];

type LuminaWellnessPortfolioProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ company: string; industry: string; outcome: string; outcomeLabel?: string; detail: string }>;
};

export function LuminaWellnessPortfolio({
  eyebrow = "Selected rituals",
  title = "Moments from the house",
  subtitle = "Sparse portfolio moments — one breath at a time.",
  items = DEFAULT_ITEMS,
}: LuminaWellnessPortfolioProps) {
  return (
    <section
      id="portfolio"
      data-v2-component="lumina-wellness-portfolio"
      aria-labelledby="lu-portfolio-title"
      className="lu-section lu-reveal"
    >
      <div className="mx-auto max-w-xl px-5 text-center sm:px-8">
        <p className="lu-eyebrow">{eyebrow}</p>
        <h2 id="lu-portfolio-title" className="lu-headline-sm mt-4">
          {title}
        </h2>
        <p className="lu-body mx-auto mt-4 max-w-md">{subtitle}</p>
      </div>
      <div className="lu-reveal-stagger mx-auto mt-6 max-w-md px-5 sm:px-8">
        {items.map((item) => (
          <article key={item.company} className="lu-membership">
            <p className="lu-eyebrow">{item.industry}</p>
            <h3 className="lu-ritual-title mt-3">{item.company}</h3>
            <p className="lu-metric mt-4 text-2xl">
              {item.outcome}
              {item.outcomeLabel ? (
                <span className="lu-font-body ms-2 text-sm text-[var(--color-muted)]">{item.outcomeLabel}</span>
              ) : null}
            </p>
            <p className="lu-body mt-3 text-sm">{item.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

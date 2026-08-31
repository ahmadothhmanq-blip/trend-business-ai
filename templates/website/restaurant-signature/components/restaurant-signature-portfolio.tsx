"use client";

const DEFAULT_ITEMS = [
  {
    company: "Biodynamic Riesling",
    industry: "Mosel",
    outcome: "2019",
    outcomeLabel: "vintage",
    detail: "Slate-driven acidity with orchard fruit — paired to the hearth bread course.",
  },
  {
    company: "Skin-contact Georgian",
    industry: "Kakheti",
    outcome: "Amphora",
    outcomeLabel: "vessel",
    detail: "Orange tea tannins and dried apricot — opens the game course.",
  },
  {
    company: "Forest Pinot Noir",
    industry: "Willamette",
    outcome: "Grower",
    outcomeLabel: "select",
    detail: "Cool climate red with mushroom earth — reserved for the final savory.",
  },
];

type RestaurantSignaturePortfolioProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{
    company: string;
    industry: string;
    outcome: string;
    outcomeLabel?: string;
    detail: string;
  }>;
};

export function RestaurantSignaturePortfolio({
  eyebrow = "Cellar notes",
  title = "Wine & provenance",
  subtitle = "Selections annotated beside the tasting spine.",
  items = DEFAULT_ITEMS,
}: RestaurantSignaturePortfolioProps) {
  return (
    <section
      id="portfolio"
      data-v2-component="restaurant-signature-portfolio"
      aria-labelledby="rs-portfolio-title"
      className="rs-menu-doc rs-reveal"
      style={{ paddingTop: "0", borderTop: "0" }}
    >
      <div className="rs-cellar">
        <p className="rs-menu-section-label" id="rs-portfolio-title">
          {eyebrow} · {title}
        </p>
        <p className="sr-only">{subtitle}</p>
        {items.map((item) => (
          <article key={item.company} className="rs-cellar-item">
            <h3>{item.company}</h3>
            <p>{item.detail}</p>
            <p className="rs-cellar-meta">
              {item.industry}
              {item.outcomeLabel ? ` · ${item.outcome} ${item.outcomeLabel}` : ` · ${item.outcome}`}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

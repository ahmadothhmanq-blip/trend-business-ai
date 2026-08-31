"use client";

const DEFAULT_ITEMS = [
  {
    company: "Arc tote",
    industry: "Leather",
    outcome: "$620",
    outcomeLabel: "edition",
    detail: "Single-piece construction with hand-burnished edges.",
  },
  {
    company: "Line coat",
    industry: "Tailoring",
    outcome: "$980",
    outcomeLabel: "edition",
    detail: "Unlined wool with a quiet shoulder and long drape.",
  },
  {
    company: "Vessel set",
    industry: "Objects",
    outcome: "$340",
    outcomeLabel: "edition",
    detail: "Stoneware pair glazed in atelier ash tones.",
  },
  {
    company: "Studio lamp",
    industry: "Lighting",
    outcome: "$540",
    outcomeLabel: "edition",
    detail: "Brushed brass stem with linen shade.",
  },
];

type EcommercePremiumPortfolioProps = {
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

export function EcommercePremiumPortfolio({
  eyebrow = "Products",
  title = "On the runway",
  subtitle = "Selected pieces from the current collection.",
  items = DEFAULT_ITEMS,
}: EcommercePremiumPortfolioProps) {
  return (
    <section
      id="portfolio"
      data-v2-component="ecommerce-premium-portfolio"
      aria-labelledby="ec-portfolio-title"
      className="ec-products ec-reveal"
    >
      <div className="ec-products-inner">
        <header className="ec-section-head">
          <p className="ec-eyebrow">{eyebrow}</p>
          <h2 id="ec-portfolio-title" className="ec-headline-sm ec-font-display">
            {title}
          </h2>
          <p className="ec-body">{subtitle}</p>
        </header>

        <ul className="ec-products-rail ec-reveal-stagger" role="list">
          {items.map((item) => (
            <li key={item.company} className="ec-product-tile">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt="" className="ec-product-media" />
              ) : (
                <div className="ec-product-media is-tonal" aria-hidden />
              )}
              <div className="ec-product-meta">
                <p className="ec-product-cat">{item.industry}</p>
                <h3 className="ec-font-display">{item.company}</h3>
                <p className="ec-product-detail">{item.detail}</p>
                <p className="ec-product-price">
                  {item.outcome}
                  {item.outcomeLabel ? <span> · {item.outcomeLabel}</span> : null}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

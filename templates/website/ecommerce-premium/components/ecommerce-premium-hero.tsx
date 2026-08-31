"use client";

type EcommercePremiumHeroProps = {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  primaryCta?: string;
  secondaryCta?: string;
  imageUrl?: string | null;
  brandName?: string;
  productName?: string;
  price?: string;
  tickerItems?: string[];
};

export function EcommercePremiumHero({
  title = "Objects of craft, chosen for a life well considered",
  subtitle = "Editorial collections, artisan partnerships, and white-glove delivery.",
  eyebrow = "Runway drop 24",
  primaryCta = "Add to bag",
  secondaryCta = "View lookbook",
  imageUrl = null,
  brandName = "Atelier",
  productName,
  price = "From $420",
  tickerItems = ["Hand-finished", "Limited run", "Worldwide delivery", "Archive quality"],
}: EcommercePremiumHeroProps) {
  const product = productName ?? title;

  return (
    <section
      id="top"
      data-v2-component="ecommerce-premium-hero"
      aria-labelledby="ec-hero-title"
      className="ec-stage ec-reveal"
    >
      <div className={`ec-stage-plane${imageUrl ? " has-image" : " is-tonal"}`}>
        {imageUrl ? <img src={imageUrl} alt="" className="ec-stage-image" /> : null}
        <div className="ec-stage-veil" aria-hidden />
        <div className="ec-stage-overlay">
          <p className="ec-stage-brand ec-font-display">{brandName}</p>
          <p className="ec-eyebrow">{eyebrow}</p>
          <h1 id="ec-hero-title" className="ec-stage-product ec-font-display">
            {product}
          </h1>
          <p className="ec-stage-deck">{subtitle}</p>
        </div>
      </div>

      <div className="ec-purchase-rail" role="region" aria-label="Purchase">
        <div className="ec-purchase-rail-inner">
          <div className="ec-purchase-info">
            <p className="ec-purchase-name">{product}</p>
            <p className="ec-purchase-price">{price}</p>
          </div>
          <div className="ec-purchase-actions">
            <a href="#contact" className="ec-btn-primary ec-focus-ring">
              {primaryCta}
            </a>
            <a href="#features" className="ec-btn-secondary ec-focus-ring">
              {secondaryCta}
            </a>
          </div>
        </div>
      </div>

      <div className="ec-ticker" aria-label="Collection notes">
        <div className="ec-ticker-track">
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <span key={`${item}-${i}`} className="ec-ticker-item">
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

type RestaurantSignatureHeroProps = {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  primaryCta?: string;
  secondaryCta?: string;
  imageUrl?: string | null;
  service?: string;
  season?: string;
};

export function RestaurantSignatureHero({
  title = "Forest Table",
  subtitle = "Wild herbs, hearth cooking, and a wine program shaped by biodynamic growers — dining as a landscape experience.",
  eyebrow = "Dinner service",
  primaryCta = "Reserve your table",
  secondaryCta = "View tasting",
  imageUrl = null,
  service,
  season = "Autumn harvest · Twelve courses",
}: RestaurantSignatureHeroProps) {
  const serviceLabel = service ?? eyebrow;

  return (
    <section
      id="top"
      data-v2-component="restaurant-signature-hero"
      aria-labelledby="rs-hero-title"
      className="rs-menu-doc rs-reveal"
    >
      <header className="rs-menu-header">
        <p className="rs-menu-header-service">{serviceLabel}</p>
        <h1 id="rs-hero-title" className="rs-menu-header-name">
          {title}
        </h1>
        <p className="rs-menu-header-season">{season}</p>
        <div className="rs-menu-header-rule" aria-hidden />
        <p className="rs-menu-header-note">{subtitle}</p>
        <div className="rs-menu-header-actions">
          <a href="#contact" className="rs-btn-primary">
            {primaryCta}
          </a>
          <a href="#features" className="rs-btn-ghost">
            {secondaryCta}
          </a>
        </div>
      </header>
    </section>
  );
}

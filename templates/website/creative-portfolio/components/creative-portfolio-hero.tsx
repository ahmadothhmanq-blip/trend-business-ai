"use client";

type CreativePortfolioHeroProps = {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  primaryCta?: string;
  secondaryCta?: string;
  imageUrl?: string | null;
  studioLabel?: string;
  reelYear?: string;
};

export function CreativePortfolioHero({
  title = "Work that moves culture forward",
  subtitle = "Brand systems, digital products, and campaigns for teams who treat design as a competitive advantage.",
  eyebrow = "Title card",
  primaryCta = "Enter the reel",
  secondaryCta = "Start a project",
  imageUrl = null,
  studioLabel = "Kinetic Atelier",
  reelYear = "Reel 2026",
}: CreativePortfolioHeroProps) {
  return (
    <section
      id="top"
      data-v2-component="creative-portfolio-hero"
      aria-labelledby="cp-hero-title"
      className="cp-title-card cp-reveal"
    >
      <div className="cp-title-card-slate">
        <p className="cp-title-card-index">
          {eyebrow} · 00
        </p>
        <h1 id="cp-hero-title" className="cp-title-card-headline">
          {title}
        </h1>
        <p className="cp-title-card-deck">{subtitle}</p>
        <div className="cp-title-card-meta">
          <span>{studioLabel}</span>
          <span>{reelYear}</span>
          <span>Horizontal stages</span>
        </div>
        <a href="#filmstrip" className="cp-title-card-cta">
          {primaryCta}
          <span aria-hidden>→</span>
        </a>
        <a href="#contact" className="cp-title-card-cta" style={{ marginInlineStart: "1.5rem" }}>
          {secondaryCta}
        </a>
      </div>
    </section>
  );
}

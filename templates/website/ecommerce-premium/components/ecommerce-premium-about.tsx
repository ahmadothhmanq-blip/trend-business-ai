"use client";

const DEFAULT_HIGHLIGHTS = [
  "Small-batch making with named artisans",
  "Materials sourced for longevity, not seasonality",
  "White-glove delivery and lifetime care guidance",
];

type EcommercePremiumAboutProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  body?: string;
  imageUrl?: string | null;
  highlights?: string[];
  primaryCta?: string;
};

export function EcommercePremiumAbout({
  eyebrow = "Atelier story",
  title = "Made slowly, shown clearly",
  subtitle,
  body = "We design objects for rooms and rituals that last. Each collection begins on the cutting table — pattern, material, and hand finish — then enters a quiet runway where craft is the only spectacle.",
  imageUrl = null,
  highlights = DEFAULT_HIGHLIGHTS,
  primaryCta = "Visit the atelier",
}: EcommercePremiumAboutProps) {
  return (
    <section
      id="about"
      data-v2-component="ecommerce-premium-about"
      aria-labelledby="ec-about-title"
      className="ec-story ec-reveal"
    >
      <div className="ec-story-inner">
        <div className="ec-story-copy">
          <p className="ec-eyebrow">{eyebrow}</p>
          <h2 id="ec-about-title" className="ec-headline-sm ec-font-display">
            {title}
          </h2>
          {subtitle ? <p className="ec-body">{subtitle}</p> : null}
          <p className="ec-body">{body}</p>
          <ul className="ec-story-points ec-reveal-stagger">
            {highlights.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
          <a href="#contact" className="ec-btn-secondary ec-focus-ring">
            {primaryCta}
          </a>
        </div>
        {imageUrl ? (
          <figure className="ec-story-figure">
            <img src={imageUrl} alt="" />
          </figure>
        ) : (
          <div className="ec-story-figure is-tonal" aria-hidden />
        )}
      </div>
    </section>
  );
}

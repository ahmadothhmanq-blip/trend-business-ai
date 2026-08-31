"use client";

type EducationPremiumHeroProps = {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  primaryCta?: string;
  secondaryCta?: string;
  imageUrl?: string | null;
  byline?: string;
  pullStart?: string;
  deck?: string;
};

export function EducationPremiumHero({
  title = "The quiet power of a liberal education",
  subtitle,
  eyebrow = "Cover story",
  primaryCta = "Read the essay",
  secondaryCta = "Browse programs",
  imageUrl = null,
  byline = "By the Editors · Autumn Term",
  pullStart = "What endures when curricula change and campuses expand is a habit of mind — rigorous, curious, and accountable to the world beyond the lecture hall.",
  deck,
}: EducationPremiumHeroProps) {
  const deckText =
    deck ??
    subtitle ??
    "Rigorous programs, research excellence, and a campus culture that develops thinkers ready to shape industries and societies.";

  return (
    <section
      id="top"
      data-v2-component="education-premium-hero"
      aria-labelledby="ed-hero-title"
      className="ed-cover ed-paper ed-reveal"
    >
      <div className="ed-cover-inner">
        <p className="ed-cover-kicker">{eyebrow}</p>
        <h1 id="ed-hero-title" className="ed-cover-headline ed-font-display">
          {title}
        </h1>
        <p className="ed-cover-deck">{deckText}</p>
        <p className="ed-cover-byline">{byline}</p>

        {pullStart ? (
          <blockquote className="ed-cover-pull">
            <p>{pullStart}</p>
          </blockquote>
        ) : null}

        <div className="ed-cover-actions">
          <a href="#about" className="ed-btn-primary ed-focus-ring">
            {primaryCta}
          </a>
          <a href="#pricing" className="ed-btn-secondary ed-focus-ring">
            {secondaryCta}
          </a>
        </div>

        {imageUrl ? (
          <figure className="ed-cover-figure">
            <img src={imageUrl} alt="" className="ed-cover-image" />
            <figcaption className="ed-cover-caption">Campus archive · Cover plate</figcaption>
          </figure>
        ) : null}
      </div>
    </section>
  );
}

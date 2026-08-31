"use client";

const DEFAULT_HIGHLIGHTS = [
  "Science-led care with a human pace",
  "Spaces designed for quiet restoration",
  "Memberships that protect your rhythm",
];

type LuminaWellnessAboutProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  body?: string;
  imageUrl?: string | null;
  highlights?: string[];
  primaryCta?: string;
};

export function LuminaWellnessAbout({
  eyebrow = "Philosophy",
  title = "Care that leaves room to breathe",
  subtitle,
  body = "We believe wellness should feel like atmosphere — unhurried, precise, and deeply personal. Every ritual is designed to restore balance without noise.",
  imageUrl,
  highlights = DEFAULT_HIGHLIGHTS,
  primaryCta = "Meet our practitioners",
}: LuminaWellnessAboutProps) {
  return (
    <section
      id="about"
      data-v2-component="lumina-wellness-about"
      aria-labelledby="lu-about-title"
      className="lu-section lu-reveal"
    >
      <div className="mx-auto max-w-xl px-5 text-center sm:px-8">
        <p className="lu-eyebrow">{eyebrow}</p>
        <h2 id="lu-about-title" className="lu-headline-sm mt-4">
          {title}
        </h2>
        {subtitle ? <p className="lu-body mx-auto mt-4 max-w-md">{subtitle}</p> : null}
        <p className="lu-body mx-auto mt-5 max-w-md">{body}</p>

        {imageUrl ? (
          <figure className="mx-auto mt-10 max-w-xs overflow-hidden rounded-[2.5rem]">
            <img src={imageUrl} alt="" className="h-auto w-full object-cover" />
          </figure>
        ) : null}

        <ul className="lu-reveal-stagger mt-12 space-y-6" aria-label="Highlights">
          {highlights.map((item) => (
            <li key={item} className="lu-font-body text-sm tracking-wide text-[var(--color-muted)]">
              {item}
            </li>
          ))}
        </ul>

        <a href="#contact" className="lu-btn-secondary lu-focus-ring mt-10 inline-flex">
          {primaryCta}
        </a>
      </div>
    </section>
  );
}

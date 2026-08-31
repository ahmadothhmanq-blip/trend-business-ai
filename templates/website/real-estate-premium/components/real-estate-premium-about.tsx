"use client";

const DEFAULT_HIGHLIGHTS = [
  "Founded by industry veterans with global experience",
  "Trusted by organizations across 40+ countries",
  "Committed to measurable outcomes and long-term partnerships",
];

type RealEstatePremiumAboutProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  body?: string;
  imageUrl?: string | null;
  highlights?: string[];
  primaryCta?: string;
};

export function RealEstatePremiumAbout({
  eyebrow = "Agency brief",
  title = "Advisory built for discerning principals",
  subtitle,
  body = "We represent buyers and sellers who expect gallery-level presentation, discreet negotiation, and market intelligence that holds under scrutiny.",
  imageUrl,
  highlights = DEFAULT_HIGHLIGHTS,
  primaryCta = "Meet the desk",
}: RealEstatePremiumAboutProps) {
  return (
    <section id="about" data-v2-component="real-estate-premium-about" className="rep-section-plain rep-reveal">
      <div className="rep-section-plain-inner">
        <p className="rep-eyebrow">{eyebrow}</p>
        <h2 className="rep-amenities-title">{title}</h2>
        {subtitle ? <p className="rep-body text-[var(--color-muted)]">{subtitle}</p> : null}
        <p className="rep-body mt-4 text-[var(--color-muted)]">{body}</p>
        <dl className="rep-spec-list">
          {highlights.map((h, i) => (
            <div key={h}>
              <dt>{String(i + 1).padStart(2, "0")}</dt>
              <dd>{h}</dd>
            </div>
          ))}
        </dl>
        <a href="#contact" className="rep-btn-secondary rep-focus-ring mt-6 inline-flex">
          {primaryCta}
        </a>
      </div>
    </section>
  );
}

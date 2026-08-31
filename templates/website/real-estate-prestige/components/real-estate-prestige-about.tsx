"use client";

const DEFAULT_HIGHLIGHTS = [
  "Experienced team focused on measurable outcomes",
  "Clear process from discovery through delivery",
  "Built for long-term partnerships",
];

const GLANCE_STATS = [
  { label: "Typical engagement", value: "4–8 weeks" },
  { label: "Response time", value: "24 hours" },
  { label: "Client satisfaction", value: "98%" },
  { label: "Repeat clients", value: "72%" },
];

type RealEstatePrestigeAboutProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  body?: string;
  highlights?: string[];
  primaryCta?: string;
};

export function RealEstatePrestigeAbout({
  eyebrow = "About",
  title = "A partner focused on clarity and delivery",
  subtitle,
  body = "We help organizations communicate their value, serve their audience, and grow with confidence — through thoughtful design and dependable execution.",
  highlights = DEFAULT_HIGHLIGHTS,
  primaryCta = "Get in touch",
}: RealEstatePrestigeAboutProps) {
  const bullets = highlights?.filter(Boolean) ?? [];

  return (
    <section
      id="about"
      data-v2-component="real-estate-prestige-about"
      aria-labelledby="rep-about-title"
      className="rep-reveal rep-section-alt py-20 sm:py-28"
    >
      <div className="df-reveal-stagger rep-container grid items-start gap-12 lg:grid-cols-2">
        <div className="min-w-0">
          {eyebrow ? <p className="rep-eyebrow">{eyebrow}</p> : null}
          <h2 id="rep-about-title" className="rep-headline-sm mt-3 text-balance">
            {title}
          </h2>
          {subtitle ? <p className="rep-body">{subtitle}</p> : null}
          {body ? <p className="rep-body mt-6">{body}</p> : null}
          {bullets.length ? (
            <ul className="mt-8 space-y-3">
              {bullets.map((item) => (
                <li key={item} className="rep-body-sm flex gap-3">
                  <span className="text-[var(--color-brass-light,var(--color-brass))]" aria-hidden>
                    —
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          ) : null}
          <a href="#contact" className="rep-btn-primary rep-focus-ring mt-10 inline-flex">
            {primaryCta}
          </a>
        </div>
        <div className="df-reveal-stagger grid gap-4 sm:grid-cols-2">
          {GLANCE_STATS.map((item) => (
            <div key={item.label} className="rep-stat-tile rounded-[var(--radius-lg)]">
              <p className="rep-metric text-3xl">{item.value}</p>
              <p className="rep-caption mt-2">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

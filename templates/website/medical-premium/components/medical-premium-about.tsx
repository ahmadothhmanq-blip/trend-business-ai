"use client";

const DEFAULT_HIGHLIGHTS = [
  "Founded by industry veterans with global experience",
  "Trusted by organizations across 40+ countries",
  "Committed to measurable outcomes and long-term partnerships",
];

type MedicalPremiumAboutProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  body?: string;
  imageUrl?: string | null;
  highlights?: string[];
  primaryCta?: string;
};

export function MedicalPremiumAbout({
  eyebrow = "Our story",
  title = "Built for teams that compete globally",
  subtitle,
  body = "We started with a simple belief: world-class organizations deserve tools and partners that match their ambition. Today we help teams across industries deliver measurable outcomes.",
  imageUrl,
  highlights = DEFAULT_HIGHLIGHTS,
  primaryCta = "Meet the team",
}: MedicalPremiumAboutProps) {
  return (
    <section id="about" data-v2-component="medical-premium-about" className="mp-reveal mp-section-alt py-20 sm:py-28">
      <div className="df-reveal-stagger mp-container grid gap-12 lg:grid-cols-[1fr_0.9fr] lg:items-center">
        <div>
          {eyebrow ? <p className="mp-eyebrow">{eyebrow}</p> : null}
          <h2 className="mp-headline-sm mt-4 text-balance">{title}</h2>
          {subtitle ? <p className="mp-lead mt-4">{subtitle}</p> : null}
          <p className="mp-body mt-6 max-w-xl">{body}</p>
          {highlights.length ? (
            <ul className="mp-reveal-stagger mt-10 grid gap-3 sm:grid-cols-2">
              {highlights.map((highlight) => (
                <li key={highlight} className="mp-panel px-4 py-3 text-sm text-[var(--color-foreground)]">
                  {highlight}
                </li>
              ))}
            </ul>
          ) : null}
          <a href="#contact" className="mp-btn-secondary mp-focus-ring mt-10 inline-flex">
            {primaryCta}
          </a>
        </div>
        <div className="mp-panel overflow-hidden">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="" className="aspect-[4/5] w-full object-cover" />
          ) : (
            <div className="flex aspect-[4/5] items-end bg-gradient-to-br from-[color-mix(in_srgb,var(--color-healing)_18%,transparent)] to-[var(--color-background)] p-8">
              <p className="mp-quote max-w-xs">&ldquo;Partnerships built on clarity, craft, and dependable delivery.&rdquo;</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

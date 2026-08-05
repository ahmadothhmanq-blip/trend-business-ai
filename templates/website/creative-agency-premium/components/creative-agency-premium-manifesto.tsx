"use client";

type CreativeAgencyPremiumManifestoProps = {
  eyebrow?: string;
  quote?: string;
  body?: string;
  stat1?: string;
  stat2?: string;
  stat3?: string;
};

export function CreativeAgencyPremiumManifesto({
  eyebrow = "Studio manifesto",
  quote = "We don't decorate brands. We architect belief systems.",
  body = "Studio Volt is a collective of designers, architects, and motion artists who treat every commission as cultural infrastructure. Our work lives at the intersection of radical craft and commercial impact.",
  stat1 = "47 Awards",
  stat2 = "12 Countries",
  stat3 = "Since 2011",
}: CreativeAgencyPremiumManifestoProps) {
  return (
    <section
      id="studio"
      data-v2-component="creative-agency-premium-manifesto"
      aria-labelledby="sv-manifesto-title"
      className="sv-section relative overflow-hidden border-y border-[var(--border-default)]"
    >
      <div
        className="pointer-events-none absolute inset-y-0 start-0 w-2 bg-[var(--color-volt)]"
        aria-hidden
      />
      <div className="grid gap-14 px-5 sm:px-8 lg:grid-cols-[1.2fr_1fr] lg:gap-24 lg:ps-10">
        <div>
          <p className="sv-eyebrow">{eyebrow}</p>
          <blockquote
            id="sv-manifesto-title"
            className="sv-font-display mt-8 text-[clamp(1.75rem,4vw,3.25rem)] font-bold leading-[1.08] tracking-tight"
          >
            <span className="text-[var(--color-volt)]" aria-hidden>
              “
            </span>
            {quote}
            <span className="text-[var(--color-ghost)] opacity-70" aria-hidden>
              ”
            </span>
          </blockquote>
        </div>
        <div className="flex flex-col justify-between gap-12">
          <p className="sv-body max-w-md text-lg leading-relaxed">{body}</p>
          <dl className="grid grid-cols-3 gap-6 border-t border-[var(--border-default)] pt-10">
            {[stat1, stat2, stat3].map((stat) => (
              <div key={stat}>
                <dt className="sr-only">{stat}</dt>
                <dd className="sv-font-mono text-xs uppercase tracking-widest text-[var(--color-volt)]">
                  {stat}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

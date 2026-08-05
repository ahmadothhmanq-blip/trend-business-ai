"use client";

type CreativePortfolioManifestoProps = {
  eyebrow?: string;
  quote?: string;
  body?: string;
  stat1?: string;
  stat2?: string;
  stat3?: string;
};

export function CreativePortfolioManifesto({
  eyebrow = "Studio manifesto",
  quote = "We don't decorate brands. We architect belief systems.",
  body = "Kinetic Atelier is a collective of designers, architects, and motion artists who treat every commission as cultural infrastructure. Our work lives at the intersection of radical craft and commercial impact.",
  stat1 = "47 Awards",
  stat2 = "12 Countries",
  stat3 = "Since 2011",
}: CreativePortfolioManifestoProps) {
  return (
    <section
      id="studio"
      data-v2-component="creative-portfolio-manifesto"
      aria-labelledby="cp-manifesto-title"
      className="cp-section border-y border-[var(--border-subtle)] bg-[var(--color-surface)]"
    >
      <div className="grid gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:gap-20">
        <div>
          <p className="cp-eyebrow">{eyebrow}</p>
          <blockquote
            id="cp-manifesto-title"
            className="cp-font-display mt-6 text-3xl font-bold leading-[1.1] tracking-tight sm:text-4xl lg:text-5xl"
          >
            <span className="text-[var(--color-volt)]" aria-hidden>
              “
            </span>
            {quote}
            <span className="text-[var(--color-magenta)]" aria-hidden>
              ”
            </span>
          </blockquote>
        </div>
        <div className="flex flex-col justify-between gap-10">
          <p className="cp-body max-w-md">{body}</p>
          <dl className="grid grid-cols-3 gap-4 border-t border-[var(--border-default)] pt-8">
            {[stat1, stat2, stat3].map((stat) => (
              <div key={stat}>
                <dt className="sr-only">{stat}</dt>
                <dd className="cp-font-mono text-xs uppercase tracking-widest text-[var(--color-volt)]">
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

"use client";

const DEFAULT_TESTIMONIALS = [
  {
    quote:
      "Prestige Estates understood our requirements before we articulated them. The Whitmore Penthouse was presented with complete discretion and impeccable timing.",
    author: "Private collector",
    context: "Upper East Side acquisition",
  },
  {
    quote:
      "Their architectural knowledge elevated every conversation. We weren't simply buying a home — we were acquiring a piece of design history.",
    author: "Design patron",
    context: "Tribeca loft purchase",
  },
];

type RealEstatePremiumTestimonialsProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ quote: string; author: string; context?: string }>;
};

export function RealEstatePremiumTestimonials({
  eyebrow = "Client voices",
  title = "Trusted by discerning collectors",
  subtitle = "Our clients value discretion as much as expertise.",
  items = DEFAULT_TESTIMONIALS,
}: RealEstatePremiumTestimonialsProps) {
  return (
    <section
      data-v2-component="real-estate-premium-testimonials"
      aria-labelledby="rep-testimonials-title"
      className="rep-section-tight bg-[var(--color-stone)]/50"
    >
      <div className="px-5 sm:px-8 lg:px-12">
        <header className="mb-14 text-center">
          <p className="rep-eyebrow mb-5">{eyebrow}</p>
          <h2 id="rep-testimonials-title" className="rep-headline-sm">
            {title}
          </h2>
          <div className="rep-brass-rule mx-auto my-6" />
          <p className="rep-body mx-auto max-w-lg">{subtitle}</p>
        </header>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
          {items.map((item, index) => (
            <blockquote
              key={`testimonial-${index}`}
              className="rep-card relative bg-[var(--color-surface)] p-10 lg:p-12"
            >
              <span
                className="rep-font-display absolute start-8 top-6 text-6xl leading-none text-[var(--color-brass)]/25"
                aria-hidden
              >
                &ldquo;
              </span>
              <p className="rep-font-display relative text-2xl italic leading-relaxed text-[var(--color-foreground)]">
                {item.quote}
              </p>
              <footer className="rep-font-body mt-10 border-t border-[var(--border-subtle)] pt-6">
                <cite className="not-italic">
                  <span className="block text-[0.6875rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-foreground)]">
                    {item.author}
                  </span>
                  {item.context ? (
                    <span className="mt-1 block text-sm text-[var(--color-brass)]">{item.context}</span>
                  ) : null}
                </cite>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

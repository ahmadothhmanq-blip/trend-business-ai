"use client";

const DEFAULT_TESTIMONIALS = [
  {
    quote:
      "Monolith understood our requirements before we articulated them. The Whitmore Penthouse was presented with complete discretion and impeccable timing.",
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

type RealEstatePrestigeTestimonialsProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ quote: string; author: string; context?: string }>;
};

export function RealEstatePrestigeTestimonials({
  eyebrow = "Client voices",
  title = "Trusted by discerning collectors",
  subtitle = "Our clients value discretion as much as expertise.",
  items = DEFAULT_TESTIMONIALS,
}: RealEstatePrestigeTestimonialsProps) {
  return (
    <section
      data-v2-component="real-estate-prestige-testimonials"
      aria-labelledby="rep-testimonials-title"
      className="rep-section"
    >
      <div className="px-5 sm:px-8 lg:px-10">
        <header className="mb-14 text-center">
          <p className="rep-eyebrow mb-5">{eyebrow}</p>
          <h2 id="rep-testimonials-title" className="rep-headline-sm">
            {title}
          </h2>
          <p className="rep-body mx-auto mt-4 max-w-lg">{subtitle}</p>
        </header>

        <div className="grid gap-8 md:grid-cols-2">
          {items.map((item, index) => (
            <blockquote
              key={`testimonial-${index}`}
              className="rep-card border-s-2 border-s-[var(--color-brass)] p-8 lg:p-10"
            >
              <p className="rep-font-display text-xl italic leading-relaxed text-[var(--color-foreground)]">
                &ldquo;{item.quote}&rdquo;
              </p>
              <footer className="rep-font-body mt-8 text-[0.6875rem] uppercase tracking-[0.24em] text-[var(--color-muted)]">
                — {item.author}
                {item.context ? (
                  <span className="mt-1 block normal-case tracking-normal text-[var(--color-brass)]">
                    {item.context}
                  </span>
                ) : null}
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

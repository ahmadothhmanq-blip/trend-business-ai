"use client";

const DEFAULT_TESTIMONIALS = [
  {
    quote:
      "From the first phone call, I felt heard. The care team coordinated everything — I never had to chase an appointment or repeat my history.",
    author: "Patient, Cardiology",
    rating: 5,
    featured: true,
  },
  {
    quote:
      "The facility feels nothing like a hospital. Private, calm, and every detail considered. My recovery was faster because I felt safe.",
    author: "Patient, Orthopedics",
    rating: 5,
  },
];

type MedicalPremiumTestimonialsProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ quote: string; author: string; rating?: number; featured?: boolean }>;
};

export function MedicalPremiumTestimonials({
  eyebrow = "Patient stories",
  title = "Trusted by families worldwide",
  subtitle = "Verified patient experiences — shared with permission.",
  items = DEFAULT_TESTIMONIALS,
}: MedicalPremiumTestimonialsProps) {
  const featured = items.find((i) => i.featured) ?? items[0];
  const secondary = items.filter((i) => i !== featured);

  return (
    <section
      data-v2-component="medical-premium-testimonials"
      aria-labelledby="mp-testimonials-title"
      className="mp-section bg-[var(--color-surface)]/50 px-5 sm:px-8"
    >
      <header className="mx-auto mb-14 max-w-2xl text-center">
        <p className="mp-eyebrow mb-4">{eyebrow}</p>
        <div className="mp-sage-rule mx-auto mb-5" aria-hidden />
        <h2 id="mp-testimonials-title" className="mp-headline-sm">
          {title}
        </h2>
        <p className="mp-body text-muted-foreground mt-4 text-base leading-relaxed">{subtitle}</p>
      </header>

      <div className="mx-auto grid max-w-[76rem] gap-6 lg:grid-cols-[1.4fr_1fr]">
        {featured ? (
          <blockquote className="mp-card relative p-10 lg:p-12">
            <span className="mp-quote-mark absolute start-8 top-6" aria-hidden>
              &ldquo;
            </span>
            {featured.rating ? (
              <p
                className="mp-font-body text-[var(--color-accent)]"
                aria-label={`${featured.rating} out of 5 stars`}
              >
                {"★".repeat(featured.rating)}
              </p>
            ) : null}
            <p className="mp-font-display relative z-10 mt-6 text-xl italic leading-relaxed text-[var(--color-foreground)] lg:text-2xl">
              {featured.quote}
            </p>
            <footer className="mp-font-body mt-8 text-sm font-semibold text-muted-foreground">
              — {featured.author}
            </footer>
          </blockquote>
        ) : null}

        <div className="flex flex-col gap-6">
          {secondary.map((item, index) => (
            <blockquote
              key={`testimonial-${index}`}
              className="mp-card flex-1 p-7 motion-safe:animate-[mp-scale-in_0.5s_ease_both]"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {item.rating ? (
                <p
                  className="mp-font-body text-sm text-[var(--color-healing)]"
                  aria-label={`${item.rating} out of 5 stars`}
                >
                  {"★".repeat(item.rating)}
                </p>
              ) : null}
              <p className="mp-font-body mt-4 text-base leading-relaxed text-[var(--color-foreground)]">
                &ldquo;{item.quote}&rdquo;
              </p>
              <footer className="mp-font-body mt-5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                — {item.author}
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

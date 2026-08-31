"use client";

const DEFAULT_TESTIMONIALS = [
  {
    quote: "Professional, responsive, and focused on results — exactly what we needed.",
    name: "Alex Morgan",
    role: "Director",
    company: "Northwind Co.",
  },
  {
    quote: "Clear communication and strong execution from start to finish.",
    name: "Samira Khan",
    role: "Operations Lead",
    company: "Helix Group",
  },
  {
    quote: "They understood our goals quickly and delivered with consistency throughout.",
    name: "Jordan Lee",
    role: "Founder",
    company: "Aperture Studio",
  },
];

type Testimonial = { quote: string; name: string; role: string; company?: string };

type RealEstatePrestigeTestimonialsProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Testimonial[];
};

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function RealEstatePrestigeTestimonials({
  eyebrow = "Testimonials",
  title = "Trusted by clients",
  subtitle = "Partnerships built on clarity, craft, and dependable delivery.",
  items = DEFAULT_TESTIMONIALS,
}: RealEstatePrestigeTestimonialsProps) {
  if (!items.length) return null;

  const featured = items[0];
  const supporting = items.slice(1, 3);
  if (!featured) return null;

  return (
    <section
      id="testimonials"
      data-v2-component="real-estate-prestige-testimonials"
      aria-labelledby="rep-testimonials-title"
      className="rep-reveal rep-section-alt py-20 sm:py-28"
    >
      <div className="rep-container">
        <header className="rep-section-header rep-section-header--rule">
          {eyebrow ? <p className="rep-eyebrow">{eyebrow}</p> : null}
          <h2 id="rep-testimonials-title" className="rep-headline-sm text-balance">
            {title}
          </h2>
          {subtitle ? <p className="rep-body">{subtitle}</p> : null}
        </header>
        <div className="df-reveal-stagger grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:gap-8">
          <figure className="rep-card rep-testimonial-featured relative rounded-[var(--radius-lg)] p-8 sm:p-10">
            <span className="rep-quote-mark absolute start-6 top-4 sm:start-8 sm:top-6" aria-hidden>
              &ldquo;
            </span>
            <blockquote className="rep-quote relative z-[1] pt-10 sm:pt-12">&ldquo;{featured.quote}&rdquo;</blockquote>
            <figcaption className="relative z-[1] mt-8 flex items-center gap-4 border-t border-[var(--border-subtle)] pt-8">
              <span className="rep-avatar rep-caption h-12 w-12 shrink-0">{initials(featured.name)}</span>
              <div>
                <p className="rep-title">{featured.name}</p>
                <p className="rep-body-sm">
                  {featured.role}
                  {featured.company ? ` · ${featured.company}` : ""}
                </p>
              </div>
            </figcaption>
          </figure>
          {supporting.length ? (
            <div className="df-reveal-stagger grid gap-4 content-start">
              {supporting.map((item) => (
                <figure key={item.name} className="rep-card rep-testimonial-support rounded-[var(--radius-lg)] p-6">
                  <blockquote className="rep-quote-sm">&ldquo;{item.quote}&rdquo;</blockquote>
                  <figcaption className="mt-5 flex items-center gap-3">
                    <span className="rep-avatar rep-caption h-9 w-9 shrink-0 text-[0.65rem]">{initials(item.name)}</span>
                    <div>
                      <p className="rep-body-sm font-semibold text-[var(--color-foreground)]">{item.name}</p>
                      <p className="rep-caption">
                        {item.role}
                        {item.company ? ` · ${item.company}` : ""}
                      </p>
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

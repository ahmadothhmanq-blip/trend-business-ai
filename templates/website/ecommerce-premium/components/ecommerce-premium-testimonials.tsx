"use client";

const DEFAULT_ITEMS = [
  {
    quote: "The pieces arrived like a private viewing — quiet packaging, exact craft, nothing loud.",
    name: "Amelia Cho",
    role: "Collector",
    company: "Seoul",
  },
  {
    quote: "Finally a shop that treats materials with the same seriousness as a gallery.",
    name: "Jonas Berg",
    role: "Interior director",
    company: "Copenhagen",
  },
  {
    quote: "Limited, honest, and finished by hand. We reorder every season.",
    name: "Mira Solène",
    role: "Boutique owner",
    company: "Lyon",
  },
];

type Testimonial = { quote: string; name: string; role: string; company?: string };

type EcommercePremiumTestimonialsProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Testimonial[];
};

export function EcommercePremiumTestimonials({
  eyebrow = "Clientele",
  title = "Worn & kept",
  subtitle = "Notes from collectors and rooms that hold our work.",
  items = DEFAULT_ITEMS,
}: EcommercePremiumTestimonialsProps) {
  if (!items.length) return null;
  return (
    <section
      id="testimonials"
      data-v2-component="ecommerce-premium-testimonials"
      aria-labelledby="ec-testimonials-title"
      className="ec-voices ec-reveal"
    >
      <div className="ec-voices-inner">
        <header className="ec-section-head">
          <p className="ec-eyebrow">{eyebrow}</p>
          <h2 id="ec-testimonials-title" className="ec-headline-sm ec-font-display">
            {title}
          </h2>
          <p className="ec-body">{subtitle}</p>
        </header>
        <div className="ec-voices-strip ec-reveal-stagger">
          {items.map((item) => (
            <figure key={item.name} className="ec-voice">
              <blockquote>
                <p>&ldquo;{item.quote}&rdquo;</p>
              </blockquote>
              <figcaption>
                <span>{item.name}</span>
                <span>
                  {item.role}
                  {item.company ? ` · ${item.company}` : ""}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

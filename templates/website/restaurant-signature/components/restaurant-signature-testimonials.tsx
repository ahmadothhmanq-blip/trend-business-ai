"use client";

const DEFAULT_ITEMS = [
  {
    quote: "It felt less like a restaurant and more like reading a menu written by the landscape.",
    name: "Sarah Chen",
    role: "Guest",
    company: "Autumn seating",
  },
  {
    quote: "The cellar notes alone were worth the journey — quiet, precise, unforgettable.",
    name: "Marcus Webb",
    role: "Guest",
    company: "Chef’s table",
  },
  {
    quote: "Every course arrived with intention. No spectacle — only craft.",
    name: "Elena Vasquez",
    role: "Guest",
    company: "Private dining",
  },
];

type Testimonial = { quote: string; name: string; role: string; company?: string };

type RestaurantSignatureTestimonialsProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Testimonial[];
};

export function RestaurantSignatureTestimonials({
  eyebrow = "Guest notes",
  title = "From the book",
  subtitle = "Lines left after service.",
  items = DEFAULT_ITEMS,
}: RestaurantSignatureTestimonialsProps) {
  if (!items.length) return null;

  return (
    <section
      id="testimonials"
      data-v2-component="restaurant-signature-testimonials"
      className="rs-menu-doc rs-reveal"
      style={{ paddingTop: "0", borderTop: "0" }}
      aria-label={title}
    >
      <div className="rs-menu-quotes">
        <p className="rs-menu-section-label">
          {eyebrow} · {title}
        </p>
        <p className="sr-only">{subtitle}</p>
        {items.map((item) => (
          <figure key={item.name} className="rs-menu-quote">
            <blockquote>&ldquo;{item.quote}&rdquo;</blockquote>
            <figcaption>
              {item.name}
              {item.company ? ` · ${item.company}` : ""}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

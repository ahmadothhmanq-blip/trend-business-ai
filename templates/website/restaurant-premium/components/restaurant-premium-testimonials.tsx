"use client";

const DEFAULT_ITEMS = [
  {
    quote: "They understood our goals from day one and delivered with clarity and care across every market we operate in.",
    name: "Sarah Chen",
    role: "Operations Director",
    company: "Northline Group",
  },
  {
    quote: "Reliable, thoughtful, and consistently excellent — our teams saw measurable improvements within the first quarter.",
    name: "David Okonkwo",
    role: "VP Strategy",
    company: "Meridian Co.",
  },
  {
    quote: "A rare combination of craft and dependability. They elevated our presence without sacrificing professionalism.",
    name: "Elena Vasquez",
    role: "Founder",
    company: "Studio Arc",
  },
];

type Testimonial = { quote: string; name: string; role: string; company?: string };

type RestaurantPremiumTestimonialsProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Testimonial[];
};

export function RestaurantPremiumTestimonials({
  eyebrow = "Client voices",
  title = "Trusted by leadership teams",
  subtitle = "Partnerships built on clarity, craft, and outcomes you can measure.",
  items = DEFAULT_ITEMS,
}: RestaurantPremiumTestimonialsProps) {
  if (!items.length) return null;

  return (
    <section id="testimonials" data-v2-component="restaurant-premium-testimonials" aria-labelledby="rp-testimonials-title" className="rp-reveal rp-section rp-section-alt">
      <div className="rp-shell">
        <header className="rp-section-head rp-section-head--center">
          {eyebrow ? <p className="rp-kicker">{eyebrow}</p> : null}
          <h2 id="rp-testimonials-title" className="rp-h2">{title}</h2>
          <div className="rp-accent-rule rp-accent-rule--center" aria-hidden />
          {subtitle ? <p className="rp-body rp-section-sub">{subtitle}</p> : null}
        </header>
        <ul className="rp-reveal-stagger rp-quote-grid">
          {items.map((item) => (
            <li key={item.name}>
              <blockquote>&ldquo;{item.quote}&rdquo;</blockquote>
              <p className="rp-quote-name">{item.name}</p>
              <p className="rp-quote-role">
                {item.role}
                {item.company ? ` · ${item.company}` : ""}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

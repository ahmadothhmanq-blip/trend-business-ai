"use client";

const DEFAULT_ITEMS = [
  {
    quote:
      "They understood our goals from day one and delivered with clarity and care. The partnership felt personal without sacrificing professionalism.",
    name: "Sarah Chen",
    role: "Operations Director",
    company: "Northline Group",
  },
  {
    quote:
      "Reliable, thoughtful, and consistently excellent. Our team saw measurable improvements within the first quarter — the attention to detail shows in every touchpoint.",
    name: "David Okonkwo",
    role: "VP Strategy",
    company: "Meridian Co.",
    featured: true,
  },
  {
    quote:
      "A rare combination of craft and dependability. They elevated our brand presence across every channel with warmth and precision.",
    name: "Elena Vasquez",
    role: "Founder",
    company: "Studio Arc",
  },
];

type TestimonialItem = {
  quote: string;
  name: string;
  role: string;
  company?: string;
  featured?: boolean;
};

type HotelResortPremiumTestimonialsProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: TestimonialItem[];
};

export function HotelResortPremiumTestimonials({
  eyebrow = "Client voices",
  title = "Trusted by teams worldwide",
  subtitle = "Partnerships built on clarity, craft, and outcomes you can measure.",
  items = DEFAULT_ITEMS,
}: HotelResortPremiumTestimonialsProps) {
  if (!items.length) return null;

  return (
    <section
      id="testimonials"
      data-v2-component="hotel-resort-premium-testimonials"
      aria-labelledby="hr-testimonials-title"
      className="hr-reveal hr-section hr-section-alt"
    >
      <div className="hr-container">
        <header className="hr-section-header hr-section-header--rule hr-section-header--center mx-auto mb-12 text-center">
          {eyebrow ? <p className="hr-eyebrow">{eyebrow}</p> : null}
          <h2 id="hr-testimonials-title" className="hr-headline-sm mt-4">
            {title}
          </h2>
          <div className="hr-azure-rule mx-auto" />
          {subtitle ? <p className="hr-body mx-auto mt-4 max-w-xl">{subtitle}</p> : null}
        </header>
        <div className="hr-reveal-stagger grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <figure
              key={`${item.name}-${index}`}
              className={[
                "hr-testimonial-card hr-card",
                item.featured ? "hr-card-featured md:-translate-y-1" : "",
              ].join(" ")}
            >
              <span className="hr-quote-mark absolute end-5 top-3" aria-hidden>
                &ldquo;
              </span>
              <blockquote>{item.quote}</blockquote>
              <figcaption className="hr-testimonial-author">
                <span className="hr-avatar" aria-hidden>
                  {item.name.charAt(0)}
                </span>
                <div>
                  <p className="hr-font-body text-sm font-semibold text-[var(--color-foreground)]">{item.name}</p>
                  <p className="hr-caption">
                    {item.role}
                    {item.company ? ` · ${item.company}` : ""}
                  </p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

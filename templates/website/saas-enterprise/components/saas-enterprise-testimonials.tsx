"use client";

const DEFAULT_ITEMS = [
  {
    quote: "We stopped exporting decks. Leadership reviews happen inside the workspace.",
    name: "Priya Nair",
    role: "VP Revenue Operations",
    company: "Northwind",
  },
  {
    quote: "Forecast meetings are shorter because the shell already holds the debate.",
    name: "Owen Blake",
    role: "CRO",
    company: "Helix",
  },
  {
    quote: "Security reviewed it like infrastructure — and approved it that way.",
    name: "Dana Ortiz",
    role: "CISO liaison",
    company: "Axiom",
  },
];

type Testimonial = { quote: string; name: string; role: string; company?: string };

type SaasEnterpriseTestimonialsProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Testimonial[];
};

export function SaasEnterpriseTestimonials({
  eyebrow = "Customer notes",
  title = "From operators",
  subtitle = "Field notes from teams running Nexus daily.",
  items = DEFAULT_ITEMS,
}: SaasEnterpriseTestimonialsProps) {
  if (!items.length) return null;
  return (
    <section
      id="testimonials"
      data-v2-component="saas-enterprise-testimonials"
      aria-labelledby="se-testimonials-title"
      className="se-notes se-reveal"
    >
      <div className="se-docs-inner">
        <header className="se-docs-head">
          <p className="se-eyebrow">{eyebrow}</p>
          <h2 id="se-testimonials-title" className="se-headline-sm se-font-display">
            {title}
          </h2>
          <p className="se-body">{subtitle}</p>
        </header>
        <div className="se-notes-list se-reveal-stagger">
          {items.map((item) => (
            <figure key={item.name} className="se-note">
              <blockquote>
                <p>{item.quote}</p>
              </blockquote>
              <figcaption>
                <strong>{item.name}</strong>
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

"use client";

const DEFAULT_ITEMS = [
  {
    quote: "Discreet, precise, and relentlessly prepared — the dossier quality changed how we buy.",
    name: "Sarah Chen",
    role: "Principal",
    company: "Northwind Family Office",
  },
  {
    quote: "Every listing arrived as a complete brief. No theatre, just clarity.",
    name: "Marcus Webb",
    role: "Investment Lead",
    company: "Helix Group",
  },
  {
    quote: "White-glove conveyance with institutional rigor. Rare combination.",
    name: "Elena Vasquez",
    role: "Advisor",
    company: "Axiom Holdings",
  },
];

type Testimonial = { quote: string; name: string; role: string; company?: string };

type RealEstatePremiumTestimonialsProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Testimonial[];
};

export function RealEstatePremiumTestimonials({
  eyebrow = "Client letters",
  title = "References on file",
  subtitle = "Statements from principals and advisors.",
  items = DEFAULT_ITEMS,
}: RealEstatePremiumTestimonialsProps) {
  if (!items.length) return null;
  const main = items[0];
  if (!main) return null;

  return (
    <section
      id="testimonials"
      data-v2-component="real-estate-premium-testimonials"
      className="rep-section-plain rep-reveal"
      aria-label={title}
    >
      <div className="rep-section-plain-inner">
        <p className="rep-eyebrow">{eyebrow}</p>
        <h2 className="rep-amenities-title">{title}</h2>
        <p className="sr-only">{subtitle}</p>
        <figure className="rep-testimonial-sheet mt-6">
          <blockquote>
            <p>&ldquo;{main.quote}&rdquo;</p>
          </blockquote>
          <footer>
            {main.name} · {main.role}
            {main.company ? ` · ${main.company}` : ""}
          </footer>
        </figure>
        {items.length > 1 ? (
          <dl className="rep-spec-list mt-6">
            {items.slice(1).map((item) => (
              <div key={item.name}>
                <dt>{item.name}</dt>
                <dd>
                  “{item.quote}” — {item.role}
                  {item.company ? `, ${item.company}` : ""}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
    </section>
  );
}

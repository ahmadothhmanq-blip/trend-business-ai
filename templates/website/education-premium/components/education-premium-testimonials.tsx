"use client";

const DEFAULT_ITEMS = [
  {
    quote: "The seminar table taught me to argue with care — and to change my mind when the evidence asked for it.",
    name: "Sarah Chen",
    role: "Class of 2014",
    company: "Public policy",
  },
  {
    quote: "Research here is not a performance. It is a conversation with mentors who expect rigor and originality.",
    name: "Marcus Webb",
    role: "Alumni fellow",
    company: "Life sciences",
  },
  {
    quote: "I left with a network that spans continents and a habit of reading the world closely.",
    name: "Elena Vasquez",
    role: "Graduate 2019",
    company: "Arts & letters",
  },
];

type Testimonial = { quote: string; name: string; role: string; company?: string };

type EducationPremiumTestimonialsProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Testimonial[];
};

export function EducationPremiumTestimonials({
  eyebrow = "Voices",
  title = "Pull quotes",
  subtitle = "Lines from alumni letters and commencement addresses.",
  items = DEFAULT_ITEMS,
}: EducationPremiumTestimonialsProps) {
  if (!items.length) return null;

  return (
    <section
      id="testimonials"
      data-v2-component="education-premium-testimonials"
      aria-labelledby="ed-testimonials-title"
      className="ed-pullquotes ed-paper ed-reveal"
    >
      <div className="ed-pullquotes-inner">
        <header className="ed-section-head">
          <p className="ed-eyebrow">{eyebrow}</p>
          <h2 id="ed-testimonials-title" className="ed-headline-sm ed-font-display">
            {title}
          </h2>
          <p className="ed-body">{subtitle}</p>
        </header>

        <div className="ed-pullquotes-stack ed-reveal-stagger">
          {items.map((item) => (
            <figure key={item.name} className="ed-pullquote">
              <blockquote>
                <p>&ldquo;{item.quote}&rdquo;</p>
              </blockquote>
              <figcaption>
                <span className="ed-pullquote-name">{item.name}</span>
                <span className="ed-pullquote-meta">
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

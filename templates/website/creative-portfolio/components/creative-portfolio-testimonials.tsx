"use client";

const DEFAULT_ITEMS = [
  {
    quote: "They transformed how our team operates — measurable impact within the first quarter.",
    name: "Sarah Chen",
    role: "VP Operations",
    company: "Northwind",
  },
  {
    quote: "The level of craft and attention to detail is unmatched. A true global partner.",
    name: "Marcus Webb",
    role: "Chief Marketing Officer",
    company: "Helix Group",
  },
  {
    quote: "We finally have a platform our board trusts. Reporting went from weeks to hours.",
    name: "Elena Vasquez",
    role: "CFO",
    company: "Axiom Labs",
  },
];

type Testimonial = { quote: string; name: string; role: string; company?: string };

type CreativePortfolioTestimonialsProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Testimonial[];
};

export function CreativePortfolioTestimonials({
  eyebrow = "Client voices",
  title = "Trusted by leaders worldwide",
  subtitle = "Organizations that chose excellence.",
  items = DEFAULT_ITEMS,
}: CreativePortfolioTestimonialsProps) {
  if (!items.length) return null;
  const featured = items[0];
  if (!featured) return null;

  return (
    <section
      id="testimonials"
      data-v2-component="creative-portfolio-testimonials"
      className="cp-quote-band cp-reveal"
      aria-label={title}
    >
      <blockquote>
        <p className="cp-eyebrow mb-6">{eyebrow}</p>
        <p>&ldquo;{featured.quote}&rdquo;</p>
        <footer>
          {featured.name} · {featured.role}
          {featured.company ? ` · ${featured.company}` : ""}
        </footer>
      </blockquote>
    </section>
  );
}

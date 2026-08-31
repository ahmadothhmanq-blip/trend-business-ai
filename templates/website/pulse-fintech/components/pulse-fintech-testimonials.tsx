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

type PulseFintechTestimonialsProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Testimonial[];
};

export function PulseFintechTestimonials({
  eyebrow = "Desk notes",
  title = "Operator attributions",
  items = DEFAULT_ITEMS,
}: PulseFintechTestimonialsProps) {
  if (!items.length) return null;
  return (
    <section id="testimonials" data-v2-component="pulse-fintech-testimonials" className="pu-reveal pu-section px-4 sm:px-6">
      <div className="mx-auto max-w-[96rem]">
        <p className="pu-eyebrow">{eyebrow}</p>
        <h2 className="pu-headline-sm mt-1">{title}</h2>
        <div className="pu-panel mt-6">
          <div className="pu-panel-head">
            <span>ATTRIBUTION // FEED</span>
            <span>{items.length}</span>
          </div>
          <ul className="pu-feed pu-panel-body">
            {items.map((item, i) => (
              <li key={item.name}>
                <span className="pu-feed-time">{String(i + 1).padStart(2, "0")}</span>
                <span className="pu-feed-msg">
                  &ldquo;{item.quote}&rdquo; — {item.name}
                  {item.company ? `, ${item.company}` : ""}
                </span>
                <span className="pu-feed-tag">{item.role}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

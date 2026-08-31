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

type ObsidianNoirTestimonialsProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Testimonial[];
};

export function ObsidianNoirTestimonials({
  eyebrow = "Voices",
  title = "Attributed quietly",
  items = DEFAULT_ITEMS,
}: ObsidianNoirTestimonialsProps) {
  if (!items.length) return null;

  return (
    <section id="testimonials" data-v2-component="obsidian-noir-testimonials" className="ob-reveal ob-section px-5 sm:px-8">
      <div className="mx-auto max-w-[72rem]">
        <p className="ob-eyebrow">{eyebrow}</p>
        <h2 className="ob-headline-sm mt-4">{title}</h2>
        <hr className="ob-rule mt-12" />
        <ul className="ob-reveal-stagger">
          {items.map((item) => (
            <li key={item.name} className="border-b border-[var(--border-default)] py-10">
              <blockquote className="ob-font-display text-2xl leading-snug text-[var(--color-foreground)] sm:text-3xl">
                &ldquo;{item.quote}&rdquo;
              </blockquote>
              <p className="ob-attribution mt-6">
                — {item.name}
                {item.role ? `, ${item.role}` : ""}
                {item.company ? `, ${item.company}` : ""}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

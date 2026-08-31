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

type PrismAuroraTestimonialsProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Testimonial[];
};

export function PrismAuroraTestimonials({
  eyebrow = "Client voices",
  title = "Trusted by leaders worldwide",
  subtitle = "Organizations that chose excellence.",
  items = DEFAULT_ITEMS,
}: PrismAuroraTestimonialsProps) {
  if (!items.length) return null;
  const [featured, ...rest] = items;

  return (
    <section id="testimonials" data-v2-component="prism-aurora-testimonials" className="pr-reveal pr-section bg-[var(--color-background)] px-4 sm:px-6">
      <div className="mx-auto max-w-[88rem]">
        <p className="pr-eyebrow">{eyebrow}</p>
        <h2 className="pr-headline-sm mt-2">{title}</h2>
        <p className="pr-body mt-2 max-w-md">{subtitle}</p>
        <div className="pr-mosaic pr-reveal-stagger mt-8">
          <figure className="pr-tile pr-tile-brand pr-span-7 pr-row-2">
            <blockquote className="pr-quote">&ldquo;{featured.quote}&rdquo;</blockquote>
            <figcaption className="mt-8 text-sm text-[var(--color-muted)]">
              <span className="font-semibold text-[var(--color-foreground)]">{featured.name}</span>
              {" · "}
              {featured.role}
              {featured.company ? ` · ${featured.company}` : ""}
            </figcaption>
          </figure>
          {rest.map((item, i) => (
            <figure key={item.name} className={`pr-tile pr-span-5 ${i === 0 ? "pr-tile-field-b" : "pr-tile-field-c"}`}>
              <blockquote className="pr-body text-[var(--color-foreground)]">&ldquo;{item.quote}&rdquo;</blockquote>
              <figcaption className="mt-4 text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]">
                {item.name}
                {item.company ? ` — ${item.company}` : ""}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

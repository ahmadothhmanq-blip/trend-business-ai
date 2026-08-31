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

type ForgeIndustrialTestimonialsProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Testimonial[];
  figureLabel?: string;
};

export function ForgeIndustrialTestimonials({
  eyebrow = "Field references",
  title = "Operator attestations",
  subtitle = "Referenced statements from deployed sites.",
  items = DEFAULT_ITEMS,
  figureLabel = "FIG. — FIELD NOTES",
}: ForgeIndustrialTestimonialsProps) {
  if (!items.length) return null;
  return (
    <section
      id="testimonials"
      data-v2-component="forge-industrial-testimonials"
      aria-labelledby="fg-testimonials-title"
      className="fg-grid-paper fg-section fg-reveal"
    >
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <div className="fg-frame">
          <p className="fg-fig-label">{figureLabel}</p>
          <p className="fg-eyebrow mt-4">{eyebrow}</p>
          <h2 id="fg-testimonials-title" className="fg-headline-sm mt-2">
            {title}
          </h2>
          <p className="fg-body mt-4 max-w-2xl">{subtitle}</p>
          <div className="fg-reveal-stagger mt-8 space-y-4">
            {items.map((item, i) => (
              <figure key={item.name} className="border border-[var(--border-default)] bg-[var(--color-surface)] p-5">
                <p className="fg-font-mono text-[0.6875rem] uppercase tracking-wider text-[var(--color-accent)]">
                  REF T-{String(i + 1).padStart(2, "0")}
                </p>
                <blockquote className="fg-body mt-3 text-base text-[var(--color-foreground)]">
                  &ldquo;{item.quote}&rdquo;
                </blockquote>
                <figcaption className="fg-font-mono mt-3 text-xs uppercase tracking-wider text-[var(--color-muted)]">
                  {item.name} · {item.role}
                  {item.company ? ` · ${item.company}` : ""}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

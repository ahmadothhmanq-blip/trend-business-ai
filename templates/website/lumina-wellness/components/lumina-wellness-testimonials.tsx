"use client";

const DEFAULT_ITEMS = [
  {
    quote: "I leave lighter — not because of intensity, but because everything here moves at the right pace.",
    name: "Amelia Cho",
    role: "Member",
    company: "Lumina House",
  },
  {
    quote: "The rituals feel handcrafted. Quiet rooms, attentive practitioners, and no performance.",
    name: "Noah Ellery",
    role: "Guest",
    company: "Seasonal retreat",
  },
  {
    quote: "It is the first wellness space that feels atmospheric rather than transactional.",
    name: "Sofia Marin",
    role: "Membership",
    company: "Three years",
  },
];

type Testimonial = { quote: string; name: string; role: string; company?: string };

type LuminaWellnessTestimonialsProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Testimonial[];
};

export function LuminaWellnessTestimonials({
  eyebrow = "Soft voices",
  title = "Words that arrive quietly",
  subtitle = "Attestations without spectacle — space between each reflection.",
  items = DEFAULT_ITEMS,
}: LuminaWellnessTestimonialsProps) {
  if (!items.length) return null;

  return (
    <section
      id="testimonials"
      data-v2-component="lumina-wellness-testimonials"
      aria-labelledby="lu-testimonials-title"
      className="lu-section lu-reveal"
    >
      <div className="mx-auto max-w-2xl px-5 text-center sm:px-8">
        <p className="lu-eyebrow">{eyebrow}</p>
        <h2 id="lu-testimonials-title" className="lu-headline-sm mt-4">
          {title}
        </h2>
        <p className="lu-body mx-auto mt-4 max-w-md">{subtitle}</p>
      </div>

      <div className="lu-reveal-stagger mx-auto mt-4 max-w-2xl px-5 sm:px-8">
        {items.map((item) => (
          <figure key={item.name} className="lu-soft-quote">
            <blockquote>&ldquo;{item.quote}&rdquo;</blockquote>
            <figcaption className="lu-font-body mt-5 text-sm text-[var(--color-muted)]">
              {item.name}
              <span className="mx-2 opacity-40">·</span>
              {item.role}
              {item.company ? (
                <>
                  <span className="mx-2 opacity-40">·</span>
                  {item.company}
                </>
              ) : null}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

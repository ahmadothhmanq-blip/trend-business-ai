"use client";

const DEFAULT_ITEMS = [
  {
    quote: "Citadel navigated our most complex regulatory matter with precision — their judgment at the board level was invaluable.",
    name: "James Whitfield",
    role: "General Counsel",
    company: "Northwind Holdings",
  },
  {
    quote: "When stakes are highest, we turn to Citadel. Their litigation team is unmatched in cross-border coordination.",
    name: "Priya Sharma",
    role: "Chief Legal Officer",
    company: "Helix International",
  },
  {
    quote: "Their counsel reads like a sealed attestation — measured, durable, and trusted by our board.",
    name: "Elena Vasquez",
    role: "Chair, Audit Committee",
    company: "Axiom Labs",
  },
];

type Testimonial = { quote: string; name: string; role: string; company?: string };

type CitadelTrustTestimonialsProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Testimonial[];
};

export function CitadelTrustTestimonials({
  eyebrow = "Attestations",
  title = "Sealed statements of trust",
  subtitle = "Credential panels from counsel and boards — presented as attestations, not review cards.",
  items = DEFAULT_ITEMS,
}: CitadelTrustTestimonialsProps) {
  if (!items.length) return null;

  return (
    <section
      id="testimonials"
      data-v2-component="citadel-trust-testimonials"
      aria-labelledby="ct-testimonials-title"
      className="ct-dossier ct-section ct-reveal"
    >
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <header className="mb-8">
          <p className="ct-eyebrow">{eyebrow}</p>
          <h2 id="ct-testimonials-title" className="ct-headline-sm mt-3">
            {title}
          </h2>
          <p className="ct-body mt-4">{subtitle}</p>
        </header>

        <div className="ct-reveal-stagger space-y-4">
          {items.map((item, index) => (
            <figure key={item.name} className="ct-attestation">
              <div className="ct-attestation-seal" aria-hidden>
                {String(index + 1).padStart(2, "0")}
              </div>
              <blockquote className="ct-font-display text-xl leading-relaxed text-[var(--color-foreground)]">
                &ldquo;{item.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-5 text-sm">
                <p className="font-semibold text-[var(--color-foreground)]">{item.name}</p>
                <p className="text-[var(--color-muted)]">
                  {item.role}
                  {item.company ? ` · ${item.company}` : ""}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

const DEFAULT_ITEMS = [
  {
    quote: "Professional, responsive, and focused on results — exactly what we needed.",
    name: "Alex Morgan",
    role: "Director",
    company: "Northwind Co.",
  },
  {
    quote: "Clear communication and strong execution from start to finish.",
    name: "Samira Khan",
    role: "Operations Lead",
    company: "Helix Group",
  },
  {
    quote: "They understood our goals quickly and delivered with consistency throughout.",
    name: "Jordan Lee",
    role: "Founder",
    company: "Aperture Studio",
  },
];

type Testimonial = { quote: string; name: string; role: string; company?: string };

function testimonialInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

type MedicalPremiumTestimonialsProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Testimonial[];
};

export function MedicalPremiumTestimonials({
  eyebrow = "Testimonials",
  title = "Trusted by clients",
  subtitle = "Partnerships built on clarity, craft, and dependable delivery.",
  items = DEFAULT_ITEMS,
}: MedicalPremiumTestimonialsProps) {
  if (!items.length) return null;

  const featured = items[0];
  const rest = items.slice(1);

  return (
    <section id="testimonials" data-v2-component="medical-premium-testimonials" className="mp-reveal mp-section py-20 sm:py-28">
      <div className="mp-container">
        <header className="mp-section-header mp-section-header--rule mb-12">
          {eyebrow ? <p className="mp-eyebrow">{eyebrow}</p> : null}
          <h2 className="mp-headline-sm mt-4">{title}</h2>
          {subtitle ? <p className="mp-body mt-4">{subtitle}</p> : null}
        </header>
        <div className="df-reveal-stagger grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <figure className="mp-panel flex flex-col justify-between p-8 sm:p-10">
            <span className="mp-quote-mark" aria-hidden>
              &ldquo;
            </span>
            <blockquote className="mp-quote mt-4">{featured.quote}</blockquote>
            <figcaption className="mt-8 flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-healing)_16%,transparent)] text-sm font-semibold text-[var(--color-primary)]">
                {testimonialInitials(featured.name)}
              </span>
              <div>
                <p className="font-semibold text-[var(--color-foreground)]">{featured.name}</p>
                <p className="mp-caption">
                  {[featured.role, featured.company].filter(Boolean).join(" · ")}
                </p>
              </div>
            </figcaption>
          </figure>
          <ul className="mp-reveal-stagger space-y-4">
            {rest.map((item) => (
              <li key={item.name} className="mp-card p-6">
                <blockquote className="mp-body-sm">&ldquo;{item.quote}&rdquo;</blockquote>
                <p className="mt-4 text-sm font-semibold">{item.name}</p>
                <p className="mp-caption">{[item.role, item.company].filter(Boolean).join(" · ")}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

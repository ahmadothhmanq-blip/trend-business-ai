"use client";

const DEFAULT_ITEMS = [
  {
    quote: "Signal cut our inference routing complexity in half — we ship models to production in days, not weeks.",
    name: "Sarah Chen",
    role: "VP Engineering",
    company: "Helix AI",
  },
  {
    quote: "The observability mesh finally gave our platform team one pane of glass across every model endpoint.",
    name: "Marcus Webb",
    role: "Head of ML Platform",
    company: "Northwind",
  },
  {
    quote: "Security and compliance were non-negotiable. Signal passed our enterprise review on the first cycle.",
    name: "Elena Vasquez",
    role: "CISO",
    company: "Axiom Labs",
  },
];

type Testimonial = { quote: string; name: string; role: string; company?: string };

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

type AiStartupSignalTestimonialsProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Testimonial[];
};

export function AiStartupSignalTestimonials({
  eyebrow = "Customer proof",
  title = "Trusted by AI platform teams",
  subtitle = "From early-stage ML products to global inference fleets.",
  items = DEFAULT_ITEMS,
}: AiStartupSignalTestimonialsProps) {
  if (!items.length) return null;
  return (
    <section id="testimonials" data-v2-component="ai-startup-signal-testimonials" aria-labelledby="as-testimonials-title" className="df-reveal as-section-alt bg-[var(--color-surface)] py-20 sm:py-28">
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <header className="mb-10 max-w-2xl">
          <p className="as-eyebrow mb-3">{eyebrow}</p>
          <h2 id="as-testimonials-title" className="as-headline-sm">{title}</h2>
          <p className="as-body mt-5 text-[var(--color-muted)]">{subtitle}</p>
        </header>
        <div className="df-reveal-stagger grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <figure key={item.name} className="as-card group p-7 transition-colors hover:border-[color-mix(in_srgb,var(--color-accent)_35%,transparent)]">
              <blockquote className="text-base leading-relaxed">&ldquo;{item.quote}&rdquo;</blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-[var(--border-subtle)] pt-4">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-signal)_18%,transparent)] text-sm font-semibold text-[var(--color-signal)]"
                  aria-hidden
                >
                  {initials(item.name)}
                </span>
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-[var(--color-muted)]">
                    {item.role}
                    {item.company ? ` · ${item.company}` : ""}
                  </p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

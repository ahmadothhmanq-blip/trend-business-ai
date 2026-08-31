"use client";

const TESTIMONIALS = [
  {
    quote: "Ledger restructured our family portfolio across three jurisdictions — tax-efficient, transparent, and aligned with our governance charter.",
    name: "Catherine Ashworth",
    role: "Principal",
    company: "Ashworth Family Office",
  },
  {
    quote: "Their institutional process gave our investment committee the rigor we needed without the bureaucracy of a bulge-bracket bank.",
    name: "James Okonkwo",
    role: "CIO",
    company: "Meridian Endowment",
  },
  {
    quote: "Reporting clarity improved overnight. Our board finally has a single source of truth for performance and risk.",
    name: "Elena Vasquez",
    role: "Treasurer",
    company: "Northwind Foundation",
  },
];

function initials(name: string): string {
  return name.split(" ").map((p) => p[0] ?? "").join("").slice(0, 2).toUpperCase();
}

export function FinancePremiumTestimonials() {
  const featured = TESTIMONIALS[0];
  const supporting = TESTIMONIALS.slice(1);

  return (
    <section id="testimonials" data-v2-component="finance-premium-testimonials" aria-labelledby="fn-testimonials-title" className="df-reveal fn-section-alt bg-[var(--color-surface)] py-20 sm:py-28">
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <header className="mb-12 max-w-2xl">
          <p className="fn-eyebrow">Client counsel</p>
          <h2 id="fn-testimonials-title" className="fn-headline-sm mt-2">Trusted by principals and fiduciaries</h2>
        </header>
        <div className="df-reveal-stagger grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <figure className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--color-background)] p-8 sm:p-10">
            <blockquote className="fn-headline-sm text-balance leading-snug">&ldquo;{featured.quote}&rdquo;</blockquote>
            <figcaption className="mt-8 flex items-center gap-4 border-t border-[var(--border-subtle)] pt-6">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-accent)_15%,transparent)] text-sm font-semibold text-[var(--color-accent)]" aria-hidden>
                {initials(featured.name)}
              </span>
              <div className="min-w-0">
                <p className="font-semibold">{featured.name}</p>
                <p className="text-sm text-[var(--color-muted)]">{featured.role} · {featured.company}</p>
              </div>
            </figcaption>
          </figure>
          <div className="flex flex-col gap-6">
            {supporting.map((item) => (
              <figure key={item.name} className="flex-1 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--color-background)] p-6">
                <blockquote className="text-sm leading-relaxed text-[var(--color-foreground)]">&ldquo;{item.quote}&rdquo;</blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-accent)_12%,transparent)] text-xs font-semibold text-[var(--color-accent)]" aria-hidden>
                    {initials(item.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{item.name}</p>
                    <p className="text-xs text-[var(--color-muted)]">{item.role}</p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

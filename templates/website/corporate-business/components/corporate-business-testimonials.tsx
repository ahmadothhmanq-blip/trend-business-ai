"use client";

const QUOTES = [
  { quote: "Atlas didn't just advise — they embedded with our leadership team and owned the P&L outcomes.", name: "David Okonkwo", role: "CEO", company: "Northwind Industries" },
  { quote: "The operating model work alone paid for the engagement three times over in year one.", name: "Sarah Mitchell", role: "COO", company: "Helix Group" },
  { quote: "Finally a firm that speaks board language and can execute in the field.", name: "James Chen", role: "Chief Transformation Officer", company: "Vertex Energy" },
];

function initials(name: string) {
  return name.split(" ").map((p) => p[0] ?? "").join("").slice(0, 2).toUpperCase();
}

export function CorporateBusinessTestimonials() {
  const featured = QUOTES[0];
  return (
    <section id="testimonials" data-v2-component="corporate-business-testimonials" aria-labelledby="cb-testimonials-title" className="df-reveal py-20 sm:py-28">
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <header className="mb-12 max-w-2xl">
          <p className="cb-eyebrow">Client counsel</p>
          <h2 id="cb-testimonials-title" className="cb-headline-sm mt-2">Trusted by executives</h2>
        </header>
        <figure className="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--color-surface)] p-8 sm:p-12">
          <blockquote className="cb-headline-sm max-w-3xl text-balance leading-snug">&ldquo;{featured.quote}&rdquo;</blockquote>
          <figcaption className="mt-8 flex items-center gap-4 border-t border-[var(--border-subtle)] pt-6">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-accent)_18%,transparent)] text-sm font-semibold text-[var(--color-accent)]" aria-hidden>{initials(featured.name)}</span>
            <div>
              <p className="font-semibold">{featured.name}</p>
              <p className="text-sm text-[var(--color-muted)]">{featured.role} · {featured.company}</p>
            </div>
          </figcaption>
        </figure>
        <div className="df-reveal-stagger mt-6 grid gap-4 sm:grid-cols-2">
          {QUOTES.slice(1).map((q) => (
            <blockquote key={q.name} className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--color-surface)] p-6">
              <p className="text-sm leading-relaxed">&ldquo;{q.quote}&rdquo;</p>
              <footer className="mt-4 text-xs text-[var(--color-muted)]">{q.name}, {q.role}</footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

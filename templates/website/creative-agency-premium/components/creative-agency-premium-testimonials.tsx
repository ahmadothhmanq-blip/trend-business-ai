"use client";

const QUOTE = {
  text: "Volt doesn't just deliver assets — they shape how the market perceives you. Our rebrand became the foundation for three years of growth.",
  name: "Sarah Chen",
  role: "Chief Brand Officer, Archetype",
};

const MORE = [
  { text: "The craft is exceptional. They think in systems, not slides.", name: "Marcus Webb", role: "CEO, Monolith" },
  { text: "Our best creative partnership in a decade.", name: "Elena Vasquez", role: "Founder, Pulse" },
];

export function CreativeAgencyPremiumTestimonials() {
  return (
    <section id="testimonials" data-v2-component="creative-agency-premium-testimonials" className="df-reveal border-t border-[var(--border-default)] py-20 sm:py-28">
      <div className="mx-auto max-w-[88rem] px-5 sm:px-8">
        <blockquote className="max-w-3xl">
          <p className="text-2xl font-medium leading-snug text-[var(--color-ghost)] sm:text-3xl">&ldquo;{QUOTE.text}&rdquo;</p>
          <footer className="mt-8">
            <cite className="not-italic">
              <span className="block font-semibold text-[var(--color-ghost)]">{QUOTE.name}</span>
              <span className="mt-1 block text-sm text-[var(--color-muted)]">{QUOTE.role}</span>
            </cite>
          </footer>
        </blockquote>
        <div className="df-reveal-stagger mt-14 grid gap-6 sm:grid-cols-2">
          {MORE.map((t) => (
            <figure key={t.name} className="border-l-2 border-[var(--color-volt)] pl-6">
              <blockquote className="text-sm leading-relaxed text-[var(--color-muted)]">&ldquo;{t.text}&rdquo;</blockquote>
              <figcaption className="mt-3 text-sm font-medium text-[var(--color-ghost)]">{t.name}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

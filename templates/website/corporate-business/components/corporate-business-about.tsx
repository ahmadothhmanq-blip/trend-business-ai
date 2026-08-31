"use client";

const HIGHLIGHTS = [
  "Founded by former partners from McKinsey, BCG, and operator-led PE",
  "Offices in New York, London, Dubai, and Singapore",
  "Independent — no audit conflicts, no software resale margins",
];

export function CorporateBusinessAbout() {
  return (
    <section id="about" data-v2-component="corporate-business-about" aria-labelledby="cb-about-title" className="df-reveal cb-section-alt bg-[var(--color-surface)] py-20 sm:py-28">
      <div className="df-reveal-stagger mx-auto grid max-w-[82rem] items-center gap-12 px-5 lg:grid-cols-2 sm:px-8">
        <div className="min-w-0">
          <p className="cb-eyebrow">The firm</p>
          <h2 id="cb-about-title" className="cb-headline-sm mt-3 text-balance">Built for the complexity of global enterprise</h2>
          <p className="cb-body mt-6 leading-relaxed text-[var(--color-muted)]">
            Atlas combines strategy consulting with hands-on transformation delivery. We work alongside CEOs and COOs — not in parallel slide decks — to modernize how organizations compete, operate, and grow.
          </p>
          <ul className="mt-8 space-y-3">
            {HIGHLIGHTS.map((h) => (
              <li key={h} className="flex gap-3 text-sm"><span className="text-[var(--color-accent)]" aria-hidden>—</span>{h}</li>
            ))}
          </ul>
          <a href="#contact" className="cb-btn-primary cb-focus-ring mt-10 inline-flex">Meet our partners</a>
        </div>
        <div className="df-reveal-stagger grid gap-4 sm:grid-cols-2">
          {[
            { label: "Industries", value: "12 sectors" },
            { label: "Consultants", value: "800+" },
            { label: "Avg. engagement", value: "14 months" },
            { label: "Client NPS", value: "72" },
          ].map((item) => (
            <div key={item.label} className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--color-background)] p-6 text-center">
              <p className="cb-font-display text-3xl font-semibold text-[var(--color-accent)]">{item.value}</p>
              <p className="mt-2 text-sm text-[var(--color-muted)]">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

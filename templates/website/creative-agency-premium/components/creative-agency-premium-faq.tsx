"use client";

import { useState } from "react";

const FAQ = [
  { q: "What projects do you take on?", a: "Brand systems, product design, campaigns, and creative direction for teams preparing to lead or enter new categories." },
  { q: "How do engagements start?", a: "A discovery call, followed by a scoped proposal with timeline, team, and deliverables — typically within one week." },
  { q: "Do you work internationally?", a: "Yes. Studios in New York, London, Singapore, and Tokyo, with remote collaboration across all time zones." },
  { q: "What's a typical timeline?", a: "Projects run 4–12 weeks. Retainer partnerships are ongoing with quarterly planning cycles." },
];

export function CreativeAgencyPremiumFaq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" data-v2-component="creative-agency-premium-faq" aria-labelledby="sv-faq-title" className="df-reveal py-20 sm:py-28">
      <div className="df-reveal-stagger mx-auto grid max-w-[88rem] gap-12 px-5 lg:grid-cols-[0.9fr_1.1fr] sm:px-8">
        <header className="lg:sticky lg:top-28">
          <p className="sv-font-mono text-[0.6875rem] tracking-[0.22em] text-[var(--color-volt)]">FAQ</p>
          <h2 id="sv-faq-title" className="sv-font-display mt-3 text-3xl font-semibold text-[var(--color-ghost)] [text-transform:none]">
            Before we begin
          </h2>
          <p className="mt-4 text-sm text-[var(--color-muted)]">Common questions about scope, timelines, and how Volt partnerships work.</p>
        </header>
        <dl className="space-y-0">
          {FAQ.map((item, i) => (
            <div key={item.q} className="border-b border-[var(--border-default)]">
              <dt>
                <button
                  type="button"
                  className="sv-focus-ring flex w-full items-center justify-between py-5 text-start text-base font-medium text-[var(--color-ghost)]"
                  aria-expanded={open === i}
                  onClick={() => setOpen(open === i ? null : i)}
                >
                  {item.q}
                  <span className="text-[var(--color-volt)]">{open === i ? "−" : "+"}</span>
                </button>
              </dt>
              {open === i ? <dd className="pb-5 text-sm leading-relaxed text-[var(--color-muted)]">{item.a}</dd> : null}
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";

const FAQ = [
  { q: "How do engagements typically start?", a: "Most begin with a 4–6 week diagnostic — executive interviews, data review, and a prioritized roadmap with quantified business case." },
  { q: "Do you work alongside other advisors?", a: "Yes. We frequently collaborate with law firms, auditors, and technology integrators — with clear accountability for our workstream." },
  { q: "What industries do you serve?", a: "Consumer, industrial, healthcare, financial services, energy, and technology — with sector leads in each practice." },
  { q: "How is success measured?", a: "Every program defines KPIs upfront: cost, revenue, speed, or risk metrics — tracked in quarterly value gates." },
];

export function CorporateBusinessFaq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" data-v2-component="corporate-business-faq" aria-labelledby="cb-faq-title" className="df-reveal py-20 sm:py-28">
      <div className="df-reveal-stagger mx-auto grid max-w-[82rem] gap-12 px-5 lg:grid-cols-2 sm:px-8">
        <header>
          <p className="cb-eyebrow">FAQ</p>
          <h2 id="cb-faq-title" className="cb-headline-sm mt-2">Working with Atlas</h2>
        </header>
        <dl className="min-w-0">
          {FAQ.map((item, i) => (
            <div key={item.q} className="border-b border-[var(--border-subtle)]">
              <dt>
                <button type="button" className="cb-focus-ring flex w-full items-start justify-between gap-4 py-5 text-start font-semibold" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}>
                  <span className="text-balance">{item.q}</span>
                  <span className="shrink-0 text-[var(--color-accent)]">{open === i ? "−" : "+"}</span>
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

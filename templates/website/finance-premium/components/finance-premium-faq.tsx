"use client";

import { useState } from "react";

const FAQ = [
  {
    question: "What is the minimum relationship size?",
    answer: "Private wealth engagements typically begin at $25M in investable assets. Institutional mandates are scoped individually based on complexity and governance requirements.",
  },
  {
    question: "Are you a fiduciary?",
    answer: "Yes. Ledger operates under a fiduciary standard as a registered investment adviser. We do not sell proprietary products or earn commissions on third-party placements.",
  },
  {
    question: "Which jurisdictions do you serve?",
    answer: "We advise clients across the US, UK, EU, and Asia-Pacific, with licensed entities in New York, London, Singapore, and Zurich.",
  },
  {
    question: "How are fees structured?",
    answer: "Fees are asset-based or retainer-based depending on program. All costs are disclosed in your advisory agreement before engagement.",
  },
];

export function FinancePremiumFaq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" data-v2-component="finance-premium-faq" aria-labelledby="fn-faq-title" className="df-reveal fn-section py-20 sm:py-28">
      <div className="df-reveal-stagger mx-auto grid max-w-[82rem] gap-12 px-5 lg:grid-cols-[0.85fr_1.15fr] sm:px-8">
        <header className="lg:sticky lg:top-28">
          <p className="fn-eyebrow">FAQ</p>
          <h2 id="fn-faq-title" className="fn-headline-sm mt-2">Before we begin</h2>
          <p className="fn-body mt-4 text-[var(--color-muted)]">Common questions from principals, trustees, and investment committees.</p>
        </header>
        <dl className="min-w-0">
          {FAQ.map((item, i) => (
            <div key={item.question} className="border-b border-[var(--border-subtle)]">
              <dt>
                <button
                  type="button"
                  className="fn-focus-ring flex w-full items-start justify-between gap-4 py-5 text-start text-base font-semibold"
                  aria-expanded={open === i}
                  onClick={() => setOpen(open === i ? null : i)}
                >
                  <span className="text-balance">{item.question}</span>
                  <span className="shrink-0 text-[var(--color-accent)]">{open === i ? "−" : "+"}</span>
                </button>
              </dt>
              {open === i ? (
                <dd className="pb-5 text-sm leading-relaxed text-[var(--color-muted)]">{item.answer}</dd>
              ) : null}
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

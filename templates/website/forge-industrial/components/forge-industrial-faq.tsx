"use client";

import { useState } from "react";

const DEFAULT_FAQ = [
  {
    question: "How long does commissioning take?",
    answer: "Most assemblies reach steady-state operation within two weeks with guided implementation.",
  },
  {
    question: "Do you integrate with existing plant systems?",
    answer: "Yes — native connectors and open APIs integrate with your current stack without disrupting workflows.",
  },
  {
    question: "What security standards do you meet?",
    answer: "Enterprise-grade security with SOC 2, GDPR compliance, and role-based access controls.",
  },
  {
    question: "Can packages be customized by industry?",
    answer: "Absolutely. Modules and workflows adapt to your sector, governance model, and operating cadence.",
  },
];

type ForgeIndustrialFaqProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ question: string; answer: string }>;
  figureLabel?: string;
};

export function ForgeIndustrialFaq({
  eyebrow = "Technical FAQ",
  title = "Assembly questions",
  subtitle = "Answers formatted as numbered specification notes.",
  items = DEFAULT_FAQ,
  figureLabel = "FIG. — FAQ SPEC",
}: ForgeIndustrialFaqProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      id="faq"
      data-v2-component="forge-industrial-faq"
      aria-labelledby="fg-faq-title"
      className="fg-grid-paper fg-section fg-reveal"
    >
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <div className="fg-frame max-w-3xl">
          <p className="fg-fig-label">{figureLabel}</p>
          <p className="fg-eyebrow mt-4">{eyebrow}</p>
          <h2 id="fg-faq-title" className="fg-headline-sm mt-2">
            {title}
          </h2>
          <p className="fg-body mt-4">{subtitle}</p>
          <div className="mt-6">
            {items.map((item, i) => {
              const open = openIndex === i;
              return (
                <div key={item.question} className="border-t border-dashed border-[var(--border-default)] py-4">
                  <button
                    type="button"
                    className="fg-focus-ring flex w-full items-start justify-between gap-4 text-start"
                    aria-expanded={open}
                    onClick={() => setOpenIndex(open ? null : i)}
                  >
                    <span>
                      <span className="fg-font-mono text-[0.6875rem] uppercase tracking-wider text-[var(--color-accent)]">
                        Q-{String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="fg-font-display mt-1 block text-lg font-semibold uppercase tracking-wide">
                        {item.question}
                      </span>
                    </span>
                    <span className="fg-font-mono text-[var(--color-accent)]" aria-hidden>
                      {open ? "−" : "+"}
                    </span>
                  </button>
                  {open ? <p className="fg-body mt-3 text-sm">{item.answer}</p> : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

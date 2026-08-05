"use client";

import { useState } from "react";

const DEFAULT_FAQ = [
  {
    question: "How do engagements typically begin?",
    answer:
      "We start with a confidential discovery phase — stakeholder interviews, data review, and a prioritized opportunity map — usually completed within two weeks.",
  },
  {
    question: "Which industries do you serve?",
    answer:
      "Our partners have deep experience across financial services, healthcare, industrials, technology, and public sector organizations globally.",
  },
  {
    question: "How do you measure success?",
    answer:
      "Every engagement defines outcome metrics upfront — EBITDA impact, cycle-time reduction, risk exposure, or stakeholder satisfaction — with quarterly executive reviews.",
  },
  {
    question: "Can you work alongside our internal teams?",
    answer:
      "Yes. We embed with leadership and delivery teams, transfer capabilities, and leave behind playbooks so improvements sustain after our engagement ends.",
  },
];

type CorporateBusinessFaqProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ question: string; answer: string }>;
};

export function CorporateBusinessFaq({
  eyebrow = "FAQ",
  title = "Answers for executive sponsors",
  subtitle = "What leadership teams ask before engaging a strategic advisory partner.",
  items = DEFAULT_FAQ,
}: CorporateBusinessFaqProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      id="faq"
      data-v2-component="corporate-business-faq"
      aria-labelledby="cb-faq-title"
      className="cb-section"
    >
      <div className="cb-container">
        <div className="grid gap-16 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <header className="lg:sticky lg:top-28">
            <p className="cb-eyebrow mb-6">{eyebrow}</p>
            <h2 id="cb-faq-title" className="cb-headline-sm max-w-[12ch]">
              {title}
            </h2>
            <div className="cb-accent-line mt-8" aria-hidden />
            <p className="cb-prose mt-8">{subtitle}</p>
          </header>

          <div className="divide-y divide-[var(--border-subtle)] border-y border-[var(--border-subtle)]">
            {items.map((item, index) => {
              const open = openIndex === index;
              const panelId = `cb-faq-panel-${index}`;
              return (
                <div key={`faq-${index}-${item.question}`}>
                  <h3>
                    <button
                      type="button"
                      id={`cb-faq-trigger-${index}`}
                      aria-expanded={open}
                      aria-controls={panelId}
                      className="flex w-full items-center justify-between gap-6 py-6 text-start cb-focus-ring"
                      onClick={() => setOpenIndex(open ? null : index)}
                    >
                      <span className="cb-font-display text-[1.0625rem] font-medium text-[var(--color-foreground)]">
                        {item.question}
                      </span>
                      <span
                        className={[
                          "cb-font-mono flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm transition-all duration-300",
                          open
                            ? "rotate-45 border-[var(--color-signal)] bg-[color-mix(in_srgb,var(--color-signal)_10%,transparent)] text-[var(--color-signal)]"
                            : "border-[var(--border-default)] text-[var(--color-muted)]",
                        ].join(" ")}
                        aria-hidden
                      >
                        +
                      </span>
                    </button>
                  </h3>
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={`cb-faq-trigger-${index}`}
                    hidden={!open}
                    className="pb-6"
                  >
                    <p className="cb-font-body max-w-prose text-[0.9375rem] leading-[1.75] text-[var(--color-muted)]">
                      {item.answer}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

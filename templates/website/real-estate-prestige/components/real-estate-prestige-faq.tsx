"use client";

import { useState } from "react";

const DEFAULT_FAQ = [
  { question: "How do we get started?", answer: "Reach out with your goals — we respond within one business day with next steps." },
  { question: "What does onboarding look like?", answer: "A short discovery call, scoped proposal, and a clear timeline before work begins." },
  { question: "Can you adapt to our industry?", answer: "Yes — deliverables and messaging are tailored to your sector and audience." },
  { question: "Do you offer ongoing support?", answer: "Retainer and project models are available depending on your needs." },
];

type FaqItem = { question: string; answer: string };

type RealEstatePrestigeFaqProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: FaqItem[];
};

export function RealEstatePrestigeFaq({
  eyebrow = "FAQ",
  title = "Common questions",
  subtitle,
  items = DEFAULT_FAQ,
}: RealEstatePrestigeFaqProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!items.length) return null;

  return (
    <section id="faq" data-v2-component="real-estate-prestige-faq" aria-labelledby="rep-faq-title" className="rep-reveal rep-section-alt py-20 sm:py-28">
      <div className="rep-container max-w-3xl">
        <header className="rep-section-header rep-section-header--rule">
          {eyebrow ? <p className="rep-eyebrow">{eyebrow}</p> : null}
          <h2 id="rep-faq-title" className="rep-headline-sm">
            {title}
          </h2>
          {subtitle ? <p className="rep-body">{subtitle}</p> : null}
        </header>
        <dl className="divide-y divide-[var(--border-default)] border-y border-[var(--border-default)]">
          {items.map((item, index) => {
            const open = openIndex === index;
            return (
              <div key={item.question} className="rep-faq-item" data-open={open ? "true" : "false"}>
                <dt>
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => setOpenIndex(open ? null : index)}
                    className="rep-faq-question rep-focus-ring flex w-full items-center justify-between gap-4 px-1 py-5 text-start"
                  >
                    {item.question}
                    <span
                      aria-hidden
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-lg leading-none transition ${
                        open
                          ? "border-[var(--color-brass)] bg-[var(--color-brass)] text-[var(--color-background)]"
                          : "border-[var(--border-default)] text-[var(--color-brass)]"
                      }`}
                    >
                      {open ? "−" : "+"}
                    </span>
                  </button>
                </dt>
                {open ? <dd className="rep-faq-answer rep-body-sm px-1 pb-6 opacity-100">{item.answer}</dd> : null}
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}

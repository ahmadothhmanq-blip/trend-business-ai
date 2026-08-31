"use client";

import { useState } from "react";

const DEFAULT_FAQ = [
  { question: "How do we get started?", answer: "Reach out with your goals — we respond within one business day with next steps." },
  { question: "What does onboarding look like?", answer: "A short discovery call, scoped proposal, and a clear timeline before work begins." },
  { question: "Can you adapt to our needs?", answer: "Yes — deliverables and messaging are tailored to your goals and audience." },
  { question: "Do you offer ongoing support?", answer: "Retainer and project models are available depending on your needs." },
];

type FaqItem = { question: string; answer: string };

type MedicalPremiumFaqProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: FaqItem[];
};

export function MedicalPremiumFaq({
  eyebrow = "FAQ",
  title = "Common questions",
  subtitle,
  items = DEFAULT_FAQ,
}: MedicalPremiumFaqProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!items.length) return null;

  return (
    <section id="faq" data-v2-component="medical-premium-faq" aria-labelledby="mp-faq-title" className="mp-reveal mp-section-alt py-20 sm:py-28">
      <div className="mp-container max-w-3xl">
        <header className="mp-section-header mp-section-header--rule">
          {eyebrow ? <p className="mp-eyebrow">{eyebrow}</p> : null}
          <h2 id="mp-faq-title" className="mp-headline-sm mt-4">
            {title}
          </h2>
          {subtitle ? <p className="mp-body mt-4">{subtitle}</p> : null}
        </header>
        <dl className="mt-10 divide-y divide-[var(--border-default)] border-y border-[var(--border-default)]">
          {items.map((item, index) => {
            const open = openIndex === index;
            return (
              <div key={item.question} className="mp-faq-item" data-open={open ? "true" : "false"}>
                <dt>
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => setOpenIndex(open ? null : index)}
                    className="mp-faq-question mp-focus-ring flex w-full items-center justify-between gap-4 px-1 py-5 text-start"
                  >
                    {item.question}
                    <span
                      aria-hidden
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-lg leading-none transition ${
                        open
                          ? "border-[var(--color-healing)] bg-[var(--color-healing)] text-[var(--color-background)]"
                          : "border-[var(--border-default)] text-[var(--color-healing)]"
                      }`}
                    >
                      {open ? "−" : "+"}
                    </span>
                  </button>
                </dt>
                {open ? <dd className="mp-faq-answer mp-body-sm px-1 pb-6">{item.answer}</dd> : null}
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}

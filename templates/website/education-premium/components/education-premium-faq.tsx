"use client";

import { useState } from "react";

const DEFAULT_FAQ = [
  {
    question: "What are the application deadlines?",
    answer:
      "Early decision applications are due November 1, with decisions released by mid-December. Regular decision applications are due January 2, with decisions released by late March.",
  },
  {
    question: "How does financial aid work?",
    answer:
      "Scholar's Hall meets 100% of demonstrated financial need for all admitted students. Submit the FAFSA and CSS Profile by February 1 to be considered for grants, scholarships, and work-study.",
  },
  {
    question: "Can I visit campus before applying?",
    answer:
      "Absolutely. We offer guided campus tours, information sessions, and overnight stays for prospective students throughout the academic year. Register online to schedule your visit.",
  },
  {
    question: "What makes Scholar's Hall different?",
    answer:
      "Our combination of small seminar-style classes, world-class research opportunities, and a tight-knit residential community creates an educational experience found at few institutions worldwide.",
  },
];

type EducationPremiumFaqProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ question: string; answer: string }>;
};

export function EducationPremiumFaq({
  eyebrow = "Admissions FAQ",
  title = "Questions from prospective students",
  subtitle = "Everything you need to know about applying, financial aid, and life at Scholar's Hall.",
  items = DEFAULT_FAQ,
}: EducationPremiumFaqProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      id="faq"
      data-v2-component="education-premium-faq"
      aria-labelledby="ed-faq-title"
      className="ed-section ed-section-alt bg-[var(--color-surface)]"
    >
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <header className="lg:sticky lg:top-28">
            <p className="ed-eyebrow mb-3">{eyebrow}</p>
            <h2 id="ed-faq-title" className="ed-headline-sm">
              {title}
            </h2>
            <div className="ed-accent-line mt-4" aria-hidden />
            <p className="ed-body mt-5">{subtitle}</p>
          </header>

          <div className="space-y-3">
            {items.map((item, index) => {
              const open = openIndex === index;
              const panelId = `ed-faq-panel-${index}`;
              return (
                <div
                  key={`faq-${index}-${item.question}`}
                  className={`ed-card overflow-hidden transition-shadow duration-300 ${open ? "shadow-[var(--shadow-surface)]" : ""}`}
                >
                  <h3>
                    <button
                      type="button"
                      id={`ed-faq-trigger-${index}`}
                      aria-expanded={open}
                      aria-controls={panelId}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-start ed-focus-ring transition-colors hover:text-[var(--color-primary)]"
                      onClick={() => setOpenIndex(open ? null : index)}
                    >
                      <span className="ed-font-display text-sm font-semibold text-[var(--color-foreground)]">
                        {item.question}
                      </span>
                      <span
                        className={`ed-font-mono flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--border-default)] text-xs text-[var(--color-signal)] transition-all duration-300 ${open ? "rotate-180 bg-[color-mix(in_srgb,var(--color-signal)_10%,transparent)]" : ""}`}
                        aria-hidden
                      >
                        {open ? "−" : "+"}
                      </span>
                    </button>
                  </h3>
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={`ed-faq-trigger-${index}`}
                    hidden={!open}
                    className="border-t border-[var(--border-subtle)] px-5 py-4 motion-safe:animate-[ed-slide-up_0.35s_ease_both]"
                  >
                    <p className="ed-font-body text-sm leading-relaxed text-[var(--color-muted)]">
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

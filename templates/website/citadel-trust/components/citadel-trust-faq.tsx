"use client";

import { useState } from "react";

const DEFAULT_FAQ = [
  {
    question: "How do we initiate an engagement?",
    answer:
      "Contact our intake team with a brief matter summary. A partner will respond within one business day to scope next steps and conflict clearance.",
  },
  {
    question: "Do you handle cross-border matters?",
    answer:
      "Yes — our coordinated teams operate across 42 jurisdictions with unified matter management and single-point partner accountability.",
  },
  {
    question: "What industries do you serve?",
    answer:
      "Financial services, energy, healthcare, technology, sovereign institutions, and regulated industries facing complex litigation or policy change.",
  },
  {
    question: "Is our matter confidential?",
    answer:
      "All inquiries are protected by attorney-client privilege from first contact. We conduct conflict checks before any substantive discussion.",
  },
];

type CitadelTrustFaqProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ question: string; answer: string }>;
};

export function CitadelTrustFaq({
  eyebrow = "Counsel notes",
  title = "Before you engage",
  subtitle = "Clarifications presented as legal panels within the dossier.",
  items = DEFAULT_FAQ,
}: CitadelTrustFaqProps) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section
      id="faq"
      data-v2-component="citadel-trust-faq"
      aria-labelledby="ct-faq-title"
      className="ct-dossier ct-section ct-reveal"
    >
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <header className="mb-8">
          <p className="ct-eyebrow">{eyebrow}</p>
          <h2 id="ct-faq-title" className="ct-headline-sm mt-3">
            {title}
          </h2>
          <p className="ct-body mt-4">{subtitle}</p>
        </header>

        <div className="ct-doc">
          <p className="ct-doc-ribbon">
            <span className="ct-doc-seal-mark" aria-hidden />
            Privilege notice
          </p>
          <dl className="ct-reveal-stagger">
            {items.map((item, i) => (
              <div key={item.question} className="ct-article">
                <dt>
                  <button
                    type="button"
                    className="ct-focus-ring flex w-full items-start justify-between gap-4 text-start"
                    aria-expanded={open === i}
                    onClick={() => setOpen(open === i ? null : i)}
                  >
                    <span>
                      <span className="ct-article-num">Q.{String(i + 1).padStart(2, "0")}</span>
                      <span className="ct-article-title mt-1 block text-xl">{item.question}</span>
                    </span>
                    <span className="ct-font-mono text-[var(--color-accent)]" aria-hidden>
                      {open === i ? "−" : "+"}
                    </span>
                  </button>
                </dt>
                {open === i ? <dd className="ct-body mt-3 text-base">{item.answer}</dd> : null}
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

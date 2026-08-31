"use client";

import { useState } from "react";

const DEFAULT_FAQ = [
  {
    question: "How long does onboarding take?",
    answer: "Most teams are fully operational within two weeks with guided implementation and dedicated support.",
  },
  {
    question: "Do you integrate with existing tools?",
    answer: "Yes — native connectors and open APIs integrate with your current stack without disrupting workflows.",
  },
  {
    question: "What security standards do you meet?",
    answer: "Enterprise-grade security with SOC 2, GDPR compliance, and role-based access controls.",
  },
  {
    question: "Can we customize for our industry?",
    answer: "Absolutely. Modules and workflows adapt to your sector, governance model, and operating cadence.",
  },
];

type PulseFintechFaqProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ question: string; answer: string }>;
};

export function PulseFintechFaq({
  eyebrow = "Compliance FAQ",
  title = "Operator questions",
  subtitle = "Answers your risk and payments teams ask first.",
  items = DEFAULT_FAQ,
}: PulseFintechFaqProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  return (
    <section id="faq" data-v2-component="pulse-fintech-faq" className="pu-reveal pu-section px-4 sm:px-6">
      <div className="mx-auto max-w-[96rem]">
        <p className="pu-eyebrow">{eyebrow}</p>
        <h2 className="pu-headline-sm mt-1">{title}</h2>
        <p className="pu-body mt-2 max-w-xl">{subtitle}</p>
        <div className="pu-panel mt-6">
          <div className="pu-panel-head">
            <span>FAQ // STREAM</span>
            <span>{items.length} NODES</span>
          </div>
          <div className="divide-y divide-[var(--border-subtle)]">
            {items.map((item, index) => {
              const open = openIndex === index;
              return (
                <div key={item.question} className="px-3 py-3 sm:px-4">
                  <button
                    type="button"
                    className="pu-focus-ring flex w-full items-start justify-between gap-4 text-start font-mono text-sm font-semibold text-[var(--color-foreground)]"
                    onClick={() => setOpenIndex(open ? null : index)}
                    aria-expanded={open}
                  >
                    <span>
                      <span className="me-3 text-[var(--color-accent)]">{String(index + 1).padStart(2, "0")}</span>
                      {item.question}
                    </span>
                    <span aria-hidden className="text-[var(--color-accent)]">
                      {open ? "[-]" : "[+]"}
                    </span>
                  </button>
                  {open ? <p className="pu-body mt-3 ps-8 text-sm">{item.answer}</p> : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

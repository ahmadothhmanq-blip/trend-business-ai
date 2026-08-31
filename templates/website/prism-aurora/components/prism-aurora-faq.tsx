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

type PrismAuroraFaqProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ question: string; answer: string }>;
};

export function PrismAuroraFaq({
  eyebrow = "FAQ",
  title = "Common questions",
  subtitle = "Everything you need to know before getting started.",
  items = DEFAULT_FAQ,
}: PrismAuroraFaqProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  return (
    <section id="faq" data-v2-component="prism-aurora-faq" className="pr-reveal pr-section bg-[var(--color-background)] px-4 sm:px-6">
      <div className="pr-mosaic mx-auto max-w-[88rem]">
        <div className="pr-tile pr-tile-ink pr-span-4">
          <p className="pr-eyebrow !text-[color-mix(in_srgb,var(--color-background)_70%,transparent)]">{eyebrow}</p>
          <h2 className="pr-headline-sm mt-3 !text-[var(--color-background)]">{title}</h2>
          <p className="mt-3 text-sm text-[color-mix(in_srgb,var(--color-background)_70%,transparent)]">{subtitle}</p>
        </div>
        <div className="pr-tile pr-span-8 space-y-2 !p-3 sm:!p-4">
          {items.map((item, index) => {
            const open = openIndex === index;
            return (
              <div key={item.question} className={`pr-tile !min-h-0 !rounded-xl ${open ? "pr-tile-field-a" : ""}`}>
                <button
                  type="button"
                  className="pr-focus-ring flex w-full items-start justify-between gap-4 text-start font-semibold"
                  onClick={() => setOpenIndex(open ? null : index)}
                  aria-expanded={open}
                >
                  <span>{item.question}</span>
                  <span aria-hidden className="text-[var(--color-accent)]">
                    {open ? "−" : "+"}
                  </span>
                </button>
                {open ? <p className="pr-body mt-3 text-sm">{item.answer}</p> : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";

const DEFAULT_FAQ = [
  {
    question: "How do private viewings work?",
    answer: "By appointment. We arrange a quiet setting — atelier, salon, or remote — matched to the collection.",
  },
  {
    question: "Do you ship internationally?",
    answer: "Yes, with white-glove logistics and documented provenance for every piece that leaves the maison.",
  },
  {
    question: "Can commissions be requested?",
    answer: "Select commissions are accepted when the brief aligns with our materials and finishing cadence.",
  },
  {
    question: "Is there a public retail calendar?",
    answer: "No. Releases are announced privately to existing clients and invited collectors.",
  },
];

type ObsidianNoirFaqProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ question: string; answer: string }>;
};

export function ObsidianNoirFaq({
  eyebrow = "Notes",
  title = "Quiet answers",
  items = DEFAULT_FAQ,
}: ObsidianNoirFaqProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  return (
    <section id="faq" data-v2-component="obsidian-noir-faq" className="ob-reveal ob-section px-5 sm:px-8">
      <div className="mx-auto max-w-[72rem]">
        <p className="ob-eyebrow">{eyebrow}</p>
        <h2 className="ob-headline-sm mt-4">{title}</h2>
        <hr className="ob-rule mt-12" />
        <div>
          {items.map((item, index) => {
            const open = openIndex === index;
            return (
              <div key={item.question} className="border-b border-[var(--border-default)] py-8">
                <button
                  type="button"
                  className="ob-focus-ring flex w-full items-baseline justify-between gap-6 text-start"
                  onClick={() => setOpenIndex(open ? null : index)}
                  aria-expanded={open}
                >
                  <span className="ob-font-display text-xl sm:text-2xl">{item.question}</span>
                  <span aria-hidden className="text-sm text-[var(--color-muted)]">
                    {open ? "−" : "+"}
                  </span>
                </button>
                {open ? <p className="ob-body mt-4 max-w-2xl">{item.answer}</p> : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

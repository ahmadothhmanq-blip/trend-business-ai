"use client";

import { useState } from "react";

const DEFAULT_FAQ = [
  {
    question: "How do I begin?",
    answer: "Share a short note through Visit. We recommend a gentle intake ritual before membership.",
  },
  {
    question: "Are treatments clinical?",
    answer: "Yes — aesthetics and recovery are practitioner-led, with evidence-based protocols and calm pacing.",
  },
  {
    question: "Can I visit without membership?",
    answer: "Day rituals are available by appointment. Memberships unlock quieter cadence and priority rooms.",
  },
  {
    question: "Is the house private?",
    answer: "Spaces are designed for discretion. Sanctuary membership includes private practitioner access.",
  },
];

type LuminaWellnessFaqProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ question: string; answer: string }>;
};

export function LuminaWellnessFaq({
  eyebrow = "Gentle answers",
  title = "Questions, without hurry",
  subtitle = "One question at a time — soft and clear.",
  items = DEFAULT_FAQ,
}: LuminaWellnessFaqProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      id="faq"
      data-v2-component="lumina-wellness-faq"
      aria-labelledby="lu-faq-title"
      className="lu-section lu-reveal"
    >
      <div className="mx-auto max-w-xl px-5 text-center sm:px-8">
        <p className="lu-eyebrow">{eyebrow}</p>
        <h2 id="lu-faq-title" className="lu-headline-sm mt-4">
          {title}
        </h2>
        <p className="lu-body mx-auto mt-4 max-w-md">{subtitle}</p>
      </div>
      <div className="mx-auto mt-8 max-w-md px-5 sm:px-8">
        {items.map((item, index) => {
          const open = openIndex === index;
          return (
            <div key={item.question} className="lu-membership text-start">
              <button
                type="button"
                className="lu-focus-ring flex w-full items-start justify-between gap-4 text-start"
                aria-expanded={open}
                onClick={() => setOpenIndex(open ? null : index)}
              >
                <span className="lu-ritual-title text-xl">{item.question}</span>
                <span className="text-[var(--color-accent)]" aria-hidden>
                  {open ? "−" : "+"}
                </span>
              </button>
              {open ? <p className="lu-body mt-3 text-sm">{item.answer}</p> : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

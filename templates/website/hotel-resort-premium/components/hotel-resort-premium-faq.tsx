"use client";

import { useState } from "react";

const DEFAULT_FAQ = [
  { question: "How do we get started?", answer: "Reach out with your goals — we respond within one business day with next steps." },
  { question: "What does onboarding look like?", answer: "A short discovery call, scoped proposal, and a clear timeline before work begins." },
  { question: "Can you adapt to our needs?", answer: "Yes — deliverables and messaging are tailored to your goals and audience." },
  { question: "Do you offer ongoing support?", answer: "Retainer and project models are available depending on your needs." },
];

type FaqItem = { question: string; answer: string };

type HotelResortPremiumFaqProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: FaqItem[];
};

export function HotelResortPremiumFaq({
  eyebrow = "FAQ",
  title = "Common questions",
  subtitle,
  items = DEFAULT_FAQ,
}: HotelResortPremiumFaqProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!items.length) return null;

  return (
    <section id="faq" data-v2-component="hotel-resort-premium-faq" aria-labelledby="hr-faq-title" className="hr-reveal hr-section-alt">
      <div className="hr-container max-w-2xl">
        <header className="hr-section-header hr-section-header--rule hr-section-header--center mx-auto text-center">
          {eyebrow ? <p className="hr-eyebrow">{eyebrow}</p> : null}
          <h2 id="hr-faq-title" className="hr-headline-sm mt-4">
            {title}
          </h2>
          <div className="hr-azure-rule mx-auto" />
          {subtitle ? <p className="hr-body mt-4">{subtitle}</p> : null}
        </header>
        <dl className="mt-10">
          {items.map((item, index) => {
            const open = openIndex === index;
            return (
              <div key={item.question} className="hr-faq-item" data-open={open ? "true" : "false"}>
                <dt>
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => setOpenIndex(open ? null : index)}
                    className="hr-faq-question hr-focus-ring flex w-full items-center justify-between gap-4 py-5 text-start"
                  >
                    {item.question}
                    <span aria-hidden className="hr-faq-toggle">
                      {open ? "−" : "+"}
                    </span>
                  </button>
                </dt>
                {open ? <dd className="hr-faq-answer hr-body-sm">{item.answer}</dd> : null}
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}

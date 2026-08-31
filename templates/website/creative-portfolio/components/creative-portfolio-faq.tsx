"use client";

import { useState } from "react";

const DEFAULT_FAQ = [
  {
    "question": "How long does onboarding take?",
    "answer": "Most teams are fully operational within two weeks with guided implementation and dedicated support."
  },
  {
    "question": "Do you integrate with existing tools?",
    "answer": "Yes — native connectors and open APIs integrate with your current stack without disrupting workflows."
  },
  {
    "question": "What security standards do you meet?",
    "answer": "Enterprise-grade security with SOC 2, GDPR compliance, and role-based access controls."
  },
  {
    "question": "Can we customize for our industry?",
    "answer": "Absolutely. Modules and workflows adapt to your sector, governance model, and operating cadence."
  }
];

type CreativePortfolioFaqProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ question: string; answer: string }>;
};

export function CreativePortfolioFaq({
  eyebrow = "FAQ",
  title = "Common questions",
  subtitle = "Everything you need to know before getting started.",
  items = DEFAULT_FAQ,
}: CreativePortfolioFaqProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  return (
    <section id="faq" data-v2-component="creative-portfolio-faq" className="df-reveal py-20 sm:py-28">
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <h2 className="cp-headline-sm">{title}</h2>
        <dl className="df-reveal-stagger mt-10 grid gap-8 sm:grid-cols-2">
          {items.map((item) => (
            <div key={item.question}>
              <dt className="font-bold">{item.question}</dt>
              <dd className="mt-2 text-sm text-[var(--color-muted)]">{item.answer}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

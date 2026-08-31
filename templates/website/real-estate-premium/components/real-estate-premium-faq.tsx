"use client";

const DEFAULT_FAQ = [
  {
    question: "How are viewings arranged?",
    answer: "By appointment only. The desk coordinates access, transport, and privacy protocols.",
  },
  {
    question: "Do you handle off-market inventory?",
    answer: "Yes — private listings are circulated as sealed dossiers to qualified principals.",
  },
  {
    question: "Which markets do you cover?",
    answer: "Active desks in New York, London, and Dubai, with partner coverage in additional premier markets.",
  },
  {
    question: "What does an agency program include?",
    answer: "Search or mandate scope, dossier cadence, negotiation lead, and conveyance coordination.",
  },
];

type RealEstatePremiumFaqProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ question: string; answer: string }>;
};

export function RealEstatePremiumFaq({
  eyebrow = "Desk FAQ",
  title = "Clarifications",
  subtitle = "Answers as a specification sheet.",
  items = DEFAULT_FAQ,
}: RealEstatePremiumFaqProps) {
  return (
    <section id="faq" data-v2-component="real-estate-premium-faq" className="rep-section-plain rep-reveal">
      <div className="rep-section-plain-inner">
        <p className="rep-eyebrow">{eyebrow}</p>
        <h2 className="rep-amenities-title">{title}</h2>
        <p className="rep-body text-[var(--color-muted)]">{subtitle}</p>
        <dl className="rep-spec-list">
          {items.map((item) => (
            <div key={item.question}>
              <dt>{item.question}</dt>
              <dd>{item.answer}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

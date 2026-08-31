"use client";

const DEFAULT_FAQ = [
  {
    question: "How do I request a prospectus?",
    answer: "Write the letters desk with your intended program. Admissions replies within two business days with term dates and requirements.",
  },
  {
    question: "Are visiting scholars welcome mid-term?",
    answer: "Yes — short residencies are arranged through the dean’s office when seminar capacity allows.",
  },
  {
    question: "What languages are courses offered in?",
    answer: "Primary instruction is English, with language electives and bilingual research seminars in select institutes.",
  },
  {
    question: "Can alumni audit seminars?",
    answer: "Alumni fellows may audit with faculty approval. A quiet seat policy keeps the seminar table focused.",
  },
];

type EducationPremiumFaqProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ question: string; answer: string }>;
};

export function EducationPremiumFaq({
  eyebrow = "Clarifications",
  title = "Readers ask",
  subtitle = "Answers from the registrar and the letters desk.",
  items = DEFAULT_FAQ,
}: EducationPremiumFaqProps) {
  return (
    <section
      id="faq"
      data-v2-component="education-premium-faq"
      aria-labelledby="ed-faq-title"
      className="ed-faq ed-paper ed-reveal"
    >
      <div className="ed-faq-inner">
        <header className="ed-section-head">
          <p className="ed-eyebrow">{eyebrow}</p>
          <h2 id="ed-faq-title" className="ed-headline-sm ed-font-display">
            {title}
          </h2>
          <p className="ed-body">{subtitle}</p>
        </header>

        <ol className="ed-faq-list ed-reveal-stagger">
          {items.map((item, i) => (
            <li key={item.question} className="ed-faq-item">
              <span className="ed-faq-num ed-font-mono">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3 className="ed-faq-q ed-font-display">{item.question}</h3>
                <p className="ed-faq-a">{item.answer}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

"use client";

const DEFAULT_FAQ = [
  {
    question: "How is Nexus deployed?",
    answer: "SaaS multi-tenant by default, with private network options on Global plans. SCIM provisioning is available on Enterprise+.",
  },
  {
    question: "Can we keep our CRM as system of record?",
    answer: "Yes. Bidirectional sync keeps CRM objects authoritative while Nexus owns forecast logic and playbooks.",
  },
  {
    question: "What does onboarding look like?",
    answer: "A guided workspace import maps stages, users, and historical pipeline, then activates modules progressively.",
  },
  {
    question: "Where do security reviews start?",
    answer: "Request the trust packet from Support — SOC 2, data-flow diagrams, and DPA templates are included.",
  },
];

type SaasEnterpriseFaqProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ question: string; answer: string }>;
};

export function SaasEnterpriseFaq({
  eyebrow = "Docs",
  title = "Operator FAQ",
  subtitle = "Answers written like product documentation.",
  items = DEFAULT_FAQ,
}: SaasEnterpriseFaqProps) {
  return (
    <section
      id="faq"
      data-v2-component="saas-enterprise-faq"
      aria-labelledby="se-faq-title"
      className="se-faq se-reveal"
    >
      <div className="se-docs-inner">
        <header className="se-docs-head">
          <p className="se-eyebrow">{eyebrow}</p>
          <h2 id="se-faq-title" className="se-headline-sm se-font-display">
            {title}
          </h2>
          <p className="se-body">{subtitle}</p>
        </header>
        <dl className="se-faq-list se-reveal-stagger">
          {items.map((item) => (
            <div key={item.question} className="se-faq-item">
              <dt>{item.question}</dt>
              <dd>{item.answer}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

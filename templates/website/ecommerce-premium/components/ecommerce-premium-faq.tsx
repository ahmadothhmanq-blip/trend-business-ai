"use client";

const DEFAULT_FAQ = [
  {
    question: "How do limited editions ship?",
    answer: "Numbered pieces ship in atelier packaging with white-glove options in major cities within 48 hours of confirmation.",
  },
  {
    question: "Can I reserve a fitting?",
    answer: "Maison and Private clients may book fittings through the contact desk. Studio pieces are ready-to-wear.",
  },
  {
    question: "Do you restock sold-out runs?",
    answer: "Archive editions are not remade. Seasonal capsules may return in a new finish the following year.",
  },
  {
    question: "What is your care policy?",
    answer: "Every order includes a care guide. Leather and tailoring repairs are handled by our atelier network.",
  },
];

type EcommercePremiumFaqProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ question: string; answer: string }>;
};

export function EcommercePremiumFaq({
  eyebrow = "Service",
  title = "Buying desk",
  subtitle = "Practical answers for collectors and first-time clients.",
  items = DEFAULT_FAQ,
}: EcommercePremiumFaqProps) {
  return (
    <section
      id="faq"
      data-v2-component="ecommerce-premium-faq"
      aria-labelledby="ec-faq-title"
      className="ec-faq ec-reveal"
    >
      <div className="ec-faq-inner">
        <header className="ec-section-head">
          <p className="ec-eyebrow">{eyebrow}</p>
          <h2 id="ec-faq-title" className="ec-headline-sm ec-font-display">
            {title}
          </h2>
          <p className="ec-body">{subtitle}</p>
        </header>
        <dl className="ec-faq-list ec-reveal-stagger">
          {items.map((item) => (
            <div key={item.question} className="ec-faq-item">
              <dt>{item.question}</dt>
              <dd>{item.answer}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

"use client";

const DEFAULT_FAQ = [
  {
    question: "How far in advance should we reserve?",
    answer: "Dinner service books two to six weeks ahead; chef’s table requests may need longer.",
  },
  {
    question: "Is the tasting menu fixed?",
    answer: "Courses follow the season. Dietary notes are taken at reservation and woven into the progression.",
  },
  {
    question: "Do you offer wine pairings?",
    answer: "Yes — a cellar pairing and a juice pairing run beside the tasting spine.",
  },
  {
    question: "Is there a dress code?",
    answer: "Smart and comfortable. The room is intimate; jackets are welcome, not required.",
  },
];

type RestaurantSignatureFaqProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ question: string; answer: string }>;
};

export function RestaurantSignatureFaq({
  eyebrow = "House notes",
  title = "Before you arrive",
  subtitle = "Practical answers for guests.",
  items = DEFAULT_FAQ,
}: RestaurantSignatureFaqProps) {
  return (
    <section
      id="faq"
      data-v2-component="restaurant-signature-faq"
      className="rs-menu-doc rs-reveal"
      style={{ paddingTop: "0", borderTop: "0" }}
      aria-labelledby="rs-faq-title"
    >
      <div className="rs-menu-faq">
        <p className="rs-menu-section-label" id="rs-faq-title">
          {eyebrow} · {title}
        </p>
        <p className="sr-only">{subtitle}</p>
        {items.map((item) => (
          <details key={item.question}>
            <summary>{item.question}</summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

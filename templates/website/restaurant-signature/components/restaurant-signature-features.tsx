"use client";

const DEFAULT_FEATURES = [
  {
    title: "Forest broth",
    description: "Pine-needle consommé, smoked trout roe, wild thyme.",
    icon: "01",
    price: "—",
  },
  {
    title: "Hearth bread",
    description: "Wood-fired loaf, cultured butter, fermented honey.",
    icon: "02",
    price: "—",
  },
  {
    title: "River catch",
    description: "Day-boat fish, brassica, browned butter emulsion.",
    icon: "03",
    price: "—",
  },
  {
    title: "Game & root",
    description: "Slow-roasted bird, black garlic, forest mushrooms.",
    icon: "04",
    price: "—",
  },
];

type CourseItem = {
  title: string;
  description: string;
  icon?: string;
  span?: string;
  price?: string;
};

type RestaurantSignatureFeaturesProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: CourseItem[];
};

export function RestaurantSignatureFeatures({
  eyebrow = "Tasting progression",
  title = "Courses",
  subtitle = "A sequential menu — numbered, noted, and paced.",
  items = DEFAULT_FEATURES,
}: RestaurantSignatureFeaturesProps) {
  return (
    <section
      id="features"
      data-v2-component="restaurant-signature-features"
      aria-labelledby="rs-features-title"
      className="rs-menu-doc rs-menu-courses rs-reveal"
      style={{ paddingTop: "0", borderTop: "0" }}
    >
      <p className="rs-menu-section-label" id="rs-features-title">
        {eyebrow} · {title}
      </p>
      <p className="sr-only">{subtitle}</p>
      <div>
        {items.map((item, i) => {
          const num = item.icon ?? String(i + 1).padStart(2, "0");
          return (
            <article key={item.title} className="rs-course">
              <span className="rs-course-num" aria-hidden>
                {num}
              </span>
              <div>
                <h3 className="rs-course-title">{item.title}</h3>
                <p className="rs-course-note">{item.description}</p>
              </div>
              <span className="rs-course-price">{item.price ?? "—"}</span>
            </article>
          );
        })}
      </div>
    </section>
  );
}

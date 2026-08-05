"use client";

import { FlagshipFaqSection } from "@/lib/website/template-v2/flagship/faq-section";
import { RESTAURANT_FLAGSHIP_UI } from "@/lib/website/template-v2/flagship/themes";

export function RestaurantPremiumFaq() {
  return (
    <FlagshipFaqSection
      ui={RESTAURANT_FLAGSHIP_UI}
      componentId="restaurant-premium-faq"
      id="faq"
      eyebrow="Reservations"
      title="Before you visit"
      items={[
        {
          question: "What is the dress code?",
          answer:
            "Smart casual to formal. We welcome guests who dress with intention for an elevated dining experience.",
        },
        {
          question: "Do you accommodate dietary restrictions?",
          answer:
            "Yes. Please note allergies and preferences when booking — our kitchen prepares thoughtful alternatives for every course.",
        },
        {
          question: "How far in advance should I book?",
          answer:
            "We recommend reserving two to three weeks ahead for weekend service. Private dining may require additional notice.",
        },
        {
          question: "Is there a tasting menu?",
          answer:
            "Our chef's tasting menu changes with the season. A curated wine pairing is available for each seating.",
        },
      ]}
    />
  );
}

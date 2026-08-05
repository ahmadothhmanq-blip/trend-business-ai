"use client";

import { FlagshipFaqSection } from "@/lib/website/template-v2/flagship/faq-section";
import { HOTEL_RESORT_FLAGSHIP_UI } from "@/lib/website/template-v2/flagship/themes";

export function HotelResortPremiumFaq() {
  return (
    <FlagshipFaqSection
      ui={HOTEL_RESORT_FLAGSHIP_UI}
      componentId="hotel-resort-premium-faq"
      id="faq"
      eyebrow="Before you arrive"
      title="Planning your stay"
      items={[
        {
          question: "What is included with villa reservations?",
          answer:
            "Daily breakfast, airport transfers, Wi-Fi, and access to spa facilities. Private dining and excursions are arranged through your villa concierge.",
        },
        {
          question: "Do you accommodate dietary preferences?",
          answer:
            "Yes. Share preferences when booking — our culinary team prepares thoughtful menus for every villa and restaurant reservation.",
        },
        {
          question: "How far in advance should I book?",
          answer:
            "We recommend reserving three to six months ahead for peak season. Signature suite categories and yacht charters may require additional notice.",
        },
        {
          question: "Are children welcome?",
          answer:
            "Azure Haven welcomes families. Family villas, kids' club programming, and tailored excursions are available upon request.",
        },
      ]}
    />
  );
}

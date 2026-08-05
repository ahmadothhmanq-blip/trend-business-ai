"use client";

import { FlagshipTestimonialsSection } from "@/lib/website/template-v2/flagship/testimonials-section";
import { RESTAURANT_FLAGSHIP_UI } from "@/lib/website/template-v2/flagship/themes";

export function RestaurantPremiumTestimonials() {
  return (
    <FlagshipTestimonialsSection
      ui={RESTAURANT_FLAGSHIP_UI}
      componentId="restaurant-premium-testimonials"
      id="testimonials"
      eyebrow="Guest voices"
      title="An evening they remember"
      items={[
        {
          quote:
            "Every course felt like a story — the wine pairings were impeccable and the service was invisible in the best way.",
          name: "Claire Dubois",
          role: "Food critic",
          company: "Le Monde Gastronomique",
        },
        {
          quote:
            "We celebrated our anniversary here and it exceeded every expectation. The chef's tasting menu is world-class.",
          name: "Marcus & Elena Webb",
          role: "Guests",
          company: "Anniversary dinner",
        },
        {
          quote:
            "The atmosphere, the fire, the seasonality — this is what fine dining should feel like in 2026.",
          name: "James Okonkwo",
          role: "Editor",
          company: "City Table Magazine",
        },
      ]}
    />
  );
}

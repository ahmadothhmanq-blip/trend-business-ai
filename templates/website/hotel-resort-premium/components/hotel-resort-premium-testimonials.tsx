"use client";

import { FlagshipTestimonialsSection } from "@/lib/website/template-v2/flagship/testimonials-section";
import { HOTEL_RESORT_FLAGSHIP_UI } from "@/lib/website/template-v2/flagship/themes";

export function HotelResortPremiumTestimonials() {
  return (
    <FlagshipTestimonialsSection
      ui={HOTEL_RESORT_FLAGSHIP_UI}
      componentId="hotel-resort-premium-testimonials"
      id="testimonials"
      eyebrow="Guest voices"
      title="A stay they remember"
      items={[
        {
          quote:
            "From the villa terrace to the spa pavilion, every detail felt composed — the service was invisible in the best way, and the ocean was always within reach.",
          name: "Claire Dubois",
          role: "Travel editor",
          company: "Condé Nast Traveler",
        },
        {
          quote:
            "We celebrated our anniversary at Azure Haven and it exceeded every expectation. The cliffside pavilion and private dining were extraordinary.",
          name: "Marcus & Elena Webb",
          role: "Guests",
          company: "Anniversary retreat",
        },
        {
          quote:
            "The stillness, the horizon, the rituals — this is what luxury hospitality should feel like in 2026.",
          name: "James Okonkwo",
          role: "Editor",
          company: "Travel + Leisure",
        },
      ]}
    />
  );
}

"use client";

import {
  FlagshipTestimonialsSection,
  type FlagshipTestimonial,
} from "@/lib/website/template-v2/flagship/testimonials-section";
import { ECOMMERCE_FLAGSHIP_UI } from "@/lib/website/template-v2/flagship/themes";

const DEFAULT_ITEMS: FlagshipTestimonial[] = [
  {
    quote:
      "Every piece feels considered — from the unboxing to the object itself. This is how luxury e-commerce should feel.",
    name: "Elena Vasquez",
    role: "Interior designer",
    company: "Studio Vasquez",
    rating: 5,
  },
  {
    quote:
      "I've built my entire home collection through Atelier. The provenance notes and maker stories make each purchase meaningful.",
    name: "James Okonkwo",
    role: "Collector",
    company: "London",
    rating: 5,
  },
  {
    quote:
      "The concierge team helped me source a one-of-a-kind ceramic piece for a client project. Impeccable service.",
    name: "Sophie Laurent",
    role: "Creative director",
    company: "Maison Laurent",
    rating: 5,
  },
];

type Props = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: FlagshipTestimonial[];
};

export function EcommercePremiumTestimonials({
  eyebrow = "Collector voices",
  title = "Loved by those who value craft",
  subtitle = "From interior designers to discerning collectors — hear from our community.",
  items = DEFAULT_ITEMS,
}: Props) {
  return (
    <FlagshipTestimonialsSection
      ui={ECOMMERCE_FLAGSHIP_UI}
      componentId="ecommerce-premium-testimonials"
      id="testimonials"
      eyebrow={eyebrow}
      title={title}
      subtitle={subtitle}
      items={items}
    />
  );
}

"use client";

import { FlagshipContactSection } from "@/lib/website/template-v2/flagship/contact-section";
import { ECOMMERCE_FLAGSHIP_UI } from "@/lib/website/template-v2/flagship/themes";

export function EcommercePremiumContact(
  props: Partial<{
    eyebrow: string;
    title: string;
    subtitle: string;
    email: string;
    phone: string;
    address: string;
    submitLabel: string;
  }> = {},
) {
  return (
    <FlagshipContactSection
      ui={ECOMMERCE_FLAGSHIP_UI}
      componentId="ecommerce-premium-contact"
      id="contact"
      eyebrow="Concierge"
      title="We're here to help"
      subtitle="Questions about an order, sourcing a specific piece, or curating a gift? Our concierge team responds within one business day."
      email="concierge@atelier-commerce.com"
      phone="+1 (888) 555-0192"
      address="14 Mercer Street, New York, NY"
      submitLabel="Send inquiry"
      {...props}
    />
  );
}

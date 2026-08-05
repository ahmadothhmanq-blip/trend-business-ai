"use client";

import { FlagshipContactSection } from "@/lib/website/template-v2/flagship/contact-section";
import { RESTAURANT_FLAGSHIP_UI } from "@/lib/website/template-v2/flagship/themes";

export function RestaurantPremiumContact() {
  return (
    <FlagshipContactSection
      ui={RESTAURANT_FLAGSHIP_UI}
      componentId="restaurant-premium-contact"
      id="contact"
      eyebrow="Visit us"
      title="Contact our team"
      subtitle="Private events, press inquiries, and general questions — we respond within 24 hours."
      email="reservations@ember-table.com"
      phone="+1 (212) 555-0188"
      address="48 West 10th Street, New York, NY"
      submitLabel="Send inquiry"
    />
  );
}

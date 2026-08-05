"use client";

import { FlagshipContactSection } from "@/lib/website/template-v2/flagship/contact-section";
import { HOTEL_RESORT_FLAGSHIP_UI } from "@/lib/website/template-v2/flagship/themes";

export function HotelResortPremiumContact() {
  return (
    <FlagshipContactSection
      ui={HOTEL_RESORT_FLAGSHIP_UI}
      componentId="hotel-resort-premium-contact"
      id="contact"
      eyebrow="Reach us"
      title="Contact our concierge"
      subtitle="Villa reservations, private events, and bespoke itineraries — we respond within 24 hours."
      email="concierge@azurehaven.com"
      phone="+1 (800) 555-0188"
      address="Azure Haven Private Reserve, Maldives"
      submitLabel="Send inquiry"
    />
  );
}

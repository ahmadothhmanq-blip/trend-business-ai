"use client";

import { FlagshipStatsSection } from "@/lib/website/template-v2/flagship/stats-section";
import { RESTAURANT_FLAGSHIP_UI } from "@/lib/website/template-v2/flagship/themes";

export function RestaurantPremiumStats() {
  return (
    <FlagshipStatsSection
      ui={RESTAURANT_FLAGSHIP_UI}
      componentId="restaurant-premium-stats"
      id="stats"
      eyebrow="Our legacy"
      title="Craft measured in seasons"
      stats={[
        { value: "18", label: "Years of excellence", detail: "Since opening" },
        { value: "2", label: "Michelin stars", detail: "Current season" },
        { value: "12", label: "Tables nightly", detail: "Intimate seating" },
        { value: "4.9", label: "Guest rating", detail: "2,400+ reviews" },
      ]}
    />
  );
}

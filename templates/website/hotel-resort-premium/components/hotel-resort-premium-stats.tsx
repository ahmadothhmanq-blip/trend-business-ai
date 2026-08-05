"use client";

import { FlagshipStatsSection } from "@/lib/website/template-v2/flagship/stats-section";
import { HOTEL_RESORT_FLAGSHIP_UI } from "@/lib/website/template-v2/flagship/themes";

export function HotelResortPremiumStats() {
  return (
    <FlagshipStatsSection
      ui={HOTEL_RESORT_FLAGSHIP_UI}
      componentId="hotel-resort-premium-stats"
      id="stats"
      eyebrow="Our legacy"
      title="Sanctuary measured in horizons"
      stats={[
        { value: "48", label: "Private villas", detail: "Ocean & cliffside" },
        { value: "5", label: "Forbes stars", detail: "Current season" },
        { value: "3", label: "Signature restaurants", detail: "Michelin-recognized" },
        { value: "4.9", label: "Guest rating", detail: "3,200+ reviews" },
      ]}
    />
  );
}

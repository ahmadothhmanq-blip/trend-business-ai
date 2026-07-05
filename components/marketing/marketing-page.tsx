"use client";

import { MouseProvider } from "@/components/marketing/motion/mouse-provider";
import { RefBackground } from "@/components/marketing/ref-background";
import { RefHeader } from "@/components/marketing/ref-header";
import { RefHero } from "@/components/marketing/ref-hero";
import { RefStatsRow } from "@/components/marketing/ref-stats-row";
import { RefServices } from "@/components/marketing/ref-services";
import { RefWorkflow } from "@/components/marketing/ref-workflow";
import { RefPricing } from "@/components/marketing/ref-pricing";
import { RefTrust } from "@/components/marketing/ref-trust";
import { RefFooter } from "@/components/marketing/ref-footer";

export function MarketingPage() {
  return (
    <MouseProvider>
      <div className="relative min-h-screen overflow-x-clip bg-[#050505] text-white">
        <RefBackground />
        <RefHeader />
        <main>
          <RefHero />
          <RefStatsRow />
          <RefServices />
          <RefWorkflow />
          <RefPricing />
          <RefTrust />
        </main>
        <RefFooter />
      </div>
    </MouseProvider>
  );
}

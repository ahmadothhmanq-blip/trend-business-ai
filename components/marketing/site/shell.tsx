"use client";

import { SiteBackground } from "@/components/marketing/site/background";
import { SiteHeader } from "@/components/marketing/site/header";
import { SiteFooter } from "@/components/marketing/site/footer";
import { ExitIntentPopup } from "@/components/marketing/growth/exit-intent-popup";
import { SmartCtaBar } from "@/components/marketing/growth/smart-cta-bar";

/** Shared chrome for every public marketing page. */
export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#050505] text-white">
      <SiteBackground />
      <SiteHeader />
      <main className="relative z-10">{children}</main>
      <SiteFooter />
      <ExitIntentPopup />
      <SmartCtaBar />
    </div>
  );
}

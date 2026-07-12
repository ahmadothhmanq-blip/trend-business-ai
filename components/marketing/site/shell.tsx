"use client";

import { MouseProvider } from "@/components/marketing/site/mouse";
import { SiteBackground } from "@/components/marketing/site/background";
import { SiteHeader } from "@/components/marketing/site/header";
import { SiteFooter } from "@/components/marketing/site/footer";

/** Shared chrome for every public marketing page. */
export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <MouseProvider>
      <div className="relative min-h-screen overflow-x-clip bg-[#050505] text-white">
        <SiteBackground />
        <SiteHeader />
        <main className="relative z-10">{children}</main>
        <SiteFooter />
      </div>
    </MouseProvider>
  );
}

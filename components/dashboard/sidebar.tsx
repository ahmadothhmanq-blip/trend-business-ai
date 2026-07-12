"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Sparkles } from "lucide-react";
import { useState } from "react";
import { DASHBOARD_NAV } from "@/lib/constants/dashboard-nav";
import { BrandLogo } from "@/components/ui/brand-logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function DashboardSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navContent = (
    <>
      <Link
        href="/"
        className="mb-5 flex items-center gap-3 rounded-2xl border border-premium-gold/15 bg-[linear-gradient(135deg,rgb(255_255_255/0.06),rgb(212_175_55/0.05))] p-3.5 shadow-[0_18px_60px_rgb(0_0_0/0.22)] transition-colors hover:border-premium-gold/30"
        onClick={() => setMobileOpen(false)}
      >
        <BrandLogo size="sm" />
        <div className="min-w-0">
          <span className="block text-sm font-bold text-white">
            Trend Business{" "}
            <span className="text-gradient-gold">AI</span>
          </span>
          <span className="flex items-center gap-1 text-[10px] text-white/35">
            <Sparkles className="size-2.5 text-premium-gold/70" />
            AI Workspace
          </span>
        </div>
      </Link>

      <div className="mb-3 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold tracking-[0.18em] text-white/35 uppercase">
            Workspace
          </span>
          <span className="rounded-full border border-premium-gold/20 bg-premium-gold/10 px-2 py-0.5 text-[10px] font-bold text-premium-gold-light">
            Pro
          </span>
        </div>
        <p className="mt-2 text-[12px] leading-relaxed text-white/45">
          Generate, organize, export and refine every AI business asset from one place.
        </p>
      </div>

      <nav className="flex flex-1 flex-col gap-1.5 overflow-y-auto pr-1" aria-label="Dashboard">
        {DASHBOARD_NAV.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200",
                isActive
                  ? "border border-premium-gold/30 bg-premium-gold/12 text-premium-gold-light shadow-gold-sm"
                  : "border border-transparent text-white/45 hover:border-white/[0.06] hover:bg-white/[0.04] hover:text-white/80",
              )}
            >
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-lg ring-1 transition-all duration-200",
                  isActive
                    ? "bg-premium-gold/20 ring-premium-gold/30"
                    : "bg-white/[0.03] ring-white/[0.06] group-hover:ring-premium-gold/15",
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block truncate">{item.label}</span>
                {item.description && (
                  <span className="block truncate text-[11px] font-normal text-white/30 group-hover:text-white/40">
                    {item.description}
                  </span>
                )}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 rounded-2xl border border-premium-gold/15 bg-premium-gold/[0.06] p-4 shadow-[0_18px_60px_rgb(212_175_55/0.06)]">
        <p className="text-[11px] font-semibold tracking-wide text-premium-gold-light uppercase">
          Pro tip
        </p>
        <p className="mt-1.5 text-[12px] leading-relaxed text-white/45">
          Save your best generations, revisit history and export assets when they are ready to ship.
        </p>
      </div>
    </>
  );

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="fixed left-4 top-4 z-50 border-white/10 bg-black/40 backdrop-blur-md lg:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="Open sidebar"
      >
        <Menu className="size-4" />
      </Button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "dashboard-sidebar fixed inset-y-0 left-0 z-50 flex w-[306px] flex-col border-r border-white/[0.08] p-5 transition-transform sm:p-6 lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-3 top-3 text-white/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Close sidebar"
        >
          <X className="size-4" />
        </Button>
        {navContent}
      </aside>
    </>
  );
}

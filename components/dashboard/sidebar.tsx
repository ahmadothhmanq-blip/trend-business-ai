"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronsLeft, ChevronsRight, Menu, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  DASHBOARD_AI_PRODUCTS_NAV,
  DASHBOARD_PRIMARY_NAV,
  DASHBOARD_SECONDARY_NAV,
  type DashboardNavItem,
} from "@/lib/constants/dashboard-nav";
import { useDashboardShell } from "@/components/dashboard/shell-context";
import { BrandLogo } from "@/components/ui/brand-logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function NavLink({
  item,
  collapsed,
  onNavigate,
}: {
  item: DashboardNavItem;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const isActive =
    item.href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(item.href);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      className={cn(
        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200",
        collapsed && "justify-center px-2",
        isActive
          ? "border border-premium-gold/30 bg-premium-gold/12 text-premium-gold-light shadow-gold-sm"
          : "border border-transparent text-white/50 hover:border-white/[0.06] hover:bg-white/[0.04] hover:text-white/85",
      )}
    >
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-lg ring-1 transition-all",
          isActive
            ? "bg-premium-gold/20 ring-premium-gold/30"
            : "bg-white/[0.03] ring-white/[0.06] group-hover:ring-premium-gold/15",
        )}
      >
        <Icon className="size-4" aria-hidden="true" />
      </span>
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const { collapsed, mobileOpen, setMobileOpen, toggleCollapsed } =
    useDashboardShell();
  const [aiOpen, setAiOpen] = useState(true);

  useEffect(() => {
    const inAi = DASHBOARD_AI_PRODUCTS_NAV.some((item) =>
      pathname.startsWith(item.href),
    );
    if (inAi) setAiOpen(true);
  }, [pathname]);

  const closeMobile = () => setMobileOpen(false);

  const navBody = (
    <>
      <div
        className={cn(
          "mb-5 flex items-center gap-3",
          collapsed ? "justify-center" : "justify-between",
        )}
      >
        <Link
          href="/dashboard"
          onClick={closeMobile}
          className={cn(
            "flex items-center gap-3 rounded-2xl border border-premium-gold/15 bg-[linear-gradient(135deg,rgb(255_255_255/0.06),rgb(212_175_55/0.05))] p-3 transition-colors hover:border-premium-gold/30",
            collapsed && "p-2.5",
          )}
        >
          <BrandLogo size="sm" />
          {!collapsed && (
            <div className="min-w-0">
              <span className="block text-sm font-bold text-white">
                Trend Business <span className="text-gradient-gold">AI</span>
              </span>
              <span className="flex items-center gap-1 text-[10px] text-white/35">
                <Sparkles className="size-2.5 text-premium-gold/70" />
                AI Workspace
              </span>
            </div>
          )}
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-5 overflow-y-auto pr-1" aria-label="Dashboard">
        <div className="space-y-1">
          {!collapsed && (
            <p className="mb-2 px-2 text-[10px] font-semibold tracking-[0.18em] text-white/30 uppercase">
              Workspace
            </p>
          )}
          {DASHBOARD_PRIMARY_NAV.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              collapsed={collapsed}
              onNavigate={closeMobile}
            />
          ))}
        </div>

        <div>
          {!collapsed ? (
            <button
              type="button"
              onClick={() => setAiOpen((v) => !v)}
              className="mb-2 flex w-full items-center justify-between px-2 text-[10px] font-semibold tracking-[0.18em] text-white/30 uppercase"
            >
              AI Products
              <ChevronDown
                className={cn(
                  "size-3.5 transition-transform",
                  aiOpen && "rotate-180",
                )}
              />
            </button>
          ) : (
            <div className="mb-2 flex justify-center">
              <Sparkles className="size-3.5 text-premium-gold/50" />
            </div>
          )}
          {(collapsed || aiOpen) && (
            <div className="space-y-1">
              {DASHBOARD_AI_PRODUCTS_NAV.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  collapsed={collapsed}
                  onNavigate={closeMobile}
                />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-1">
          {!collapsed && (
            <p className="mb-2 px-2 text-[10px] font-semibold tracking-[0.18em] text-white/30 uppercase">
              Library
            </p>
          )}
          {DASHBOARD_SECONDARY_NAV.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              collapsed={collapsed}
              onNavigate={closeMobile}
            />
          ))}
        </div>
      </nav>

      <div className="mt-4 hidden lg:block">
        <Button
          type="button"
          variant="ghost"
          onClick={toggleCollapsed}
          className={cn(
            "w-full justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] text-white/50 hover:border-premium-gold/25 hover:bg-premium-gold/10 hover:text-premium-gold-light",
            !collapsed && "justify-start px-3",
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronsRight className="size-4" />
          ) : (
            <>
              <ChevronsLeft className="size-4" />
              Collapse
            </>
          )}
        </Button>
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
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "dashboard-sidebar fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/[0.08] bg-[#050505]/95 p-4 backdrop-blur-xl transition-[width,transform] duration-300 sm:p-5 lg:static lg:translate-x-0",
          collapsed ? "lg:w-[88px]" : "lg:w-[280px]",
          "w-[280px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-3 top-3 text-white/50 lg:hidden"
          onClick={closeMobile}
          aria-label="Close sidebar"
        >
          <X className="size-4" />
        </Button>
        {navBody}
      </aside>
    </>
  );
}

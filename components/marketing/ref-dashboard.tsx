"use client";

import {
  BarChart3,
  Bot,
  FileText,
  Home,
  Layout,
  Lightbulb,
  LineChart,
  Search,
  Settings,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { GoldenSwirl } from "@/components/marketing/golden-swirl";

const SIDEBAR_ICONS = [Home, Lightbulb, LineChart, FileText, Layout, Bot, Settings];

function MiniBars() {
  return (
    <div className="mt-3 flex h-[72px] items-end gap-[3px]">
      {[32, 45, 38, 55, 48, 62, 58, 78, 70, 85].map((h, i) => (
        <div
          key={i}
          className="flex-1 rounded-[2px] bg-gradient-to-t from-[#D4AF37] to-[#D4AF37]/20"
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
}

function LandscapeThumb() {
  return (
    <div className="relative mt-2 aspect-[16/10] overflow-hidden rounded-[8px] bg-[#1a1a1a]">
      <div className="absolute inset-0 bg-gradient-to-b from-[#3d3520] via-[#2a2418] to-[#141414]" />
      <div className="absolute bottom-0 left-0 right-0 h-[45%] bg-gradient-to-t from-[#1a2820] to-transparent" />
      <div className="absolute bottom-[18%] left-[15%] h-[28%] w-[22%] rounded-t-full bg-[#2d4a35]/80" />
      <div className="absolute bottom-[22%] right-[20%] h-[35%] w-[18%] rounded-t-full bg-[#243d2e]/70" />
      <div className="absolute right-[18%] top-[15%] size-5 rounded-full bg-[#FFD700]/70 blur-[1px]" />
    </div>
  );
}

function Widget({
  title,
  icon: Icon,
  children,
  className,
}: {
  title: string;
  icon: typeof Bot;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-[12px] border border-[rgb(212_175_55/0.15)] bg-[#0a0a0a]/80 p-3", className)}>
      <div className="flex items-center gap-1.5">
        <Icon className="size-3 text-[#D4AF37]" aria-hidden="true" />
        <p className="text-[10px] font-medium text-[#B5B5B5]">{title}</p>
      </div>
      {children}
    </div>
  );
}

function AnalyticsWidget({ className }: { className?: string }) {
  return (
    <Widget title="Planning Activity" icon={BarChart3} className={className}>
      <p className="mt-2 text-xl font-bold text-white">4 Tools</p>
      <p className="text-[11px] font-semibold text-[#4ade80]">Ready for beta</p>
      <MiniBars />
    </Widget>
  );
}

function DashboardShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[16px] border border-[rgb(212_175_55/0.22)] bg-[rgb(17_17_17/0.72)] shadow-[0_24px_80px_rgb(0_0_0/0.55),inset_0_1px_0_rgb(255_255_255/0.04)] backdrop-blur-[20px]",
        className,
      )}
    >
      <div className="flex">
        <aside className="flex w-11 shrink-0 flex-col items-center gap-3.5 border-r border-[rgb(212_175_55/0.12)] py-4">
          {SIDEBAR_ICONS.map((Icon, i) => (
            <Icon
              key={i}
              className={cn("size-3.5", i === 1 ? "text-[#D4AF37]" : "text-[#B5B5B5]/50")}
              aria-hidden="true"
            />
          ))}
        </aside>
        <div className="min-w-0 flex-1 p-3.5">{children}</div>
      </div>
    </div>
  );
}

export function RefDashboard({ mobileOnlyAnalytics = false }: { mobileOnlyAnalytics?: boolean }) {
  const reduceMotion = useReducedMotion();

  if (mobileOnlyAnalytics) {
    return (
      <div className="relative mx-auto mt-8 w-full max-w-[340px] lg:hidden">
        <GoldenSwirl />
        <DashboardShell>
          <AnalyticsWidget />
        </DashboardShell>
      </div>
    );
  }

  return (
    <div className="relative hidden w-full lg:block">
      <GoldenSwirl />
      <motion.div
        animate={reduceMotion ? undefined : { y: [0, -6, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      >
        <DashboardShell>
          <div className="mb-3 flex items-center gap-2 rounded-[10px] border border-[rgb(212_175_55/0.12)] bg-[#0a0a0a]/60 px-3 py-2">
            <Search className="size-3 text-[#B5B5B5]/50" aria-hidden="true" />
            <span className="text-[10px] text-[#B5B5B5]/40">Search dashboard...</span>
          </div>

          <div className="grid grid-cols-12 gap-2.5">
            <AnalyticsWidget className="col-span-5 row-span-1" />

            <Widget title="AI Assistant" icon={Bot} className="col-span-4">
              <div className="mt-2.5 space-y-2">
                <p className="rounded-[8px] bg-white/[0.04] px-2.5 py-2 text-[9px] leading-relaxed text-white/75">
                  How can I help your business today?
                </p>
                <p className="ml-3 rounded-[8px] border border-[rgb(212_175_55/0.18)] bg-[#D4AF37]/10 px-2 py-1.5 text-[9px] text-[#D4AF37]">
                  Generate market analysis
                </p>
              </div>
            </Widget>

            <Widget title="Website Blueprint" icon={Layout} className="col-span-3">
              <LandscapeThumb />
              <div className="mt-2">
                <div className="flex justify-between text-[9px] text-[#B5B5B5]">
                  <span>Planning...</span>
                  <span className="font-medium text-[#D4AF37]">71%</span>
                </div>
                <div className="mt-1.5 h-[3px] overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[71%] rounded-full bg-[#D4AF37]" />
                </div>
              </div>
            </Widget>

            <Widget title="Business Ideas" icon={Lightbulb} className="col-span-4">
              <p className="mt-1.5 text-[10px] text-[#B5B5B5]">Generated Concepts</p>
              <p className="text-base font-bold text-[#4ade80]">12 saved</p>
              <svg viewBox="0 0 100 28" className="mt-1.5 h-7 w-full" aria-hidden="true">
                <path
                  d="M0 22 L12 18 L24 20 L36 14 L48 16 L60 10 L72 12 L84 6 L100 8"
                  fill="none"
                  stroke="#D4AF37"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </Widget>

            <Widget title="Market Analysis" icon={LineChart} className="col-span-4">
              <div className="mt-2 flex items-center gap-3">
                <div className="relative size-[52px]">
                  <svg viewBox="0 0 36 36" className="size-full -rotate-90">
                    <circle cx="18" cy="18" r="14" fill="none" stroke="rgb(255 255 255 / 0.08)" strokeWidth="3.5" />
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#D4AF37" strokeWidth="3.5" strokeDasharray="56 88" strokeLinecap="round" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">65%</span>
                </div>
                <div>
                  <p className="text-base font-bold text-white">High</p>
                  <p className="text-[9px] text-[#B5B5B5]">Opportunity fit</p>
                </div>
              </div>
            </Widget>

            <Widget title="AI Reports" icon={FileText} className="col-span-4">
              <div className="mt-2.5 flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <div
                    key={n}
                    className="h-9 flex-1 rounded-[4px] bg-gradient-to-b from-[#D4AF37]/35 to-[#141414]"
                  />
                ))}
              </div>
              <div className="relative mt-2.5 h-[3px] rounded-full bg-white/10">
                <div className="absolute left-0 top-0 h-full w-[45%] rounded-full bg-[#D4AF37]" />
                <div className="absolute left-[45%] top-1/2 size-2 -translate-y-1/2 rounded-full bg-[#FFD700]" />
              </div>
            </Widget>
          </div>
        </DashboardShell>
      </motion.div>
    </div>
  );
}

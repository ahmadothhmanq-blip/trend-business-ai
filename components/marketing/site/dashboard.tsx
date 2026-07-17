"use client";

import { useId } from "react";
import {
  BarChart3,
  Bot,
  Clapperboard,
  Home,
  Layout,
  LineChart,
  Search,
  Settings,
  Users,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { SiteOrbit } from "@/components/marketing/site/orbit";

const SIDEBAR = [Home, Layout, LineChart, Users, Clapperboard, Bot, Settings];

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
    <div
      className={cn(
        "rounded-[12px] border border-[rgba(212,175,55,0.18)] bg-[rgba(10,10,10,0.9)] p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-sm sm:p-3",
        className,
      )}
    >
      <div className="flex items-center gap-1.5">
        <Icon className="size-3 text-[#D4AF37]" />
        <p className="text-[10px] font-medium text-[#9A9A9A]">{title}</p>
      </div>
      {children}
    </div>
  );
}

function Analytics({ className }: { className?: string }) {
  const fill = `af-${useId().replace(/:/g, "")}`;
  return (
    <Widget title="Analytics" icon={BarChart3} className={className}>
      <p className="mt-2 text-[10px] text-[#7A7A7A]">Total Revenue</p>
      <div className="mt-0.5 flex items-end gap-2">
        <p className="text-[20px] font-bold leading-none tracking-tight text-white sm:text-[22px]">
          $2.8M
        </p>
        <p className="pb-0.5 text-[10px] font-semibold text-[#4ade80]">+24.5%</p>
      </div>
      <div className="mt-2.5 flex h-[48px] items-end gap-[3px] sm:h-[52px]">
        {[32, 48, 40, 62, 55, 78, 70, 88, 76, 95, 82, 100].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-[2px] bg-gradient-to-t from-[#D4AF37]/30 to-[#FFD700]"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      <svg viewBox="0 0 160 28" className="mt-1 h-6 w-full sm:h-7" aria-hidden="true">
        <defs>
          <linearGradient id={fill} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFD700" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0 22 L20 18 L40 20 L60 12 L80 14 L100 8 L120 10 L140 4 L160 6 V28 H0 Z"
          fill={`url(#${fill})`}
        />
        <path
          d="M0 22 L20 18 L40 20 L60 12 L80 14 L100 8 L120 10 L140 4 L160 6"
          fill="none"
          stroke="#FFD700"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </Widget>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative z-10 overflow-hidden rounded-[18px] border border-[rgba(212,175,55,0.3)] bg-[rgba(17,17,17,0.92)] shadow-[0_32px_100px_rgba(0,0,0,0.7),0_0_60px_rgba(212,175,55,0.2),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-2xl">
      <div className="flex">
        <aside className="flex w-10 shrink-0 flex-col items-center gap-3 border-r border-[rgba(212,175,55,0.12)] bg-black/55 py-3.5 sm:w-11 sm:gap-3.5 sm:py-4">
          <div className="mb-0.5 size-5 rounded-md bg-[linear-gradient(135deg,#FFD700,#D4AF37)] sm:size-6" />
          {SIDEBAR.map((Icon, i) => (
            <Icon
              key={i}
              className={cn("size-3.5", i === 0 ? "text-[#D4AF37]" : "text-[#5A5A5A]")}
            />
          ))}
        </aside>
        <div className="min-w-0 flex-1 p-3 sm:p-3.5">{children}</div>
      </div>
    </div>
  );
}

function Grid() {
  return (
    <>
      <div className="mb-2.5 flex items-center gap-2 rounded-[10px] border border-[rgba(212,175,55,0.12)] bg-black/50 px-2.5 py-2 sm:mb-3 sm:px-3 sm:py-2.5">
        <Search className="size-3 text-[#5A5A5A]" />
        <span className="text-[10px] text-[#4A4A4A]">Search dashboard...</span>
        <span className="ml-auto rounded-md bg-[rgba(212,175,55,0.12)] px-1.5 py-0.5 text-[9px] font-medium text-[#D4AF37]">
          Workspace
        </span>
      </div>
      <div className="grid grid-cols-12 gap-2 sm:gap-2.5">
        <Analytics className="col-span-5" />
        <Widget title="AI Assistant" icon={Bot} className="col-span-4">
          <div className="mt-2 space-y-1.5 sm:mt-2.5 sm:space-y-2">
            <p className="rounded-lg bg-white/[0.04] px-2 py-1.5 text-[9px] leading-relaxed text-white/80 sm:px-2.5 sm:py-2">
              How can I help your business today?
            </p>
            <p className="ml-1.5 rounded-lg border border-[rgba(212,175,55,0.28)] bg-[rgba(212,175,55,0.12)] px-2 py-1.5 text-[9px] text-[#F1C44D]">
              Generate market analysis
            </p>
          </div>
        </Widget>
        <Widget title="Website Builder" icon={Layout} className="col-span-3">
          <div className="relative mt-2 aspect-[16/10] overflow-hidden rounded-md border border-white/5 bg-[#1a1a1a]">
            <div className="absolute inset-0 bg-gradient-to-b from-[#4a3f20] via-[#2a2418] to-[#141414]" />
            <div className="absolute bottom-0 h-[48%] w-full bg-gradient-to-t from-[#1a2820] to-transparent" />
            <div className="absolute bottom-[16%] left-[12%] h-[30%] w-[24%] rounded-t-full bg-[#2d4a35]/85" />
            <div className="absolute right-[16%] top-[12%] size-4 rounded-full bg-[#FFD700]/75 blur-[1px] sm:size-5" />
          </div>
          <div className="mt-1.5 flex justify-between text-[9px] text-[#7A7A7A] sm:mt-2">
            <span>Generating...</span>
            <span className="font-semibold text-[#D4AF37]">78%</span>
          </div>
          <div className="mt-1 h-[3px] overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-[#D4AF37] to-[#FFD700]" />
          </div>
        </Widget>
        <Widget title="Marketing" icon={LineChart} className="col-span-4">
          <p className="mt-1.5 text-[10px] text-[#7A7A7A]">Campaign Reach</p>
          <p className="text-[16px] font-bold text-white sm:text-[17px]">1.2M</p>
          <div className="mt-2 flex h-9 items-end gap-1 sm:h-10">
            {[35, 48, 40, 62, 55, 78, 68, 88, 74].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-[2px] bg-gradient-to-t from-[#D4AF37]/35 to-[#FFD700]"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </Widget>
        <Widget title="CRM Pipeline" icon={Users} className="col-span-4">
          <div className="mt-2 flex items-center gap-2.5 sm:gap-3">
            <div className="relative size-[48px] sm:size-[54px]">
              <svg viewBox="0 0 36 36" className="size-full -rotate-90">
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="3.5"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="#D4AF37"
                  strokeWidth="3.5"
                  strokeDasharray="70 88"
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">
                74%
              </span>
            </div>
            <div>
              <p className="text-[16px] font-bold text-white sm:text-[17px]">$1.2M</p>
              <p className="text-[9px] text-[#7A7A7A]">Pipeline value</p>
            </div>
          </div>
        </Widget>
        <Widget title="Video Studio" icon={Clapperboard} className="col-span-4">
          <div className="mt-2 flex gap-1 sm:mt-2.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <div
                key={n}
                className="h-8 flex-1 rounded-[3px] bg-gradient-to-b from-[#D4AF37]/45 to-[#141414] sm:h-9 sm:rounded-[4px]"
              />
            ))}
          </div>
          <div className="relative mt-2 h-[3px] rounded-full bg-white/10 sm:mt-2.5">
            <div className="absolute left-0 top-0 h-full w-[62%] rounded-full bg-gradient-to-r from-[#D4AF37] to-[#FFD700]" />
            <div className="absolute left-[62%] top-1/2 size-2 -translate-y-1/2 rounded-full bg-[#FFD700] shadow-[0_0_8px_#FFD700] sm:size-2.5" />
          </div>
          <p className="mt-1.5 text-[9px] text-[#7A7A7A]">Rendering clip 3 of 5</p>
        </Widget>
      </div>
    </>
  );
}

export function SiteDashboard({ mobile = false }: { mobile?: boolean }) {
  const reduce = useReducedMotion();

  return (
    <div
      className={cn(
        "relative mx-auto w-full",
        mobile ? "max-w-[340px]" : "max-w-[520px] xl:max-w-[560px]",
      )}
      style={{ perspective: mobile ? undefined : "1400px" }}
    >
      <SiteOrbit />
      <div
        className="relative z-10"
        style={
          mobile
            ? undefined
            : {
                transformStyle: "preserve-3d",
                transform: "rotateY(-8deg) rotateX(4deg)",
              }
        }
      >
        <motion.div
          animate={reduce ? undefined : { y: [0, -8, 0] }}
          transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Shell>{mobile ? <Analytics /> : <Grid />}</Shell>
        </motion.div>
      </div>
    </div>
  );
}

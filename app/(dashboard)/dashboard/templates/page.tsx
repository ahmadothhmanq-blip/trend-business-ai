import type { Metadata } from "next";
import Link from "next/link";
import { LayoutTemplate } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardPanel } from "@/components/dashboard/ui/dashboard-card";
import { DASHBOARD_QUICK_ACTIONS } from "@/lib/constants/dashboard-nav";

export const metadata: Metadata = { title: "Templates" };

const TEMPLATES = [
  {
    title: "Luxury Landing Launch",
    description: "Hero, proof, offer and CTA structure for premium launches.",
    href: "/dashboard/landing-page-builder",
    tag: "Create",
  },
  {
    title: "Brand Identity System",
    description: "Logo direction, palette and typography starters.",
    href: "/dashboard/brand-studio",
    tag: "Design",
  },
  {
    title: "30-Day Content Calendar",
    description: "Hooks, captions and channel plans for growth.",
    href: "/dashboard/content-studio",
    tag: "Content",
  },
  {
    title: "Full-Funnel Campaign",
    description: "Angles, audiences and conversion-focused ads.",
    href: "/dashboard/marketing",
    tag: "Business",
  },
] as const;

export default async function TemplatesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const metadata = user?.user_metadata ?? {};

  return (
    <>
      <DashboardHeader
        title="Templates"
        description="Premium starter kits for faster AI generation"
        userEmail={user?.email}
        userName={metadata.full_name as string | undefined}
      />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-premium-gold/10 ring-1 ring-premium-gold/20">
            <LayoutTemplate className="size-5 text-premium-gold" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Starter templates</h2>
            <p className="text-[13px] text-white/40">
              Open a product with a recommended workflow preset.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {TEMPLATES.map((template) => (
            <Link key={template.title} href={template.href}>
              <DashboardPanel className="h-full p-5 transition-all hover:border-premium-gold/35">
                <span className="rounded-full border border-premium-gold/25 bg-premium-gold/10 px-2.5 py-1 text-[10px] font-semibold text-premium-gold">
                  {template.tag}
                </span>
                <h3 className="mt-4 text-lg font-bold text-white">{template.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-white/45">
                  {template.description}
                </p>
              </DashboardPanel>
            </Link>
          ))}
        </div>

        <div className="mt-10">
          <h3 className="mb-4 text-base font-bold text-white">Quick starts</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {DASHBOARD_QUICK_ACTIONS.slice(0, 4).map((action) => (
              <Link
                key={action.title}
                href={action.href}
                className="rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-3 text-[13px] font-medium text-white/70 hover:border-premium-gold/30 hover:text-premium-gold-light"
              >
                {action.title}
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}

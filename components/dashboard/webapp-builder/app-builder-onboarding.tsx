"use client";

import {
  CalendarCheck,
  HeartPulse,
  Landmark,
  ShoppingCart,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useProductT } from "@/lib/i18n/use-scoped-t";
import {
  DashboardCard,
  DashboardCardContent,
  DashboardCardDescription,
  DashboardCardHeader,
  DashboardCardTitle,
} from "@/components/dashboard/ui/dashboard-card";

export type OnboardingVerticalId =
  | "crm"
  | "booking"
  | "ecommerce"
  | "healthcare"
  | "finance";

const VERTICALS: Array<{
  id: OnboardingVerticalId;
  icon: LucideIcon;
  templateId: string;
}> = [
  { id: "crm", icon: Users, templateId: "crm" },
  { id: "booking", icon: CalendarCheck, templateId: "booking" },
  { id: "ecommerce", icon: ShoppingCart, templateId: "ecommerce" },
  { id: "healthcare", icon: HeartPulse, templateId: "healthcare" },
  { id: "finance", icon: Landmark, templateId: "finance" },
];

type AppBuilderOnboardingProps = {
  selectedVertical?: OnboardingVerticalId | "";
  onPickVertical: (vertical: OnboardingVerticalId, templateId: string) => void;
};

export function AppBuilderOnboarding({
  selectedVertical,
  onPickVertical,
}: AppBuilderOnboardingProps) {
  const p = useProductT("webappBuilder");
  const steps = [
    p("onboarding.stepPick"),
    p("onboarding.stepChat"),
    p("onboarding.stepPreview"),
    p("onboarding.stepZip"),
  ];

  return (
    <DashboardCard className="border-premium-gold/20 bg-gradient-to-br from-premium-gold/10 via-transparent to-transparent">
      <DashboardCardHeader>
        <DashboardCardTitle>{p("onboarding.title")}</DashboardCardTitle>
        <DashboardCardDescription>{p("onboarding.subtitle")}</DashboardCardDescription>
      </DashboardCardHeader>
      <DashboardCardContent className="space-y-4">
        <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((label, index) => (
            <li
              key={label}
              className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/70"
            >
              <span className="me-2 font-semibold text-premium-gold-light">
                {index + 1}.
              </span>
              {label}
            </li>
          ))}
        </ol>

        <div>
          <p className="mb-2 text-xs font-medium tracking-wide text-white/50 uppercase">
            {p("onboarding.pickVertical")}
          </p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {VERTICALS.map(({ id, icon: Icon, templateId }) => {
              const active = selectedVertical === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onPickVertical(id, templateId)}
                  className={cn(
                    "rounded-xl border px-3 py-3 text-start transition",
                    active
                      ? "border-premium-gold/50 bg-premium-gold/15 ring-1 ring-premium-gold/30"
                      : "border-white/10 bg-white/[0.02] hover:border-premium-gold/30",
                  )}
                >
                  <Icon
                    className={cn(
                      "mb-2 size-5",
                      active ? "text-premium-gold-light" : "text-premium-gold",
                    )}
                    aria-hidden
                  />
                  <p className="text-sm font-semibold text-white">
                    {p(`onboarding.verticals.${id}.label`)}
                  </p>
                  <p className="mt-1 text-[11px] leading-snug text-white/50">
                    {p(`onboarding.verticals.${id}.hint`)}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </DashboardCardContent>
    </DashboardCard>
  );
}

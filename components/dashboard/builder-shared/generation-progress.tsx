"use client";

import { Check, Loader2 } from "lucide-react";
import { DashboardPanel } from "@/components/dashboard/ui/dashboard-card";
import { CoreProgressStepper } from "@/components/dashboard/one-prompt/core-progress-stepper";
import { useCoreProgress } from "@/components/dashboard/one-prompt/use-core-progress";

export function GenerationProgress({
  title,
  subtitle,
  events,
  active = true,
}: {
  title: string;
  subtitle: string;
  events: string[];
  /** When false, stepper shows Ready Product */
  active?: boolean;
}) {
  const currentStep = useCoreProgress({ events, active, complete: !active });

  return (
    <DashboardPanel className="py-8 text-center sm:py-10">
      <Loader2 className="mx-auto size-10 animate-spin text-premium-gold/60" />
      <p className="mt-4 text-lg font-bold text-white">{title}</p>
      <p className="mt-1 text-sm text-white/45">{subtitle}</p>

      <div className="mx-auto mt-8 max-w-4xl px-2 text-left">
        <CoreProgressStepper currentStep={currentStep} compact />
      </div>

      {events.length > 0 && (
        <div className="mx-auto mt-6 max-w-md space-y-1 text-left">
          {events.map((e, i) => (
            <div key={`${i}-${e.slice(0, 24)}`} className="flex items-center gap-2 text-xs">
              {i === events.length - 1 ? (
                <Loader2 className="size-3 animate-spin text-premium-gold-light" />
              ) : (
                <Check className="size-3 text-emerald-400" />
              )}
              <span
                className={
                  i === events.length - 1
                    ? "text-premium-gold-light"
                    : "text-white/40"
                }
              >
                {e}
              </span>
            </div>
          ))}
        </div>
      )}
    </DashboardPanel>
  );
}

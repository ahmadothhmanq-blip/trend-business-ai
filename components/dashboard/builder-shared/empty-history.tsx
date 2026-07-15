"use client";

import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardPanel } from "@/components/dashboard/ui/dashboard-card";

export function EmptyHistory({
  noun,
  onNew,
}: {
  noun: string;
  onNew: () => void;
}) {
  return (
    <DashboardPanel className="border-dashed py-16 text-center">
      <Sparkles className="mx-auto size-10 text-premium-gold/40" />
      <p className="mt-4 text-lg font-bold text-white">No {noun} yet</p>
      <p className="mt-1 text-sm text-white/45">Create your first {noun.replace(/s$/, "")} to see it here</p>
      <Button onClick={onNew} className="btn-gold mt-5 gap-2 rounded-xl font-bold text-luxury-black">
        <Sparkles className="size-4" />
        New {noun.replace(/s$/, "").replace(/^\w/, (c) => c.toUpperCase())}
      </Button>
    </DashboardPanel>
  );
}

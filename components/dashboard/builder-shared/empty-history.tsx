"use client";

import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardPanel } from "@/components/dashboard/ui/dashboard-card";
import { useTranslation } from "@/lib/i18n/client";

export function EmptyHistory({
  noun,
  item,
  onNew,
}: {
  noun: string;
  item?: string;
  onNew: () => void;
}) {
  const { t } = useTranslation();
  const singular = item ?? noun.replace(/s$/, "");

  return (
    <DashboardPanel className="border-dashed py-16 text-center">
      <Sparkles className="mx-auto size-10 text-premium-gold/40" />
      <p className="mt-4 text-lg font-bold text-white">
        {t("products.common.emptyHistory.title", { noun })}
      </p>
      <p className="mt-1 text-sm text-white/45">
        {t("products.common.emptyHistory.description", { item: singular })}
      </p>
      <Button onClick={onNew} className="btn-gold mt-5 gap-2 rounded-xl font-bold text-luxury-black">
        <Sparkles className="size-4" />
        {t("products.common.emptyHistory.new", {
          item: singular.charAt(0).toUpperCase() + singular.slice(1),
        })}
      </Button>
    </DashboardPanel>
  );
}

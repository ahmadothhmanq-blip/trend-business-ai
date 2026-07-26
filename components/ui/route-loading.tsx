"use client";

import { useTranslation } from "@/lib/i18n/client";

export function RouteLoading() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-[40vh] items-center justify-center bg-[#050505]" aria-busy="true">
      <div className="size-8 animate-pulse rounded-full border-2 border-[#D4AF37]/30 border-t-[#D4AF37]" />
      <span className="sr-only">{t("common.loading")}</span>
    </div>
  );
}

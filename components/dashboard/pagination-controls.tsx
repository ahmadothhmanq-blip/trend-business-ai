"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/client";

type PaginationControlsProps = {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
};

export function PaginationControls({
  page,
  totalPages,
  total,
  onPageChange,
}: PaginationControlsProps) {
  const { t } = useTranslation();

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/[0.08] glass-panel px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-[13px] text-white/45 sm:text-sm">
        {t("dashboard.pagination.pageOf", { page, totalPages })}{" "}
        <span className="text-white/30"> · </span>
        {t("dashboard.pagination.total", { total })}
      </p>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="btn-ghost-gold rounded-xl"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="size-4" />
          {t("dashboard.pagination.previous")}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="btn-ghost-gold rounded-xl"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          {t("dashboard.pagination.next")}
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

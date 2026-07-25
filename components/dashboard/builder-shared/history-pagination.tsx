"use client";

import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/client";

export function HistoryPagination({
  page,
  total,
  pageSize = 12,
  onPageChange,
}: {
  page: number;
  total: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
}) {
  const { t } = useTranslation();

  if (total <= pageSize) return null;

  return (
    <div className="flex justify-center gap-2 pt-4">
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="rounded-lg border-white/10 text-white/60"
      >
        {t("dashboard.pagination.previous")}
      </Button>
      <span className="flex items-center px-3 text-xs text-white/40">
        {t("dashboard.pagination.pageOf", {
          page,
          totalPages: Math.max(1, Math.ceil(total / pageSize)),
        })}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={page * pageSize >= total}
        onClick={() => onPageChange(page + 1)}
        className="rounded-lg border-white/10 text-white/60"
      >
        {t("dashboard.pagination.next")}
      </Button>
    </div>
  );
}

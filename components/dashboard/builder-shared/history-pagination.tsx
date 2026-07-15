"use client";

import { Button } from "@/components/ui/button";

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
        Previous
      </Button>
      <span className="flex items-center px-3 text-xs text-white/40">Page {page}</span>
      <Button
        variant="outline"
        size="sm"
        disabled={page * pageSize >= total}
        onClick={() => onPageChange(page + 1)}
        className="rounded-lg border-white/10 text-white/60"
      >
        Next
      </Button>
    </div>
  );
}

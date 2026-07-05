"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  dashboardFilterSelectClass,
  dashboardInputClass,
} from "@/components/dashboard/ui/dashboard-styles";

type ListFiltersProps = {
  search: string;
  favoriteFilter: "" | "true" | "false";
  extraFilter?: string;
  extraLabel?: string;
  extraOptions?: string[];
  onApply: (search: string, favorite: "" | "true" | "false", extra?: string) => void;
};

export function ListFilters({
  search,
  favoriteFilter,
  extraFilter = "",
  extraLabel,
  extraOptions = [],
  onApply,
}: ListFiltersProps) {
  return (
    <div className="rounded-2xl border border-white/[0.08] glass-panel p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative min-w-[200px] flex-1">
          <Search
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/35"
            aria-hidden="true"
          />
          <Input
            defaultValue={search}
            placeholder="Search..."
            className={`pl-9 ${dashboardInputClass}`}
            aria-label="Search"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onApply(
                  (e.target as HTMLInputElement).value,
                  favoriteFilter,
                  extraFilter,
                );
              }
            }}
          />
        </div>
        <select
          value={favoriteFilter}
          onChange={(e) =>
            onApply(search, e.target.value as "" | "true" | "false", extraFilter)
          }
          className={dashboardFilterSelectClass}
          aria-label="Filter favorites"
        >
          <option value="">All items</option>
          <option value="true">Favorites only</option>
          <option value="false">Non-favorites</option>
        </select>
        {extraLabel && extraOptions.length > 0 && (
          <select
            value={extraFilter}
            onChange={(e) => onApply(search, favoriteFilter, e.target.value)}
            className={dashboardFilterSelectClass}
            aria-label={extraLabel}
          >
            <option value="">All {extraLabel.toLowerCase()}</option>
            {extraOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}

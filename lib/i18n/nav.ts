import type { DashboardNavItem } from "@/lib/constants/dashboard-nav";

export function getNavLabel(
  t: (key: string) => string,
  item: DashboardNavItem,
): string {
  return t(item.labelKey);
}

export function getNavDescription(
  t: (key: string) => string,
  item: DashboardNavItem,
): string | undefined {
  if (!item.descriptionKey) return item.description;
  return t(item.descriptionKey);
}

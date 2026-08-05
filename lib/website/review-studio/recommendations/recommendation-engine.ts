import type { ReviewPriority } from "@/lib/website/review-studio/types";
import { REVIEW_PRIORITIES } from "@/lib/website/review-studio/constants";

const PRIORITY_RANK: Record<ReviewPriority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
  "nice-to-have": 4,
};

/**
 * Categorize recommendations: Critical, High, Medium, Low, Nice to Have.
 */
export function categorizePriority(priorities: ReviewPriority[]): ReviewPriority {
  if (priorities.length === 0) return "medium";
  return priorities.reduce((worst, p) =>
    PRIORITY_RANK[p] < PRIORITY_RANK[worst] ? p : worst,
  );
}

export function groupByPriority<T extends { priority: ReviewPriority }>(
  items: T[],
): Record<ReviewPriority, T[]> {
  const groups = Object.fromEntries(
    REVIEW_PRIORITIES.map((p) => [p, [] as T[]]),
  ) as Record<ReviewPriority, T[]>;

  for (const item of items) {
    groups[item.priority].push(item);
  }
  return groups;
}

export function formatPriorityLabel(priority: ReviewPriority): string {
  const labels: Record<ReviewPriority, string> = {
    critical: "Critical",
    high: "High",
    medium: "Medium",
    low: "Low",
    "nice-to-have": "Nice to Have",
  };
  return labels[priority];
}

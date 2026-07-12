"use client";

import { RouteError } from "@/components/system/route-error";

type DashboardErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function DashboardErrorPage({
  error,
  reset,
}: DashboardErrorPageProps) {
  return (
    <RouteError
      error={error}
      reset={reset}
      variant="dashboard"
      title="Dashboard unavailable"
      description="We couldn't load this dashboard page. Try again or return to your overview."
    />
  );
}

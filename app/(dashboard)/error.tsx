"use client";

import { RouteError } from "@/components/system/route-error";
import { useTranslation } from "@/lib/i18n/client";

type DashboardErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function DashboardErrorPage({
  error,
  reset,
}: DashboardErrorPageProps) {
  const { t } = useTranslation();

  return (
    <RouteError
      error={error}
      reset={reset}
      variant="dashboard"
      title={t("dashboard.errors.dashboardUnavailable")}
      description={t("dashboard.errors.dashboardDescription")}
    />
  );
}

"use client";

import { DashboardHeader } from "@/components/dashboard/header";
import {
  DASHBOARD_PAGE_META,
  type DashboardPageId,
} from "@/lib/i18n/dashboard-pages";
import { useTranslation } from "@/lib/i18n/client";

type LocalizedDashboardHeaderProps = {
  pageId: DashboardPageId;
  title?: string;
  description?: string;
  userEmail?: string;
  userName?: string;
  avatarUrl?: string | null;
};

export function LocalizedDashboardHeader({
  pageId,
  title,
  description,
  ...userProps
}: LocalizedDashboardHeaderProps) {
  const { t } = useTranslation();
  const meta = DASHBOARD_PAGE_META[pageId];

  return (
    <DashboardHeader
      title={title ?? t(meta.titleKey)}
      description={description ?? t(meta.descriptionKey)}
      {...userProps}
    />
  );
}

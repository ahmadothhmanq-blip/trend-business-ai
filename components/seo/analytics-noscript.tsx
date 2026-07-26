"use client";

import { useTranslation } from "@/lib/i18n/client";
import { getAnalyticsConfig } from "@/lib/seo/analytics";

export function AnalyticsNoscript() {
  const { t } = useTranslation();
  const { gtmId } = getAnalyticsConfig();
  if (!gtmId) return null;

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
        title={t("marketing.seo.gtmFrameTitle")}
      />
    </noscript>
  );
}

"use client";

import { useTranslation } from "@/lib/i18n/client";

export function LoginStatusMessages({
  message,
  error,
}: {
  message?: string;
  error?: string;
}) {
  const { t } = useTranslation();

  return (
    <>
      {message === "confirm-email" && (
        <p className="mt-4 text-sm text-emerald-400" role="status">
          {t("auth.confirmEmail")}
        </p>
      )}

      {error && (
        <p className="mt-4 text-sm text-red-400" role="alert">
          {t("auth.authFailed")}
        </p>
      )}
    </>
  );
}

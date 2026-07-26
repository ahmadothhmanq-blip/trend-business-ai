"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { AppToaster } from "@/components/providers/app-toaster";
import { AnalyticsNoscript, AnalyticsScripts } from "@/components/seo/analytics-scripts";
import { I18nProvider } from "@/lib/i18n/client";
import type { SupportedLocale } from "@/lib/i18n/config";
import type { TranslationMessages } from "@/lib/i18n/messages";

type AppProvidersProps = {
  locale: SupportedLocale;
  messages: TranslationMessages;
  children: ReactNode;
};

/** Client provider stack — I18nProvider must wrap all useI18n consumers. */
export function AppProviders({ locale, messages, children }: AppProvidersProps) {
  return (
    <I18nProvider locale={locale} messages={messages}>
      <AnalyticsNoscript />
      <ThemeProvider defaultTheme="dark" enableSystem disableTransitionOnChange>
        {children}
        <AppToaster />
      </ThemeProvider>
      <AnalyticsScripts />
    </I18nProvider>
  );
}

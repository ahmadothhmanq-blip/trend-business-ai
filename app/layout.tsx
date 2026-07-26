import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import { AppProviders } from "@/components/providers/app-providers";
import { CoreWebVitalsHints } from "@/components/seo/core-web-vitals-hints";
import { rootMetadata } from "@/lib/seo/metadata";
import { THEME_COOKIE, resolveServerThemeClass } from "@/lib/theme/theme";
import { getLocaleDefinition } from "@/lib/i18n/config";
import { getServerLocale, getServerMessages, getServerTranslator } from "@/lib/i18n/server";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
  adjustFontFallback: true,
});

export const metadata: Metadata = rootMetadata();

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const themeClass = resolveServerThemeClass(
    cookieStore.get(THEME_COOKIE)?.value,
  );
  const locale = await getServerLocale();
  const messages = await getServerMessages(locale);
  const { t } = await getServerTranslator(locale);
  const { htmlLang, dir } = getLocaleDefinition(locale);

  return (
    <html
      lang={htmlLang}
      dir={dir}
      className={`${geistSans.variable} ${geistMono.variable} ${themeClass} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <CoreWebVitalsHints />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AppProviders locale={locale} messages={messages}>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-premium-gold focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-luxury-black"
          >
            {t("common.skipToContent")}
          </a>
          <div id="main-content">{children}</div>
        </AppProviders>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { AppToaster } from "@/components/providers/app-toaster";
import { AnalyticsNoscript, AnalyticsScripts } from "@/components/seo/analytics-scripts";
import { rootMetadata } from "@/lib/seo/metadata";
import { DEFAULT_LOCALE } from "@/lib/seo/site";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang={DEFAULT_LOCALE}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AnalyticsNoscript />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-premium-gold focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-luxury-black"
          >
            Skip to content
          </a>
          <div id="main-content">{children}</div>
          <AppToaster />
        </ThemeProvider>
        <AnalyticsScripts />
      </body>
    </html>
  );
}

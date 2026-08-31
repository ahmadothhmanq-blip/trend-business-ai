/**
 * Next.js 16 root layout, fonts, and Tailwind v4 theme (Phase 5).
 */

import type { ReactProjectFile, ReactSiteContent } from "@/lib/ai-core/website-builder/react-renderer/contracts";

function fontImport(family: string): string {
  const safe = /^[A-Za-z]+$/.test(family) ? family : "Inter";
  return safe;
}

export function reactLayoutFiles(content: ReactSiteContent): ReactProjectFile[] {
  const sans = fontImport(content.theme.fonts.sans.replace(/\s+/g, ""));
  const display = fontImport(content.theme.fonts.display.replace(/\s+/g, ""));
  const radius = content.theme.radiusPx;
  const dark = content.theme.colors;
  return [
    {
      path: "app/globals.css",
      language: "css",
      contents: `@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

@theme {
  --font-sans: var(--font-sans);
  --font-display: var(--font-display);
  --color-background: var(--site-background);
  --color-foreground: var(--site-foreground);
  --color-accent: var(--site-accent);
  --color-muted: var(--site-muted);
  --radius-lg: ${radius}px;
}

:root {
  --site-background: #f8fafc;
  --site-foreground: ${dark.background};
  --site-accent: ${dark.accent};
  --site-muted: #475569;
}

.dark {
  --site-background: ${dark.background};
  --site-foreground: ${dark.foreground};
  --site-accent: ${dark.accent};
  --site-muted: ${dark.muted};
}

@media (prefers-color-scheme: dark) {
  :root:not(.light) {
    --site-background: ${dark.background};
    --site-foreground: ${dark.foreground};
    --site-accent: ${dark.accent};
    --site-muted: ${dark.muted};
  }
}

html,
body {
  min-height: 100%;
}
`,
    },
    {
      path: "app/layout.tsx",
      language: "tsx",
      contents: `import type { Metadata } from "next";
import { ${sans}, ${display} } from "next/font/google";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { siteMetadata } from "@/lib/site/metadata";
import "./globals.css";

const sans = ${sans}({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const display = ${display}({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = siteMetadata();

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="${content.locale}" className={\`\${sans.variable} \${display.variable} dark h-full antialiased\`} suppressHydrationWarning>
      <body className="min-h-full bg-background font-sans text-foreground">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-accent focus:px-4 focus:py-2 focus:text-background"
        >
          Skip to content
        </a>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
`,
    },
    {
      path: "next.config.ts",
      language: "ts",
      contents: `import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
`,
    },
  ];
}

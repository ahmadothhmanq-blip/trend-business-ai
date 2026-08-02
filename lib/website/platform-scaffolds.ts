import type { GeneratedProjectFile } from "@/lib/ai/types";

function languageForPath(filePath: string): GeneratedProjectFile["language"] {
  if (filePath.endsWith(".tsx")) return "tsx";
  if (filePath.endsWith(".ts")) return "typescript";
  if (filePath.endsWith(".css")) return "css";
  if (filePath.endsWith(".json")) return "json";
  if (filePath.endsWith(".md")) return "markdown";
  return "text";
}

/**
 * Production shell files required for export validation and standalone Next.js builds.
 * Injected only when missing — never overwrites generated or user-edited content.
 */
export function buildPlatformProductionScaffolds(
  projectName = "generated-website",
): GeneratedProjectFile[] {
  const safeName = projectName.trim() || "generated-website";
  const description = `Welcome to ${safeName}`;

  const templates: Array<{ path: string; content: string }> = [
    {
      path: "app/layout.tsx",
      content: `import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: ${JSON.stringify(safeName)},
  description: ${JSON.stringify(description)},
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
`,
    },
    {
      path: "app/not-found.tsx",
      content: `import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-slate-600">
        The page you requested does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
      >
        Return home
      </Link>
    </main>
  );
}
`,
    },
    {
      path: "app/loading.tsx",
      content: `export default function Loading() {
  return (
    <div
      className="flex min-h-[40vh] items-center justify-center text-sm text-slate-500"
      aria-busy="true"
      aria-live="polite"
    >
      Loading…
    </div>
  );
}
`,
    },
    {
      path: "app/error.tsx",
      content: `"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="text-slate-600">
        {error.message || "An unexpected error occurred."}
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
      >
        Try again
      </button>
    </main>
  );
}
`,
    },
    {
      path: "lib/seo.ts",
      content: `export const siteName = ${JSON.stringify(safeName)};
export const siteDescription = ${JSON.stringify(description)};

export function buildPageTitle(pageTitle?: string) {
  return pageTitle ? \`\${pageTitle} | \${siteName}\` : siteName;
}
`,
    },
    {
      path: "components/ui/button.tsx",
      content: `import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
}

export function Button({
  className,
  variant = "default",
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:pointer-events-none disabled:opacity-50",
        variant === "default"
          ? "bg-slate-900 text-white hover:bg-slate-800"
          : "",
        variant === "outline"
          ? "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
          : "",
        variant === "ghost" ? "text-slate-900 hover:bg-slate-100" : "",
        className ?? "",
      )}
      {...props}
    />
  );
}
`,
    },
    {
      path: "components/ui/card.tsx",
      content: `import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white p-6 shadow-sm",
        className ?? "",
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-4 space-y-1", className ?? "")} {...props} />;
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-lg font-semibold text-slate-900", className ?? "")} {...props} />
  );
}

export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-slate-600", className ?? "")} {...props} />
  );
}

export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("", className ?? "")} {...props} />;
}
`,
    },
    {
      path: "components/ui/input.tsx",
      content: `import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className, type = "text", ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-50",
        className ?? "",
      )}
      {...props}
    />
  );
}
`,
    },
  ];

  return templates.map((file) => ({
    path: file.path,
    content: file.content,
    language: languageForPath(file.path),
  }));
}

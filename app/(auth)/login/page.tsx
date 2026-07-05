import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Sign In",
  description:
    "Sign in to Trend Business AI to access your dashboard, AI tools, and business insights.",
  path: "/login",
});

type LoginPageProps = {
  searchParams: Promise<{ redirect?: string; error?: string; message?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <div className="absolute right-4 top-4">
        <ThemeToggle variant="outline" />
      </div>

      <div className="pointer-events-none absolute inset-0 hero-grid opacity-30" />

      <LoginForm redirect={params.redirect} />

      {params.message === "confirm-email" && (
        <p className="mt-4 text-sm text-emerald-600 dark:text-emerald-400" role="status">
          Check your email to confirm your account before signing in.
        </p>
      )}

      {params.error && (
        <p className="mt-4 text-sm text-destructive" role="alert">
          Authentication failed. Please try again.
        </p>
      )}

      <Link
        href="/"
        className="mt-8 text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back to home
      </Link>
    </div>
  );
}

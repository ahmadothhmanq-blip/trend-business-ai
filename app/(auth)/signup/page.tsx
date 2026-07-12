import type { Metadata } from "next";
import Link from "next/link";
import { SignUpForm } from "@/components/auth/signup-form";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Create Account",
  description:
    "Create your Trend Business AI account and start building with AI-powered business tools.",
  path: "/signup",
  noIndex: true,
});

export default function SignUpPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <div className="absolute right-4 top-4">
        <ThemeToggle variant="outline" />
      </div>

      <div className="pointer-events-none absolute inset-0 hero-grid opacity-30" />

      <SignUpForm />

      <Link
        href="/"
        className="mt-8 text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back to home
      </Link>
    </div>
  );
}

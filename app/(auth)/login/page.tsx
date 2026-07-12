import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Sign In",
  description:
    "Sign in to Trend Business AI to access your dashboard, AI tools, and business insights.",
  path: "/login",
  noIndex: true,
});

type LoginPageProps = {
  searchParams: Promise<{ redirect?: string; error?: string; message?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <>
      <LoginForm redirect={params.redirect} />

      {params.message === "confirm-email" && (
        <p className="mt-4 text-sm text-emerald-400" role="status">
          Check your email to confirm your account before signing in.
        </p>
      )}

      {params.error && (
        <p className="mt-4 text-sm text-red-400" role="alert">
          Authentication failed. Please try again.
        </p>
      )}
    </>
  );
}

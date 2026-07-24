import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { LoginStatusMessages } from "@/components/auth/login-status-messages";
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
      <LoginStatusMessages message={params.message} error={params.error} />
    </>
  );
}

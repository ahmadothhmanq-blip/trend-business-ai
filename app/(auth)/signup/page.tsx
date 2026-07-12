import type { Metadata } from "next";
import { SignUpForm } from "@/components/auth/signup-form";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Create Account",
  description:
    "Create your Trend Business AI account and start building with AI-powered business tools.",
  path: "/signup",
  noIndex: true,
});

export default function SignUpPage() {
  return <SignUpForm />;
}

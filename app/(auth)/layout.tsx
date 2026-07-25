import { SiteBackground } from "@/components/marketing/site/background";
import { AuthLayoutChrome } from "@/components/auth/auth-layout-chrome";

/** Visual-only auth chrome — authentication logic unchanged. */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col bg-[#050505] text-white">
      <SiteBackground />
      <AuthLayoutChrome>{children}</AuthLayoutChrome>
    </div>
  );
}

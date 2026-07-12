import Link from "next/link";
import { SiteBackground } from "@/components/marketing/site/background";
import { MouseProvider } from "@/components/marketing/site/mouse";
import { OfficialLogo } from "@/components/marketing/official-logo";

/** Visual-only auth chrome — authentication logic unchanged. */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MouseProvider>
      <div className="relative flex min-h-screen flex-col bg-[#050505] text-white">
        <SiteBackground />
        <header className="relative z-10 px-3 pt-3 sm:px-5 sm:pt-4">
          <div className="mx-auto flex h-[58px] max-w-[1180px] items-center justify-between rounded-full border border-[rgba(212,175,55,0.22)] bg-[rgba(17,17,17,0.9)] px-4 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:h-[64px] sm:px-5">
            <Link href="/" className="flex items-center gap-2.5" aria-label="Trend Business AI home">
              <OfficialLogo compact size="sm" />
              <span className="text-[14px] font-semibold tracking-[-0.02em] sm:text-[15px]">
                <span className="text-white">Trend Business </span>
                <span className="text-[#D4AF37]">AI</span>
              </span>
            </Link>
            <Link
              href="/"
              className="text-[13px] font-medium text-white/70 transition-colors hover:text-white"
            >
              ← Back to home
            </Link>
          </div>
        </header>
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-12">
          {children}
        </div>
      </div>
    </MouseProvider>
  );
}
